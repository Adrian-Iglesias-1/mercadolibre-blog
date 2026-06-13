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

async function leerPrecioActual(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(800);

    const precioTexto = await page.evaluate(() => {
      const el =
        document.querySelector('.ui-pdp-price__second-line .andes-money-amount__fraction') ||
        document.querySelector('.ui-pdp-price__main-container .andes-money-amount__fraction') ||
        document.querySelector('[class*="price__main"] .andes-money-amount__fraction') ||
        document.querySelector('.ui-pdp-price .andes-money-amount__fraction') ||
        document.querySelector('.andes-money-amount__fraction');
      return el?.innerText || null;
    });

    return limpiarPrecio(precioTexto);
  } catch (err) {
    console.log(`   ❌ Error leyendo precio: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('📦 Cargando catálogo desde Supabase...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, product_url, title, price');

  if (error) {
    console.error('❌ Error leyendo products:', error.message);
    return;
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

  // Abrimos el hub para confirmar que la sesión sigue logueada
  await page.goto(HUB_URL, { waitUntil: 'domcontentloaded' });
  await esperarEnter('\n👉 Si la página te pide login, iniciá sesión ahora en la ventana de Chrome.\n   Cuando estés logueado, volvé acá y presioná ENTER para arrancar el snapshot de precios...\n');

  const filas = [];
  let ok = 0;
  let fallidos = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${p.title?.slice(0, 60)}`);

    const precio = await leerPrecioActual(page, p.product_url);

    if (precio !== null) {
      filas.push({ product_url: p.product_url, price: precio });
      console.log(`   💰 Precio actual: $${precio} (registrado: $${p.price})`);
      ok++;
    } else {
      console.log('   ⚠️ No se pudo leer el precio, se omite.');
      fallidos++;
    }

    // Guardamos en lotes de 25 para no perder progreso si se corta a mitad de camino
    if (filas.length >= 25) {
      await guardarLote(filas.splice(0, filas.length));
    }

    await sleep(1500);
  }

  if (filas.length > 0) {
    await guardarLote(filas);
  }

  console.log(`\n✅ Snapshot completo: ${ok} precios guardados, ${fallidos} fallidos.`);
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
