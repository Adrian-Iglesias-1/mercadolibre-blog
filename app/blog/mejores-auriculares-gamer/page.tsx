import { scrapeMercadoLibre, loadProductsFromFile } from '@/lib/scraper';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

async function getProducts() {
  try {
    // Try to load from file first
    let products = loadProductsFromFile();
    
    // If no products exist, scrape them
    if (products.length === 0) {
      products = await scrapeMercadoLibre('auriculares gamer');
    }
    
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export default async function BlogPost() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Volver al inicio
        </Link>
        
        <article className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Los Mejores Auriculares Gamer de 2024
            </h1>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-xl leading-relaxed">
                Descubre nuestra selección de los mejores auriculares gaming del mercado. 
                Hemos analizado cuidadosamente las opciones disponibles en MercadoLibre 
                para traerte los productos con mejor relación calidad-precio, sonido inmersivo 
                y comodidad para largas sesiones de juego.
              </p>
            </div>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nuestras Recomendaciones
            </h2>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800">
                  No se pudieron cargar los productos en este momento. 
                  Por favor, intenta recargar la página más tarde.
                </p>
              </div>
            )}
          </section>

          <footer className="border-t pt-8">
            <div className="text-center text-gray-600">
              <p className="mb-4">
                Los precios y disponibilidad están sujetos a cambios. 
                Los enlaces dirigen a las páginas oficiales de MercadoLibre.
              </p>
              <p className="text-sm">
                Este blog participa en el programa de afiliados de MercadoLibre.
              </p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
