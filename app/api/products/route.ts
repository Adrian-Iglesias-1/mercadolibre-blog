import { NextRequest, NextResponse } from 'next/server';
import { getMLProducts } from '@/lib/mercadolibre';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  try {
    if (query) {
      const products = await getMLProducts(query);
      return NextResponse.json(products);
    }

    // Default products for the API if no query is provided
    const [tech, perfumes] = await Promise.all([
      getMLProducts('auriculares gamer', 'tecnologia'),
      getMLProducts('perfume', 'perfumes')
    ]);
    
    return NextResponse.json([...tech, ...perfumes]);
  } catch (error) {
    console.error('Error in Products API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
