import { NextResponse, NextRequest } from 'next/server';
import { getProductsFromSheet } from '@/lib/google-sheets';

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
      const normalizeStr = (str: string) => 
        str.toLowerCase()
           .normalize("NFD")
           .replace(/[\u0300-\u036f]/g, "")
           .replace(/[^a-z0-9\s-]/g, '')
           .trim()
           .replace(/\s+/g, '-');

      const normalizedReqCat = normalizeStr(category);

      products = products.filter(p => {
        const productCatSlug = p.category.slug ? normalizeStr(p.category.slug) : '';
        const productCatId = p.category.id ? normalizeStr(p.category.id) : '';
        const productCatName = p.category.name ? normalizeStr(p.category.name) : '';

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
