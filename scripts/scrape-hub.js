const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

puppeteer.use(StealthPlugin());

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1eZ_ql4KR4TZf0rjpB3olUgNhkSFr2SQV4PR-_9K7tpI';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(__dirname, 'session_data');
const URL_HUB = 'https://www.mercadolibre.com.ar/afiliados/hub#menu-user';
const MAX_PRODUCTOS = 1500; // tope alto: el scroll se detiene solo cuando el hub deja de cargar más
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
  if (!precio) return '0';
  return precio.replace(/\./g, '').replace(',', '.').trim();
}

// Extrae el ID estable de Mercado Libre (ej. "MLA1234567890") desde una URL
// original del hub. Es la clave de deduplicación robusta: el link de afiliado
// (meli.la/xxx) NO contiene este ID, por eso no servía para deduplicar.
function extraerMlaId(url) {
  if (!url) return null;
  const m = url.match(/MLA-?(\d+)/i);
  return m ? 'MLA' + m[1] : null;
}

// Normaliza un título para comparar productos legacy que no tienen mla_id
// guardado (los ~1000 actuales se guardaron solo con su link de afiliado).
function normalizarTitulo(titulo) {
  if (!titulo) return '';
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── SCROLL HASTA CARGAR N PRODUCTOS ─────────────────────

async function scrollHastaCargarProductos(page, cantidad) {
  console.log(`📜 Recolectando links mientras scrollea (virtualización detectada)...`);

  // Acumulamos por URL pero guardamos también el título visible del hub.
  // El ancla `a.poly-component__title` ya trae el título, así podemos
  // deduplicar contra productos legacy SIN visitar la página de cada uno.
  const itemsAcumulados = new Map();
  let sinCambios = 0;
  const maxSinCambios = 8;

  while (itemsAcumulados.size < cantidad && sinCambios < maxSinCambios) {
    const itemsVisibles = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('a.poly-component__title')
      )
        .map(a => ({ url: a.href.split('?')[0], title: (a.innerText || '').trim() }))
        .filter(o => o.url.includes('/MLA'));
    });

    const antesSize = itemsAcumulados.size;
    itemsVisibles.forEach(o => {
      if (!itemsAcumulados.has(o.url)) itemsAcumulados.set(o.url, o);
    });

    if (itemsAcumulados.size === antesSize) {
      sinCambios++;
    } else {
      sinCambios = 0;
    }

    console.log(`   → Acumulados: ${itemsAcumulados.size}/${cantidad} (visibles ahora: ${itemsVisibles.length})`);
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await sleep(1800);
  }

  const items = [...itemsAcumulados.values()].slice(0, cantidad).map(o => ({
    ...o,
    mlaId: extraerMlaId(o.url),
  }));
  console.log(`✅ Total productos únicos recolectados: ${items.length}`);
  return items;
}

// ─── EXTRAER CATEGORÍA DESDE BREADCRUMB ──────────────────

function extraerCategoria(breadcrumbs) {
  if (!breadcrumbs || breadcrumbs.length === 0) return 'Sin categoría';
  if (breadcrumbs.length >= 2) return breadcrumbs[1];
  return breadcrumbs[0];
}

// ─── PROCESAR UN PRODUCTO ─────────────────────────────────

