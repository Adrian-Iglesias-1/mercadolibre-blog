import { NextResponse, NextRequest } from 'next/server';
import { getProductsFromSheet } from '@/lib/google-sheets';
import { normalize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';

    let products = await getProductsFromSheet();

    // 1. Filtrar por búsqueda si existe query
    if (query) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.category.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }

    // 2. Filtrar por categoría si existe
    if (category) {
      const normalizedReqCat = normalize(category);

      products = products.filter(p => {
        const productCatSlug = p.category.slug ? normalize(p.category.slug) : '';
        const productCatId = p.category.id ? normalize(p.category.id) : '';
        const productCatName = p.category.name ? normalize(p.category.name) : '';

        return productCatSlug === normalizedReqCat || 
               productCatId === normalizedReqCat ||
               productCatName === normalizedReqCat ||
               productCatSlug.includes(normalizedReqCat) ||
               normalizedReqCat.includes(productCatSlug);
      });
    }

    return NextResponse.json(products);

  } catch (error: any) {
    console.error('❌ API Error:', error.message);
    return NextResponse.json({ error: 'Fallo al obtener productos' }, { status: 500 });
  }
}
