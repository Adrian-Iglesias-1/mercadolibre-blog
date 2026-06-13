const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

puppeteer.use(StealthPlugin());

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(__dirname, 'session_data');
const HUB_URL = 'https://www.mercadolibre.com.ar/afiliados/hub#menu-user';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'es-AR,es;q=0.9',
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function esperarEnter(mensaje) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(mensaje, () => {
      rl.close();
      resolve();
    });
  });
}

function limpiarPrecio(precio) {
  if (!precio) return null;
  const limpio = precio.replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(limpio);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function extraerMlaId(url) {
  if (!url) return null;
  const m = url.match(/MLA-?(\d+)/i);
  return m ? 'MLA' + m[1] : null;
}

function normalizarTitulo(t) {
  if (!t) return '';
  return t.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
}

// ¿El título leído coincide con el que tenemos guardado? (exacto o tolerante a
// recorte). Es la red de seguridad: si no coincide, NO guardamos el precio,
// porque significa que terminamos en la página equivocada.
function tituloCoincide(a, b) {
  const x = normalizarTitulo(a);
  const y = normalizarTitulo(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length >= 25 && y.length >= 25 && (x.startsWith(y) || y.startsWith(x))) return true;
  return false;
}

// ─── RESOLVER LA URL REAL DEL PRODUCTO ────────────────────
// Prioridad: source_url guardado → seguir el link de afiliado hasta el producto.
async function resolverUrlReal(page, prod) {
  if (prod.source_url && /MLA/i.test(prod.source_url)) {
    return prod.source_url;
  }

  // Fallback: entrar al link de afiliado (storefront) y extraer el link al
  // producto destacado, igual que cuando el usuario clickea "ir al producto".
  try {
    await page.goto(prod.product_url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const realUrl = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]')).map(a => a.href);
      // Patrones de URL de producto real (no del storefront /social/)
      const esProducto = (h) =>
        !/\/social\//.test(h) &&
        (/\/p\/MLA\d+/i.test(h) || /\/MLA-\d+/i.test(h) || /articulo\.mercadolibre/i.test(h));
      return anchors.find(esProducto) || null;
    });

    return realUrl;
  } catch (err) {
    console.log(`   ⚠️ No se pudo resolver URL real: ${err.message}`);
    return null;
  }
}

// ─── LEER TÍTULO + PRECIO DE LA PÁGINA REAL ───────────────
async function leerProducto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1200);

  return await page.evaluate(() => {
    const nombre =
      document.querySelector('h1.ui-pdp-title')?.innerText ||
      document.querySelector('h1')?.innerText ||
      '';

    const precio = (
      document.querySelector('.ui-pdp-price__second-line .andes-money-amount__fraction') ||
      document.querySelector('.ui-pdp-price__main-container .andes-money-amount__fraction') ||
      document.querySelector('[class*="price__main"] .andes-money-amount__fraction') ||
      document.querySelector('.ui-pdp-price .andes-money-amount__fraction') ||
      document.querySelector('.andes-money-amount__fraction')
    )?.innerText || null;

    return { nombre, precio };
  });
}

async function main() {
  console.log('📦 Cargando catálogo desde Supabase...');
  let products = [];
  let from = 0;
  const size = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, product_url, source_url, mla_id, title, price')
      .range(from, from + size - 1);
    if (error) { console.error('❌ Error leyendo products:', error.message); break; }
    if (!data || data.length === 0) break;
    products = products.concat(data);
    if (data.length < size) break;
    from += size;
  }

  console.log(`✅ ${products.length} productos a revisar.`);

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    userDataDir: USER_DATA_DIR,
    args: ['--no-sandbox', '--window-size=1366,768'],
  });

  const page = await browser.newPage();
  await page.setExtraHTTPHeaders(FETCH_HEADERS);
  await page.setDefaultNavigationTimeout(45000);

  await page.goto(HUB_URL, { waitUntil: 'domcontentloaded' });
  await esperarEnter('\n👉 Si la página te pide login, iniciá sesión ahora en la ventana de Chrome.\n   Cuando estés logueado, volvé acá y presioná ENTER para arrancar el snapshot de precios...\n');

  const filas = [];
  const backfillSource = []; // { id, source_url, mla_id }
  let ok = 0;
  let fallidos = 0;
  let descartados = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${p.title?.slice(0, 55)}`);

    try {
      const urlReal = await resolverUrlReal(page, p);
      if (!urlReal) {
        console.log('   ⚠️ Sin URL real, se omite.');
        fallidos++;
        continue;
      }

      const { nombre, precio } = await leerProducto(page, urlReal);
      const precioNum = limpiarPrecio(precio);

      // Red de seguridad: el título leído debe coincidir con el guardado.
      if (!tituloCoincide(nombre, p.title)) {
        console.log(`   🚫 Título no coincide (${nombre?.slice(0, 40)}). Se descarta para no guardar precio equivocado.`);
        descartados++;
        continue;
      }

      if (precioNum === null) {
        console.log('   ⚠️ No se pudo leer el precio, se omite.');
        fallidos++;
        continue;
      }

      filas.push({ product_url: p.product_url, price: precioNum });
      console.log(`   💰 Precio real: $${precioNum} (registrado: $${p.price})`);
      ok++;

      // Backfill de source_url / mla_id si no lo teníamos
      if (!p.source_url) {
        backfillSource.push({ id: p.id, source_url: urlReal, mla_id: extraerMlaId(urlReal) });
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      fallidos++;
    }

    if (filas.length >= 25) {
      await guardarLote(filas.splice(0, filas.length));
    }
    if (backfillSource.length >= 25) {
      await guardarBackfill(backfillSource.splice(0, backfillSource.length));
    }

    await sleep(1200);
  }

  if (filas.length > 0) await guardarLote(filas);
  if (backfillSource.length > 0) await guardarBackfill(backfillSource);

  console.log(`\n✅ Snapshot completo: ${ok} precios guardados, ${descartados} descartados por título, ${fallidos} fallidos.`);
  await browser.close();
}

async function guardarLote(filas) {
  const { error } = await supabase.from('price_history').insert(filas);
  if (error) {
    console.error(`   ❌ Error guardando lote de ${filas.length} precios:`, error.message);
  } else {
    console.log(`   💾 Lote de ${filas.length} precios guardado en price_history.`);
  }
}

async function guardarBackfill(items) {
  const res = await Promise.all(items.map(it =>
    supabase.from('products').update({ source_url: it.source_url, mla_id: it.mla_id }).eq('id', it.id)
  ));
  const errs = res.filter(r => r.error);
  if (errs.length) {
    if (/source_url|mla_id/i.test(errs[0].error.message)) {
      console.warn('   ⚠️ Falta columna source_url/mla_id. Corré las migraciones en scripts/.');
    } else {
      console.warn(`   ⚠️ ${errs.length} backfills fallaron: ${errs[0].error.message}`);
    }
  } else {
    console.log(`   🩹 source_url backfilleado en ${items.length} productos.`);
  }
}

main();
