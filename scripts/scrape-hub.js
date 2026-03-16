const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

puppeteer.use(StealthPlugin());

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1eZ_ql4KR4TZf0rjpB3olUgNhkSFr2SQV4PR-_9K7tpI';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(__dirname, 'session_data');
const URL_HUB = 'https://www.mercadolibre.com.ar/afiliados/hub#menu-user';
const MAX_PRODUCTOS = 100;
const PRODUCTS_JSON_PATH = path.join(__dirname, '..', 'content', 'products.json');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── UTILIDADES ───────────────────────────────────────────

const categoryDefinitions = {
  'tecnologia': { name: 'Tecnología', icon: '💻' },
  'perfumes': { name: 'Perfumes', icon: '🌸' },
  'hogar': { name: 'Hogar', icon: '🏠' },
  'gaming': { name: 'Gaming', icon: '🎮' },
  'electrodomesticos': { name: 'Pequeños Electrodomésticos', icon: '🍳' },
  'blog': { name: 'Blog', icon: '📝' },
  'varios': { name: 'Varios', icon: '📦' }
};

function formatCategory(rawCategory) {
  const id = rawCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  
  if (categoryDefinitions[id]) {
    return { id, ...categoryDefinitions[id] };
  }

  // Fallback: Capitalizar cada palabra
  const name = rawCategory === '...' ? 'Varios' : rawCategory.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  return { id, name, icon: '📦' };
}

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

// ─── EXTRAER CATEGORÍA DESDE BREADCRUMB ──────────────────

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
    let affiliateLinkGenerated = false;

    const responseHandler = async (response) => {
      const resUrl = response.url();
      if (
        resUrl.includes('shortener') ||
        resUrl.includes('affiliate') ||
        resUrl.includes('meli.la') ||
        resUrl.includes('short_url')
      ) {
        // Asegurarse de que la respuesta sea OK y no esté vacía antes de procesar
        if (!response.ok()) {
            return;
        }
        try {
          const json = await response.json();
          // Buscar explícitamente el short_url, que es lo que nos interesa
          const foundLink = json?.short_url || json?.url || json?.link || json?.data?.url;

          if (foundLink) {
            linkFinal = foundLink;
            affiliateLinkGenerated = true;
            console.log(`   🎉 ¡Link de afiliado extraído de la API!: ${linkFinal}`);
          }
        } catch (e) {
            // Este catch ahora solo se activará si el JSON es realmente inválido, lo cual es raro.
            // Lo ignoramos de forma segura porque no interrumpe el flujo principal.
        }
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
      console.log('   ⏳ Buscando botón para generar link...');
      await page.waitForSelector('button[data-testid="generate_link_button"]', {
        visible: true,
        timeout: 8000,
      });
      console.log('   🖱️ Click en "Generar link"...');
      await page.click('button[data-testid="generate_link_button"]');
      await sleep(2500);

      // A menudo, el link ya se generó. Este segundo click a veces es necesario y a veces no.
      // Le damos un tiempo para que la llamada de red se complete.
      console.log('   ...esperando posible generación de link por API.');
      
    } catch (e) {
      console.log(`   ⚠️ No se pudo encontrar/clickear el botón de generar link: ${e.message}`);
    }

    page.off('response', responseHandler);

    if (!linkFinal) {
      console.log('   🟡 No se detectó link de API. Usando fallback.');
      linkFinal = `${url}?matt_tool=39858519&matt_word=ji2014`;
    } else {
      console.log('   🟢 Link de afiliado procesado correctamente.');
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
  if (resultados.length === 0) return;
  console.log(`\n📊 Guardando ${resultados.length} productos nuevos en Google Sheets...`);

  // Usamos la ruta que sabemos que existe en el proyecto
  const creds = require('../google-credentials.json');
  const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  // IMPORTANTE: Ya no limpiamos el sheet para no borrar lo anterior
  // Si la hoja está vacía, ponemos los headers
  const rows = await sheet.getRows();
  if (rows.length === 0) {
    await sheet.setHeaderRow([
      'Nombre', 'Precio', 'URL Original', 'Link Afiliado', 'Imagen', 'Categoría', 'Vendidos', 'Fecha Captura'
    ]);
  }

  const filas = resultados.map(r => ([
    r.nombre, r.precio, r.urlOriginal, r.linkAfiliado, r.imagen, r.categoria, r.vendidos, r.fechaCaptura
  ]));

  await sheet.addRows(filas);
  console.log('💾 ¡Anexado exitoso en Google Sheets!');

  // --- NUEVO: GUARDAR EN JSON LOCAL ---
  try {
    let allProducts = [];
    if (fs.existsSync(PRODUCTS_JSON_PATH)) {
      const existingData = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');
      allProducts = JSON.parse(existingData || '[]');
    }

    // Mapear resultados al formato que usa la app
    const nuevosEnJson = resultados.map((r, index) => {
      const cat = formatCategory(r.categoria);
      return {
        id: `scraped-${Date.now()}-${index}`,
        title: r.nombre,
        price: r.precio,
        productUrl: r.linkAfiliado,
        imageUrl: r.imagen,
        category: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          slug: cat.id
        },
        brand: r.nombre.split(' ')[0] || 'Genérico',
        soldCount: r.vendidos,
        dateAdded: r.fechaCaptura
      };
    });

    // Combinar y filtrar duplicados finales por URL
    const combined = [...nuevosEnJson, ...allProducts];
    const uniqueMap = new Map();
    combined.forEach(p => {
      const cleanUrl = p.productUrl.split('?')[0];
      if (!uniqueMap.has(cleanUrl)) {
        uniqueMap.set(cleanUrl, p);
      }
    });

    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(Array.from(uniqueMap.values()), null, 2));
    console.log(`💾 ¡${nuevosEnJson.length} productos guardados en products.json!`);

    // --- NUEVO: GUARDAR EN SUPABASE ---
    const supabaseData = resultados.map((r, index) => {
      const cat = formatCategory(r.categoria);
      return {
        id: `scraped-${Date.now()}-${index}`,
        title: r.nombre,
        price: parseFloat(r.precio) || 0,
        product_url: r.linkAfiliado,
        image_url: r.imagen,
        category_id: cat.id,
        category_name: cat.name,
        category_icon: cat.icon,
        category_slug: cat.id,
        brand: r.nombre.split(' ')[0] || 'Genérico',
        sold_count: r.vendidos
      };
    });

    const { error: sbError } = await supabase
      .from('products')
      .upsert(supabaseData, { onConflict: 'product_url' });

    if (sbError) {
      console.error('❌ Error subiendo a Supabase:', sbError.message);
    } else {
      console.log(`🚀 ¡${supabaseData.length} productos sincronizados con Supabase!`);
    }

  } catch (error) {
    console.error('❌ Error guardando en JSON/Supabase:', error.message);
  }
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────

