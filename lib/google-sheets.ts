import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Product } from '@/types';
import { getCategoryById, getCategoryBySlug } from './categories';

const normalize = (str: string) => 
  str.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-z0-9\s-]/g, '') // Quitar todo lo que no sea alfanumérico o espacios
     .trim()
     .replace(/\s+/g, '-');

export async function getProductsFromSheet(): Promise<Product[]> {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1')
      : undefined;

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const doc = new GoogleSpreadsheet(
      '1eZ_ql4KR4TZf0rjpB3olUgNhkSFr2SQV4PR-_9K7tpI',
      auth
    );

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;

    // Helper para encontrar el nombre real de la columna (insensible a tildes/mayúsculas)
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

      // Limpieza de precio robusta
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

    // Eliminar duplicados basados en productUrl
    const uniqueProductsMap = new Map();
    allProducts.forEach(product => {
      if (!uniqueProductsMap.has(product.productUrl)) {
        uniqueProductsMap.set(product.productUrl, product);
      }
    });

    return Array.from(uniqueProductsMap.values());

  } catch (error) {
    console.error('Error fetching from Sheet:', error);
    return [];
  }
}