async function procesarProducto(page, url, mlaId = null, buscarExistente = null) {
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
    const idReal = mlaId || extraerMlaId(url);

    // Segundo filtro (definitivo): ya leímos el título REAL del H1, que es el
    // mismo del que salieron los productos guardados. Si coincide, no generamos
    // link ni lo guardamos: solo lo marcamos para backfillear su mla_id. Esto
    // atrapa a los legacy que el listado del hub mostraba con título recortado.
    if (typeof buscarExistente === 'function') {
      const hit = buscarExistente({ mlaId: idReal, title: datos.nombre });
      if (hit) {
        page.off('response', responseHandler);
        console.log(`   ⏭️ Ya existe (match por título H1): ${datos.nombre.slice(0, 50)}`);
        return { existente: true, mlaId: idReal, legacyUrl: hit.product_url || null };
      }
    }

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
      mlaId: mlaId || extraerMlaId(url),
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

// ─── GOOGLE CREDENTIALS (OPCIONAL) ────────────────────────

const GOOGLE_CREDS_PATH = path.join(__dirname, '..', 'google-credentials.json');

function getGoogleAuth() {
  if (!fs.existsSync(GOOGLE_CREDS_PATH)) return null;
  const creds = require(GOOGLE_CREDS_PATH);
  return new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// ─── GUARDAR EN GOOGLE SHEETS (opcional) + JSON + SUPABASE ─

async function guardarEnSheets(resultados) {
  if (resultados.length === 0) return;

  const auth = getGoogleAuth();
  if (auth) {
    console.log(`\n📊 Guardando ${resultados.length} productos nuevos en Google Sheets...`);

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
  } else {
    console.log('\n⏭️ Sin google-credentials.json: se omite Google Sheets, guardamos directo en Supabase.');
  }

  // --- GUARDAR EN JSON LOCAL ---
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
        sourceUrl: r.urlOriginal || null,
        mlaId: r.mlaId || null,
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
        source_url: r.urlOriginal || null,
        mla_id: r.mlaId || null,
        image_url: r.imagen,
        category_id: cat.id,
        category_name: cat.name,
        category_icon: cat.icon,
        category_slug: cat.id,
        brand: r.nombre.split(' ')[0] || 'Genérico',
        sold_count: r.vendidos
      };
    });

    let { error: sbError } = await supabase
      .from('products')
      .upsert(supabaseData, { onConflict: 'product_url' });

    // Compat: si todavía no corriste las migraciones que agregan las columnas
    // mla_id / source_url, reintentamos sin esos campos para no bloquear el guardado.
    if (sbError && /mla_id|source_url/i.test(sbError.message)) {
      console.warn('⚠️ Falta alguna columna (mla_id/source_url) en Supabase. Guardando sin ellas.');
      console.warn('   Corré scripts/add-mla-id-column.sql y scripts/add-source-url-column.sql.');
      const reducido = supabaseData.map(({ mla_id, source_url, ...resto }) => resto);
      ({ error: sbError } = await supabase
        .from('products')
        .upsert(reducido, { onConflict: 'product_url' }));
    }

    if (sbError) {
      console.error('❌ Error subiendo a Supabase:', sbError.message);
    } else {
      console.log(`🚀 ¡${supabaseData.length} productos sincronizados con Supabase!`);
    }

  } catch (error) {
    console.error('❌ Error guardando en JSON/Supabase:', error.message);
  }
}

// ─── BACKFILL DE mla_id EN LEGACY ─────────────────────────

