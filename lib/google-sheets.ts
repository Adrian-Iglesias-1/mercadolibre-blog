import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Product } from '@/types';
import { getCategoryById, getCategoryBySlug } from './categories';
import { getFallbackProducts } from './fallback-data';
import { unstable_noStore as noStore, unstable_cache } from 'next/cache';
import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';

const normalize = (str: string) => 
  str.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-z0-9\s-]/g, '')
     .trim()
     .replace(/\s+/g, '-');

async function fetchProductsFromSheet(): Promise<Product[]> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')
    : undefined;

  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
    auth
  );

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;

  const getColName = (target: string) => {
    const normalizedTarget = normalize(target);
    return headers.find(h => normalize(h) === normalizedTarget) || target;
  };

  const colMap = {
    category: getColName('Categoría'),
    price: getColName('Precio'),
    name: getColName('Nombre'),
    affiliate: getColName('Link Afiliado'),
    original: getColName('URL Original'),
    image: getColName('Imagen'),
    sold: getColName('Vendidos'),
  };

  const allProducts = rows.map((row, index) => {
    const productCategory = row.get(colMap.category) || 'tecnologia';
    const normalizedCat = normalize(productCategory);
    
    const matchedCategory = getCategoryById(normalizedCat) || 
                           getCategoryBySlug(normalizedCat);
    
    const category = matchedCategory ? {
      ...matchedCategory,
      slug: matchedCategory.slug
    } : {
      id: normalizedCat,
      name: productCategory,
      icon: '📦',
      slug: normalizedCat
    };

    let rawPrice = row.get(colMap.price)?.toString() || '0';
    const finalPrice = rawPrice.replace(/[^\d]/g, '') || '0';

    return {
      id: `sheet-${index}`,
      title: row.get(colMap.name) || '',
      price: finalPrice || '0',
      productUrl: row.get(colMap.affiliate) || row.get(colMap.original) || '',
      imageUrl: row.get(colMap.image) || '',
      category: category as any,
      brand: (row.get(colMap.name) || '').split(' ')[0] || 'Genérico',
      soldCount: row.get(colMap.sold) || '',
    };
  }).filter(p => p.title && p.imageUrl && p.productUrl);

  const uniqueProductsMap = new Map();
  allProducts.reverse().forEach(product => {
    if (!uniqueProductsMap.has(product.productUrl)) {
      uniqueProductsMap.set(product.productUrl, product);
    }
  });

  return Array.from(uniqueProductsMap.values());
}

// Caché con revalidación cada 1 hora (3600 segundos)
const getCachedProducts = unstable_cache(
  async () => {
    try {
      return await fetchProductsFromSheet();
    } catch (error) {
      console.error('Error fetching from Sheet:', error);
      return null;
    }
  },
  ['products-from-sheet'],
  { revalidate: 3600 }
);

export async function getProductsFromSheet(): Promise<Product[]> {
  noStore();
  
  // 1. Intentar desde Supabase
  try {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('date_added', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price?.toString() || '0',
        productUrl: p.product_url,
        imageUrl: p.image_url,
        category: {
          id: p.category_id,
          name: p.category_name,
          icon: p.category_icon || '📦',
          slug: p.category_slug,
          description: '',
          color: '#000000'
        },
        brand: p.brand || 'Genérico',
        soldCount: p.sold_count || ''
      }));
    } else if (error) {
      console.error('❌ Error de Supabase:', error.message);
    }
  } catch (error) {
    console.error('⚠️ Excepción al conectar con Supabase:', error);
  }

  // 2. Intentar desde JSON local
  try {
    const jsonPath = path.join(process.cwd(), 'content', 'products.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      const products = JSON.parse(jsonData || '[]');
      if (products.length > 0) {
        console.log(`🚀 Cargados ${products.length} productos desde JSON local`);
        return products;
      }
    }
  } catch (error) {
    console.error('⚠️ Error leyendo products.json:', error);
  }

  // 3. Fallback a Google Sheets (vía caché)
  const cachedProducts = await getCachedProducts();
  if (cachedProducts && cachedProducts.length > 0) {
    console.log(`🚀 Cargados ${cachedProducts.length} productos desde Caché/Sheet`);
    return cachedProducts;
  }

  // 4. Último recurso: Datos estáticos
  console.log('📦 Usando datos fallback estáticos');
  return getFallbackProducts();
}
