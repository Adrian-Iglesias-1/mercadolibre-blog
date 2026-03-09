import * as cheerio from 'cheerio';
import { Product, Category } from '@/types';
import { getCategoryBySlug, categories } from './categories';

const ML_BASE_URL = 'https://www.mercadolibre.com.ar';

export async function getMLBestSellers(categorySlug?: string): Promise<Product[]> {
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  
  // URL de más vendidos de MercadoLibre
  const url = categorySlug 
    ? `${ML_BASE_URL}/mas-vendidos/${categorySlug}`
    : `${ML_BASE_URL}/mas-vendidos`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error('Error al conectar con MercadoLibre');

    const html = await response.text();
    const $ = cheerio.load(html);
    let products: Product[] = [];

    // Intento 1: Scraping estándar por selectores CSS
    const selectors = [
      '.ui-search-layout__item',
      '.poly-card__container',
      '.promotion-item',
      '.ui-search-result__wrapper'
    ];

    for (const selector of selectors) {
      $(selector).slice(0, 10).each((index, element) => {
        const $el = $(element);
        const title = $el.find('.ui-search-item__title, .poly-component__title, .promotion-item__title, .poly-card__title').first().text().trim();
        
        let priceRaw = $el.find('.andes-money-amount__fraction, .price-tag-amount').first().text().trim();
        const priceText = priceRaw.replace(/\./g, '');
        
        const img = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src');
        const link = $el.find('a').first().attr('href');

        if (title && priceText && img && link) {
          products.push({
            id: `best-${index}`,
            title,
            price: priceText,
            imageUrl: img.startsWith('http') ? img : `https:${img}`,
            productUrl: link.startsWith('http') ? link : `${ML_BASE_URL}${link}`,
            category: category || getCategoryBySlug('tecnologia')!,
            brand: title.split(' ')[0]
          });
        }
      });
      if (products.length > 0) break;
    }

    // Intento 2: Extracción de __PRELOADED_STATE__ (Para páginas tipo landing/SPA de ML)
    if (products.length === 0) {
      const scripts = $('script');
      scripts.each((i, script) => {
        const content = $(script).html();
        if (content && content.includes('__PRELOADED_STATE__')) {
          try {
            const jsonMatch = content.match(/window\.__PRELOADED_STATE__\s*=\s*({.*?});/);
            if (jsonMatch) {
              const state = JSON.parse(jsonMatch[1]);
              const components = state.dataLanding?.components || [];
              
              components.forEach((comp: any) => {
                if (comp.items && Array.isArray(comp.items)) {
                  comp.items.forEach((item: any, idx: number) => {
                    if (products.length >= 10) return;
                    const data = item.data;
                    if (data && data.title && data.price) {
                      products.push({
                        id: `best-json-${idx}-${products.length}`,
                        title: data.title,
                        price: data.price.toString(),
                        imageUrl: data.thumbnail,
                        productUrl: data.permalink.startsWith('http') ? data.permalink : `${ML_BASE_URL}${data.permalink}`,
                        category: category || getCategoryBySlug('tecnologia')!,
                        brand: data.title.split(' ')[0]
                      });
                    }
                  });
                }
              });
            }
          } catch (e) {
            console.error('Error parsing __PRELOADED_STATE__:', e);
          }
        }
      });
    }

    return products.slice(0, 10);
  } catch (error) {
    console.error(`Error scraping Best Sellers:`, error);
    return [];
  }
}

export async function getMLProducts(query: string, categorySlug?: string): Promise<Product[]> {
  let category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  // Si no hay categoría, intentamos detectarla por el query
  if (!category) {
    const q = query.toLowerCase();
    if (q.includes('perfume') || q.includes('fragancia')) {
      category = getCategoryBySlug('perfumes');
    } else {
      category = getCategoryBySlug('tecnologia'); // Default
    }
  }

  if (!category) return [];

  const searchUrl = `${ML_BASE_URL}/jm/search?as_word=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600, tags: ['products', `search-${query}`] }
    });

    if (!response.ok) throw new Error('Error al conectar con MercadoLibre');

    const html = await response.text();
    const $ = cheerio.load(html);
    const products: Product[] = [];

    const selectors = [
      '.ui-search-layout__item',
      '.poly-card__container',
      '.ui-search-result__wrapper'
    ];

    for (const selector of selectors) {
      $(selector).slice(0, 24).each((index, element) => {
        const $el = $(element);

        const title = $el.find('.ui-search-item__title, .poly-component__title, [data-testid="title"]').first().text().trim();
        
        // Limpiamos el precio: eliminamos puntos de miles para quedarnos con el número base
        let priceRaw = $el.find('.andes-money-amount__fraction, .price-tag-amount').first().text().trim();
        const priceText = priceRaw.replace(/\./g, '');
        
        const img = $el.find('img').first().attr('data-src') || $el.find('img').first().attr('src');
        const link = $el.find('a').first().attr('href');

        if (title && priceText && img && link) {
          products.push({
            id: `ml-${category.id}-${index}-${query.substring(0,3)}`,
            title,
            price: priceText, // Guardamos solo el número como string para formatearlo en el componente
            imageUrl: img.startsWith('http') ? img : `https:${img}`,
            productUrl: link.startsWith('http') ? link : `${ML_BASE_URL}${link}`,
            category,
            brand: title.split(' ')[0]
          });
        }
      });
      if (products.length > 0) break;
    }

    return products;
  } catch (error) {
    console.error(`Error scraping ML para ${query}:`, error);
    return [];
  }
}
