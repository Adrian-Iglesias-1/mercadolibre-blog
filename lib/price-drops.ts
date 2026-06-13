import { supabase } from './supabase';

// Flag temporal: la fuente de precios (snapshot vía link de afiliado) no es
// confiable todavía — leía el precio de la página equivocada. Se reactiva
// cuando snapshot-prices.js lea desde source_url (la página real del producto).
export const PRICE_DROPS_ENABLED = false;

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

  const products = await fetchAll<{ product_url: string; price: number }>(
    'products',
    'product_url, price'
  );
  const registered = new Map<string, number>();
  products.forEach((p) => registered.set(p.product_url, Number(p.price) || 0));

  // Agrupar historial por producto (ya viene ordenado asc por captured_at)
  const byProduct = new Map<string, number[]>();
  for (const h of history) {
    const price = Number(h.price);
    if (!Number.isFinite(price) || price <= 0) continue;
    if (!byProduct.has(h.product_url)) byProduct.set(h.product_url, []);
    byProduct.get(h.product_url)!.push(price);
  }

  for (const [url, prices] of byProduct.entries()) {
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
