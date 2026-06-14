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

// Match ESTRICTO (exacto o prefijo): se usa cuando seguimos el storefront y
// estamos adivinando el producto. Conservador para no guardar precio equivocado.
function tituloCoincideEstricto(a, b) {
  const x = normalizarTitulo(a);
  const y = normalizarTitulo(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (x.length >= 25 && y.length >= 25 && (x.startsWith(y) || y.startsWith(x))) return true;
  return false;
}

// Match TOLERANTE (solapamiento de palabras): se usa cuando ya estamos en una
// URL confiable (source_url verificada). ML a veces reordena o edita el título
// con el tiempo ("Suplemento Creatina Ena" → "Creatina Ena 300g"), así que
// comparamos por palabras significativas en vez de exigir coincidencia literal.
// Sigue rechazando productos completamente distintos (404/redirect a otra cosa).
function tituloParecido(a, b) {
  const x = normalizarTitulo(a);
  const y = normalizarTitulo(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const wa = new Set(x.split(' ').filter(w => w.length >= 3));
  const wb = new Set(y.split(' ').filter(w => w.length >= 3));
  if (wa.size === 0 || wb.size === 0) return false;
  let comunes = 0;
  for (const w of wa) if (wb.has(w)) comunes++;
  const ratio = comunes / Math.min(wa.size, wb.size);
  return comunes >= 3 || ratio >= 0.6;
}

// ─── RESOLVER LA URL REAL DEL PRODUCTO ────────────────────
// Solo usamos source_url (la URL real, verificada, que guarda el scraper).
// El fallback de seguir el link de afiliado se eliminó: headless cae siempre
// en el storefront genérico del afiliado (mostraba la "Rampa Perros" para
// todos), nunca el producto específico → puro desperdicio de tiempo.
// Para poblar source_url en productos viejos, re-scrapealos (npm run scrape).
async function resolverUrlReal(page, prod) {
  if (prod.source_url && /MLA/i.test(prod.source_url)) {
    return { url: prod.source_url, confianza: 'source' };
  }
  return { url: null, confianza: 'none' };
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

  console.log('🔖 snapshot-prices v5 — solo source_url (sin storefront)');
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
  let ok = 0;
  let fallidos = 0;
  let descartados = 0;
  let sinSource = 0;

  // Procesamos primero los que tienen source_url (los demás se saltean al
  // instante, no tiene sentido abrir el navegador en ellos).
  const conSource = products.filter((p) => p.source_url && /MLA/i.test(p.source_url));
  sinSource = products.length - conSource.length;
  console.log(`📍 ${conSource.length} con source_url (se procesan) · ${sinSource} sin source_url (se saltean — re-scrapealos para poblarlo)\n`);

  for (let i = 0; i < conSource.length; i++) {
    const p = conSource[i];
    console.log(`\n[${i + 1}/${conSource.length}] ${p.title?.slice(0, 55)}`);

    try {
      const { url: urlReal, confianza } = await resolverUrlReal(page, p);
      if (!urlReal) {
        console.log('   ⚠️ Sin URL real, se omite.');
        fallidos++;
        continue;
      }

      const { nombre, precio } = await leerProducto(page, urlReal);
      const precioNum = limpiarPrecio(precio);

      // Red de seguridad: el título leído debe parecerse al guardado. Usamos
      // match tolerante (solapamiento de palabras) en todos los casos: el
      // storefront lee el producto correcto pero ML reordena/edita el título.
      // tituloParecido igual rechaza productos distintos (freezer != rampa).
      if (!tituloParecido(nombre, p.title)) {
        console.log(`   🚫 Título no coincide (${nombre?.slice(0, 40)}) [${confianza}]. Se descarta.`);
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

    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      fallidos++;
    }

    if (filas.length >= 25) {
      await guardarLote(filas.splice(0, filas.length));
    }

    await sleep(1200);
  }

  if (filas.length > 0) await guardarLote(filas);

  console.log(`\n✅ Snapshot completo: ${ok} guardados, ${descartados} descartados por título, ${fallidos} fallidos, ${sinSource} sin source_url (salteados).`);
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

main();
