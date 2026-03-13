const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

puppeteer.use(StealthPlugin());

// Configuración unificada
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1eZ_ql4KR4TZf0rjpB3olUgNhkSFr2SQV4PR-_9K7tpI';
const CHROME_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
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

    console.log(`   → Acumulados: ${linksAcumulados.size}/${cantidad} (visibles ahora: ${linksVisibles.length})`);

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1800);
  }

  const links = [...linksAcumulados].slice(0, cantidad);
  console.log(`✅ Total links únicos recolectados: ${links.length}`);
  return links;
}

function extraerCategoria(breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length === 0) return 'Sin categoría';
  if (breadcrumbs.length >= 2) return breadcrumbs[1];
  return breadcrumbs[0];
}

// ─── PROCESAR UN PRODUCTO ─────────────────────────────────

async function procesarProducto(page, url) {
  try {
    console.log(`\n📦 Procesando: ${url.split('/').pop()}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    let linkFinal = null;

    const responseHandler = async (response) => {
      const resUrl = response.url();
      if (
        resUrl.includes('shortener') ||
        resUrl.includes('affiliate') ||
        resUrl.includes('meli.la') ||
        resUrl.includes('short_url')
      ) {
        try {
          const json = await response.json();
          linkFinal =
            json?.short_url ||
            json?.url ||
            json?.link ||
            json?.data?.url ||
            null;
        } catch (_) {}
      }
    };

    page.on('response', responseHandler);

    const datos = await page.evaluate(() => {
      const nombre =
        document.querySelector('h1.ui-pdp-title')?.innerText ||
        document.querySelector('h1')?.innerText ||
        'Producto';

      const precio = (
        document.querySelector('.ui-pdp-price__second-line .andes-money-amount__fraction') ||
        document.querySelector('.ui-pdp-price__main-container .andes-money-amount__fraction') ||
        document.querySelector('[class*="price__main"] .andes-money-amount__fraction') ||
        document.querySelector('.ui-pdp-price .andes-money-amount__fraction') ||
        document.querySelector('.andes-money-amount__fraction')
      )?.innerText || '0';

      const img =
        document.querySelector('.ui-pdp-gallery__figure__image')?.src ||
        document.querySelector('.ui-pdp-image')?.src ||
        document.querySelector('figure img')?.src ||
        null;

      const breadcrumbEls = Array.from(
        document.querySelectorAll(
          '.andes-breadcrumb__item, .ui-vip-breadcrumb__item, nav[aria-label="breadcrumb"] li'
        )
      );
      const breadcrumbs = breadcrumbEls
        .map(el => el.innerText?.trim())
        .filter(Boolean);

      const vendidos =
        document.querySelector('.ui-pdp-subtitle')?.innerText ||
        document.querySelector('[class*="sold"]')?.innerText ||
        '';

      return { nombre, precio, img, breadcrumbs, vendidos };
    });

    const categoria = extraerCategoria(datos.breadcrumbs);

    try {
      await page.waitForSelector('button[data-testid="generate_link_button"]', {
        visible: true,
        timeout: 8000,
      });
      await page.click('button[data-testid="generate_link_button"]');
      await sleep(2500);

      await page.waitForSelector('button[aria-label="Link del producto"]', {
        visible: true,
        timeout: 5000,
      });
      await page.click('button[aria-label="Link del producto"]');
      await sleep(1500);
    } catch (e) {
      console.log(`   ⚠️ No se pudo generar link de afiliado automáticamente.`);
    }

    page.off('response', responseHandler);

    if (!linkFinal) {
      linkFinal = `${url}?matt_tool=39858519&matt_word=ji2014`;
    }

    const resultado = {
      nombre: datos.nombre,
      precio: limpiarPrecio(datos.precio),
      urlOriginal: url,
      linkAfiliado: linkFinal,
      imagen: datos.img || '',
      categoria: categoria,
      vendidos: datos.vendidos,
      fechaCaptura: new Date().toLocaleDateString('es-AR'),
    };

    console.log(`   ✅ ${datos.nombre.slice(0, 50)} | ${categoria}`);
    return resultado;

  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
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

  // Usamos clear() pero restablecemos el header inmediatamente para evitar que la web se rompa
  // google-spreadsheet v4 clear() borra todo. 
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
  
  const browser = await puppeteer.launch({
    headless: isCI ? 'new' : false,
    executablePath: CHROME_PATH,
    userDataDir: isCI ? null : USER_DATA_DIR, // No persistir datos de sesión en CI para evitar bloqueos
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1366,768'
    ],
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);

  const resultados = [];

  console.log('🚀 Iniciando scraper de Más Vendidos...');
  await page.goto(URL_HUB, { waitUntil: 'networkidle2' });

  try {
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
    console.log(`\n❌ ERROR CRÍTICO: ${e.message}`);
    if (resultados.length > 0) {
      console.log(`💾 Guardando ${resultados.length} resultados parciales...`);
      await guardarEnSheets(resultados);
    }
  }

  await browser.close();
}

main();