async function main() {
  // 1. Obtener URLs ya existentes para no repetir
  const creds = require('../google-credentials.json');
  const auth = new JWT({ email: creds.client_email, key: creds.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  
  // Priorizamos las URLs del JSON local si existe
  let urlsExistentes = new Set();
  if (fs.existsSync(PRODUCTS_JSON_PATH)) {
    const localData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8') || '[]');
    localData.forEach(p => urlsExistentes.add(p.productUrl.split('?')[0]));
  }
  
  // También sumamos las de la sheet por seguridad
  rows.forEach(row => {
    const url = row.get('URL Original') || row.get('Link Afiliado');
    if (url) urlsExistentes.add(url.split('?')[0]);
  });
  
  // NUEVO: Sumar las de Supabase
  const { data: sbData, error: sbError } = await supabase
    .from('products')
    .select('product_url');
  
  if (!sbError && sbData) {
    sbData.forEach(p => urlsExistentes.add(p.product_url.split('?')[0]));
  }
  
  console.log(`✅ Ya tienes ${urlsExistentes.size} productos en total (Local + Sheets + Supabase).`);

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_PATH,
    userDataDir: USER_DATA_DIR,
    args: ['--no-sandbox', '--window-size=1366,768'],
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);

  const resultados = [];

  console.log('🚀 Iniciando scraper de Más Vendidos...');
  try {
    await page.goto(URL_HUB, { waitUntil: 'networkidle2' });

    console.log("🖱️ Seleccionando 'Más vendidos'...");
    const botonMasVendidos = await page.waitForSelector(
      'xpath/.//button[contains(., "Más vendidos")]',
      { visible: true, timeout: 15000 }
    );
    await botonMasVendidos.click();
    await sleep(4000);

    const links = await scrollHastaCargarProductos(page, MAX_PRODUCTOS);

    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      const urlLimpia = url.split('?')[0];

      // VALIDACIÓN: Si ya existe en la sheet, lo saltamos
      if (urlsExistentes.has(urlLimpia)) {
        console.log(`⏭️ Saltando (ya existe): ${urlLimpia}`);
        continue;
      }

      const resultado = await procesarProducto(page, url);
      if (resultado) {
        resultados.push(resultado);
      }

      if (resultados.length >= 50) break; // Límite de seguridad por sesión

      if ((i + 1) % 10 === 0 && i + 1 < links.length) {
        await sleep(5000);
      }
    }

    if (resultados.length > 0) {
      await guardarEnSheets(resultados);
      console.log(`\n✅ PROCESO COMPLETO: ${resultados.length} productos nuevos agregados.`);
    } else {
      console.log('\n😴 No se encontraron productos nuevos para agregar.');
    }

  } catch (e) {
    console.log(`\n❌ ERROR CRÍTICO: ${e.message}`);
  }

  await browser.close();
}

main();
