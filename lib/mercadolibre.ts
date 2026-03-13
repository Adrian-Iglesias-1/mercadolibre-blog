import * as cheerio from 'cheerio';
import { Product, Category } from '@/types';
import { getCategoryBySlug, getCategoryById } from './categories';
import { getCachedProducts, setCachedProducts } from './real-time-cache';
import { getFallbackProducts } from './fallback-data';
import { getProductsFromSheet } from './google-sheets';

const ML_BASE_URL = 'https://www.mercadolibre.com.ar';
const MAX_PRODUCTS = 24;
const CACHE_TTL = 3600;

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'es-AR,es;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

function toHighResImage(url: string | undefined | null): string {
  if (!url || url.includes('data:image')) return '';
  let n = url.trim();
  if (n.startsWith('//')) n = `https:${n}`;
  if (n.startsWith('http://')) n = n.replace('http://', 'https://');
  if (n.includes('pixel.gif') || n.includes('loading.gif')) return '';
  return n.replace(/-[I]\./, '-V.');
}

function normalizeItem(item: any, category: Category): Product | null {
  const title = item.title || item.name || item.text || '';
  const id = item.id || item.item_id || '';
  const price = item.price?.amount || item.price || (item.installments?.amount * item.installments?.quantity) || 0;
  const link = item.permalink || item.url || '';
  const rawImg = item.thumbnail || (item.pictures && item.pictures[0]?.url) || item.image || '';
  
  const imageUrl = toHighResImage(rawImg);
  if (!title || !price || !imageUrl || !id) return null;

  return {
    id,
    title,
    price: Math.floor(price).toString(),
    imageUrl,
    productUrl: link,
    category,
    brand: item.attributes?.find((a: any) => a.id === 'BRAND')?.value_name || title.split(' ')[0],
  };
}

function extractFromState(html: string, category: Category): Product[] {
  try {
    const $ = cheerio.load(html);
    let results: any[] = [];
    
    $('script').each((_, script) => {
      const content = $(script).html() || '';
      if (content.includes('window.__PRELOADED_STATE__')) {
        const match = content.match(/window\.__PRELOADED_STATE__\s*=\s*({[\s\S]+?});/) || 
                      content.match(/window\.__PRELOADED_STATE__\s*=\s*({[\s\S]+?})\n/);
        
        if (match && match[1]) {
          try {
            const state = JSON.parse(match[1]);
            results = state?.initialState?.components?.results || 
                      state?.initialState?.results || 
                      state?.results || 
                      state?.initialState?.search?.results || [];
          } catch (e) {
            const parts = content.split('window.__PRELOADED_STATE__ = ');
            if (parts[1]) {
              const jsonStr = parts[1].substring(0, parts[1].lastIndexOf('}') + 1);
              const state = JSON.parse(jsonStr);
              results = state?.initialState?.results || state?.initialState?.components?.results || [];
            }
          }
        }
      }
    });

    return results
      .map(item => normalizeItem(item, category))
      .filter((p): p is Product => p !== null);
  } catch (e) {
    return [];
  }
}

function extractFromDOM(html: string, category: Category): Product[] {
  const $ = cheerio.load(html);
  const products: Product[] = [];
  const itemSelector = '.ui-search-layout__item, .poly-card__container, .ui-recommendations-card, .promotion-item, .ui-search-result, .andes-card';

  $(itemSelector).each((i, el) => {
    if (products.length >= MAX_PRODUCTS) return false;
    const $el = $(el);
    const title = $el.find('.ui-search-item__title, .poly-component__title, .ui-recommendations-card__title, .promotion-item__title').first().text().trim();
    const price = $el.find('.andes-money-amount__fraction').first().text().replace(/\./g, '').trim();
    const link = $el.find('a').first().attr('href') || '';
    
    let img = '';
    $el.find('img').each((_, imgEl) => {
      const src = $(imgEl).attr('data-src') || $(imgEl).attr('data-lazy-src') || $(imgEl).attr('src');
      const normalized = toHighResImage(src);
      if (normalized && !img) img = normalized;
    });

    if (title && price && img && link) {
      products.push({
        id: `dom-${i}-${category.id}`,
        title,
        price,
        imageUrl: img,
        productUrl: link,
        category,
        brand: title.split(' ')[0]
      });
    }
  });
  return products;
}

export async function getMLProducts(query: string, categoryId?: string): Promise<Product[]> {
  const category = getCategoryById(categoryId || 'tecnologia') || getCategoryBySlug('computacion')!;
  const url = `${ML_BASE_URL}/jm/search?as_word=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url, { headers: FETCH_HEADERS });
    const html = await response.text();
    let products = extractFromState(html, category);
    if (products.length === 0) products = extractFromDOM(html, category);
    
    return products.length > 0 ? products : getFallbackProducts(categoryId);
  } catch (e) {
    return getFallbackProducts(categoryId);
  }
}

export async function getMLBestSellers(categoryId?: string): Promise<Product[]> {
  try {
    // Retornar exclusivamente los productos de la planilla
    const sheetProducts = await getProductsFromSheet();
    
    // Si la planilla tiene productos, devolverlos (limitado a 10)
    if (sheetProducts.length > 0) {
      return sheetProducts.slice(0, 10);
    }

    // Si la planilla está vacía, solo entonces usamos el fallback como seguridad
    const category = getCategoryById(categoryId || 'tecnologia') || getCategoryBySlug('computacion')!;
    return getMLProducts(`mas vendidos ${category.name}`, category.id);
  } catch (e) {
    console.error('Error in getMLBestSellers:', e);
    const category = getCategoryById(categoryId || 'tecnologia') || getCategoryBySlug('computacion')!;
    return getMLProducts(`mas vendidos ${category.name}`, category.id);
  }
}