async function backfillMlaIds(backfill) {
  if (!backfill || backfill.size === 0) return;

  const entradas = [...backfill.entries()]; // [product_url, mla_id]
  console.log(`\n🩹 Backfilleando mla_id en ${entradas.length} productos legacy...`);

  let ok = 0;
  const LOTE = 20;
  for (let i = 0; i < entradas.length; i += LOTE) {
    const chunk = entradas.slice(i, i + LOTE);
    const res = await Promise.all(chunk.map(([url, mlaId]) =>
      supabase.from('products').update({ mla_id: mlaId }).eq('product_url', url)
    ));
    const errs = res.filter(r => r.error);
    ok += chunk.length - errs.length;
    if (errs.length) {
      const msg = errs[0].error.message;
      if (/mla_id/i.test(msg)) {
        console.warn('   ⚠️ La columna mla_id no existe; corré scripts/add-mla-id-column.sql. Se omite backfill.');
        return;
      }
      console.warn(`   ⚠️ ${errs.length} updates fallaron en el lote: ${msg}`);
    }
  }
  console.log(`   ✅ mla_id backfilleado en ${ok}/${entradas.length} productos. La próxima corrida los salta sin abrir el navegador.`);
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────

async function main() {
  // 1. Construir índices de productos ya existentes para no re-scrapear.
  //    Deduplicamos por 3 claves, en orden de robustez:
  //      a) mla_id  → clave estable de ML (la mejor, para productos nuevos)
  //      b) título normalizado → recupera los ~1000 legacy que NO tienen mla_id
  //         (se guardaron solo con su link de afiliado meli.la, del que no se
  //          puede recuperar el MLA id porque viaja encriptado en `ref`)
  //      c) URL original → solo aplica a los pocos que cayeron al fallback
  const urlsExistentes = new Set();
  const idsExistentes = new Set();
  const titulosExactos = new Map();   // titulo normalizado → product_url
  const legacyList = [];              // { norm, product_url } para match tolerante a recorte

  const registrarExistente = ({ url, mlaId, title }) => {
    const cleanUrl = url ? url.split('?')[0] : null;
    if (cleanUrl) urlsExistentes.add(cleanUrl);
    if (mlaId) idsExistentes.add(mlaId);
    const t = normalizarTitulo(title);
    if (t) {
      if (!titulosExactos.has(t)) titulosExactos.set(t, cleanUrl);
      legacyList.push({ norm: t, product_url: cleanUrl });
    }
  };

  // Longitud mínima para confiar en un match por prefijo (evita falsos positivos
  // entre títulos cortos que comparten arranque).
  const MIN_PREFIX = 25;

  // Busca un producto existente por mla_id (exacto) o por título (exacto o
  // tolerante a recorte: el listado del hub muestra el título acortado vs el H1).
  const buscarExistente = ({ mlaId, title }) => {
    if (mlaId && idsExistentes.has(mlaId)) return { product_url: null, mla_id: mlaId };
    const t = normalizarTitulo(title);
    if (!t) return null;
    if (titulosExactos.has(t)) return { product_url: titulosExactos.get(t) };
    if (t.length >= MIN_PREFIX) {
      for (const it of legacyList) {
        if (it.norm.length >= MIN_PREFIX &&
            (it.norm.startsWith(t) || t.startsWith(it.norm))) {
          return { product_url: it.product_url };
        }
      }
    }
    return null;
  };

  // Desde JSON local
  if (fs.existsSync(PRODUCTS_JSON_PATH)) {
    const localData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8') || '[]');
    localData.forEach(p => registrarExistente({
      url: p.productUrl,
      mlaId: p.mlaId || extraerMlaId(p.productUrl),
      title: p.title,
    }));
  }

  // Desde Google Sheets (si hay credenciales)
  const auth = getGoogleAuth();
  if (auth) {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    rows.forEach(row => {
      const url = row.get('URL Original') || row.get('Link Afiliado');
      registrarExistente({
        url,
        mlaId: extraerMlaId(row.get('URL Original')),
        title: row.get('Nombre'),
      });
    });
  }

  // Desde Supabase (intentamos traer mla_id; si la columna no existe, sin ella)
  let sbData = null;
  let sbErr = null;
  ({ data: sbData, error: sbErr } = await supabase
    .from('products')
    .select('product_url, title, mla_id'));
  if (sbErr && /mla_id/i.test(sbErr.message)) {
    ({ data: sbData, error: sbErr } = await supabase
      .from('products')
      .select('product_url, title'));
  }
  if (!sbErr && sbData) {
    sbData.forEach(p => registrarExistente({
      url: p.product_url,
      mlaId: p.mla_id || null,
      title: p.title,
    }));
  }

  console.log(`✅ Índice de existentes → ${titulosExactos.size} títulos, ${idsExistentes.size} mla_id, ${urlsExistentes.size} URLs.`);

  // mla_id a backfillear en productos legacy (los que matcheamos por título).
  // Healing: tras esta corrida, los 1000 quedan con su mla_id → la próxima vez
  // se saltan al instante sin abrir el navegador.
  const backfill = new Map(); // product_url → mla_id

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

    await esperarEnter('\n👉 Si la página te pide login, iniciá sesión ahora en la ventana de Chrome.\n   Cuando veas el hub de afiliados cargado, volvé acá y presioná ENTER para continuar...\n');

    console.log("🖱️ Seleccionando 'Más vendidos'...");
    const botonMasVendidos = await page.waitForSelector(
      'xpath/.//button[contains(., "Más vendidos")]',
      { visible: true, timeout: 30000 }
    );
    await botonMasVendidos.click();
    await sleep(4000);

    const items = await scrollHastaCargarProductos(page, MAX_PRODUCTOS);

    // Fase 1 — Pre-filtro SIN abrir el navegador, usando lo que el hub ya da:
    // mla_id (de la URL) y título del listado. Atrapa la mayoría al instante.
    // Los que pasan este filtro pueden seguir siendo legacy si el hub mostraba
    // el título recortado → la Fase 2 los confirma con el título H1 real.
    const candidatos = items.filter(it => {
      const hit = buscarExistente({ mlaId: it.mlaId, title: it.title });
      if (hit) {
        if (hit.product_url && it.mlaId) backfill.set(hit.product_url, it.mlaId);
        return false;
      }
      return true;
    });

    console.log(`\n🆕 ${candidatos.length} candidatos de ${items.length} recolectados (resto saltado por mla_id/título del hub).`);
    console.log(`   Abriendo página solo de los candidatos para confirmar contra el título real...\n`);

    for (let i = 0; i < candidatos.length; i++) {
      const it = candidatos[i];

      const resultado = await procesarProducto(page, it.url, it.mlaId, buscarExistente);

      if (resultado && resultado.existente) {
        // Confirmado existente por título H1: no se guarda, se backfillea mla_id.
        if (resultado.legacyUrl && resultado.mlaId) backfill.set(resultado.legacyUrl, resultado.mlaId);
      } else if (resultado) {
        resultados.push(resultado);
        // Registramos en caliente para no duplicar dentro de la misma corrida
        if (resultado.mlaId) idsExistentes.add(resultado.mlaId);
        const t = normalizarTitulo(resultado.nombre);
        if (t && !titulosExactos.has(t)) {
          titulosExactos.set(t, null);
          legacyList.push({ norm: t, product_url: null });
        }
      }

      if ((i + 1) % 10 === 0 && i + 1 < candidatos.length) {
        await sleep(5000);
      }
    }

    if (resultados.length > 0) {
      await guardarEnSheets(resultados);
      console.log(`\n✅ PROCESO COMPLETO: ${resultados.length} productos nuevos agregados.`);
    } else {
      console.log('\n😴 No se encontraron productos nuevos para agregar.');
    }

    // Backfill de mla_id en los legacy que matcheamos por título.
    await backfillMlaIds(backfill);

  } catch (e) {
    console.log(`\n❌ ERROR CRÍTICO: ${e.message}`);
  }

  await browser.close();
}

main();
