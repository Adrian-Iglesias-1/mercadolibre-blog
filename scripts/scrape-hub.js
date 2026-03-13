const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

puppeteer.use(StealthPlugin());

// Configuración unificada
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1eZ_ql4KR4TZf0rjpB3olUgNhkSFr2SQV4PR-_9K7tpI';
const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || null; // En GitHub Actions esto DEBE ser null o venir del sistema
const USER_DATA_DIR = process.env.USER_DATA_DIR || path.join(__dirname, 'session_data');
const CREDENTIALS_PATH = path.join(__dirname, '..', 'google-credentials.json');

const URL_HUB = 'https://www.mercadolibre.com.ar/afiliados/hub#menu-user';
const MAX_PRODUCTOS = 100;

// ─── UTILIDADES ───────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function limpiarPrecio(precio) {
  if (!precio) return '0';
  return precio.replace(/\./g, '').replace(',', '.').trim();
}

// ─── SCROLL HASTA CARGAR N PRODUCTOS ─────────────────────

async function scrollHastaCargarProductos(page, cantidad) {
  console.log(`📜 Recolectando links mientras scrollea (virtualización detectada)...`);

  const linksAcumulados = new Set();
  let sinCambios = 0;
  const maxSinCambios = 8;

  while (linksAcumulados.size < cantidad && sinCambios < maxSinCambios) {
    const linksVisibles = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('a.poly-component__title')
      )
        .map(a => a.href.split('?')[0])
        .filter(href => href.includes('/MLA'));
    });

    const antesSize = linksAcumulados.size;
    linksVisibles.forEach(l => linksAcumulados.add(l));

    if (linksAcumulados.size === antesSize) {
      sinCambios++;
    } else {
      sinCambios = 0;
    }

    await page.evaluate(() => window.scrollBy(0, 800));
    await sleep(2500);
    console.log(`🔎 Links: ${linksAcumulados.size} / ${cantidad}`);
  }

  return Array.from(linksAcumulados);
}

// ─── PROCESAR UN PRODUCTO ──────────────────────────────

async function procesarProducto(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);

    const data = await page.evaluate(() => {
      const nombre = document.querySelector('h1.ui-pdp-title')?.innerText || '';
      const precio = document.querySelector('.ui-pdp-price__main-container .andes-money-amount__fraction')?.innerText || '';
      const imagen = document.querySelector('.ui-pdp-gallery__figure__image')?.src || '';
      const categoria = document.querySelector('.and-breadcrumb__item:last-child')?.innerText || 
                        document.querySelector('.ui-pdp-breadcrumb__link:last-child')?.innerText || '';
      const vendidos = document.querySelector('.ui-pdp-header__subtitle')?.innerText?.split(' ')[0] || '';

      return { nombre, precio, imagen, categoria, vendidos };
    });

    return {
      ...data,
      urlOriginal: url,
      linkAfiliado: url,
      fechaCaptura: new Date().toISOString()
    };
  } catch (e) {
    console.error(`❌ Error procesando ${url}: ${e.message}`);
    return null;
  }
}

// ─── GUARDAR EN GOOGLE SHEETS ─────────────────────────────

async function guardarEnSheets(resultados) {
  console.log(`\n📊 Guardando ${resultados.length} productos en Google Sheets...`);

  let creds;
  if (fs.existsSync(CREDENTIALS_PATH)) {
    creds = require(CREDENTIALS_PATH);
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    creds = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else {
    throw new Error(`No se encontraron credenciales de Google (archivo o variables de entorno)`);
  }

  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  await sheet.clear();
  await sheet.setHeaderRow([
    'Nombre',
    'Precio',
    'URL Original',
    'Link Afiliado',
    'Imagen',
    'Categoría',
    'Vendidos',
    'Fecha Captura',
  ]);

  const filas = resultados.map(r => ({
    'Nombre': r.nombre,
    'Precio': r.precio,
    'URL Original': r.urlOriginal,
    'Link Afiliado': r.linkAfiliado,
    'Imagen': r.imagen,
    'Categoría': r.categoria,
    'Vendidos': r.vendidos,
    'Fecha Captura': r.fechaCaptura,
  }));

  await sheet.addRows(filas);
  console.log('💾 ¡Guardado exitoso en Google Sheets!');
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────

async function main() {
  const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'production';
  
  const launchOptions = {
    headless: isCI ? 'new' : false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1366,768'
    ],
  };

  // Solo usamos CHROME_PATH si existe (en local Windows), si no dejamos que puppeteer lo encuentre
  if (CHROME_PATH) {
    launchOptions.executablePath = CHROME_PATH;
  }
  
  if (!isCI) {
    launchOptions.userDataDir = USER_DATA_DIR;
  }

  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);

  const resultados = [];

  console.log('🚀 Iniciando scraper de Más Vendidos...');
  try {
    await page.goto(URL_HUB, { waitUntil: 'networkidle2' });

    console.log("🖱️ Seleccionando 'Más vendidos' (Tenes 60 segundos para loguearte si es necesario)...");
    const botonMasVendidos = await page.waitForSelector(
      'xpath/.//button[contains(., "Más vendidos")]',
      { visible: true, timeout: 60000 }
    );
    await botonMasVendidos.click();
    await sleep(4000);

    const links = await scrollHastaCargarProductos(page, MAX_PRODUCTOS);

    if (links.length === 0) {
      throw new Error('No se encontraron productos después del scroll');
    }

    console.log(`\n🎯 Procesando ${links.length} productos...\n`);

    for (let i = 0; i < links.length; i++) {
      console.log(`\n[${i + 1}/${links.length}]`);
      const resultado = await procesarProducto(page, links[i]);
      if (resultado) {
        resultados.push(resultado);
      }

      if ((i + 1) % 10 === 0 && i + 1 < links.length) {
        console.log('\n⏸️  Pausa de 5s para evitar detección...');
        await sleep(5000);
      }
    }

    if (resultados.length > 0) {
      await guardarEnSheets(resultados);
      console.log(`\n✅ PROCESO COMPLETO: ${resultados.length} productos guardados.`);
    } else {
      console.log('\n⚠️ No se obtuvieron resultados.');
    }
  } catch (e) {
    console.error(`\n❌ ERROR EN EL PROCESO: ${e.message}`);
  } finally {
    await browser.close();
  }
}

main();
