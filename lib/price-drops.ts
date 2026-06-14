import { supabase } from './supabase';

// Activado: snapshot-prices.js ya lee desde source_url (página real del producto,
// verificado por título) y la lib excluye catálogo /p/. Las bajadas mostradas
// son de items de un único vendedor con precio confiable.
export const PRICE_DROPS_ENABLED = true;

export interface PriceDrop {
  currentPrice: number;   // precio más reciente del historial
  previousPrice: number;  // precio de referencia (pico: registrado o máximo histórico)
  dropPct: number;        // % de baja, redondeado
}

// Trae TODAS las filas de una tabla paginando (Supabase corta en 1000 por query).
async function fetchAll<T>(
  table: string,
  columns: string,
  order?: { column: string; ascending: boolean }
): Promise<T[]> {
  if (!supabase) return [];
  const out: T[] = [];
  const size = 1000;
  let from = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from(table).select(columns).range(from, from + size - 1);
    if (order) query = query.order(order.column, { ascending: order.ascending });
    const { data, error } = await query;
    if (error || !data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < size) break;
    from += size;
  }
  return out;
}

// Devuelve un mapa product_url -> info de bajada, solo para los productos que
// bajaron al menos `minPct`%. Compara el precio más reciente del historial
// contra el precio de referencia (el mayor entre el precio registrado del
// producto y el máximo histórico). Robusto para 1 snapshot o muchos.
export async function getPriceDropsMap(minPct = 5): Promise<Map<string, PriceDrop>> {
  const result = new Map<string, PriceDrop>();
  if (!supabase) return result;

  const history = await fetchAll<{ product_url: string; price: number; captured_at: string }>(
    'price_history',
    'product_url, price, captured_at',
    { column: 'captured_at', ascending: true }
  );
  if (history.length === 0) return result;

  const products = await fetchAll<{ product_url: string; price: number; source_url: string | null }>(
    'products',
    'product_url, price, source_url'
  );
  const registered = new Map<string, number>();
  // Solo consideramos productos "confiables" para bajadas:
  //  - tienen source_url (el precio se leyó de la página real, verificado por título)
  //  - NO son de catálogo (/p/MLA): ahí el precio es del buy-box ganador, que
  //    rota entre vendedores → "bajó X%" engañaría aunque el precio sea correcto.
  const reliable = new Set<string>();
  products.forEach((p) => {
    registered.set(p.product_url, Number(p.price) || 0);
    const src = p.source_url || '';
    if (src && !/\/p\/MLA/i.test(src)) reliable.add(p.product_url);
  });

  // Agrupar historial por producto (ya viene ordenado asc por captured_at)
  const byProduct = new Map<string, number[]>();
  for (const h of history) {
    const price = Number(h.price);
    if (!Number.isFinite(price) || price <= 0) continue;
    if (!byProduct.has(h.product_url)) byProduct.set(h.product_url, []);
    byProduct.get(h.product_url)!.push(price);
  }

  for (const [url, prices] of byProduct.entries()) {
    if (!reliable.has(url)) continue; // solo items de un vendedor con precio verificado
    const current = prices[prices.length - 1];
    const histMax = Math.max(...prices);
    const reference = Math.max(histMax, registered.get(url) || 0);
    if (reference <= 0 || current <= 0 || current >= reference) continue;

    const dropPct = ((reference - current) / reference) * 100;
    if (dropPct >= minPct) {
      result.set(url, {
        currentPrice: current,
        previousPrice: reference,
        dropPct: Math.round(dropPct),
      });
    }
  }

  return result;
}
