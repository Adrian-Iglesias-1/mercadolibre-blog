import Link from 'next/link';
import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import BestSellers from '@/components/BestSellers';
import { getMLProducts, getMLBestSellers } from '@/lib/mercadolibre';
import { Product } from '@/types';

// Componente para cargar los productos más vendidos
async function TopBestSellersList() {
  const bestSellers = await getMLBestSellers();
  return <BestSellers products={bestSellers} />;
}

// Componente para cargar los productos destacados de forma asíncrona
async function FeaturedProductsList() {
  const [techProducts, perfumeProducts] = await Promise.all([
    getMLProducts('auriculares gamer', 'tecnologia'),
    getMLProducts('perfume', 'perfumes')
  ]);
  
  const products = [...techProducts, ...perfumeProducts];
  const featuredProducts = products.slice(0, 8);
  
  return <ProductGrid products={featuredProducts} />;
}

// Esqueleto de carga para los productos
function ProductsSkeleton({ count = 8, cols = 4 }: { count?: number, cols?: number }) {
  const gridCols = cols === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-6`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Busca tu Producto Ideal
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas entre miles de productos de MercadoLibre
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      {/* Top 10 Best Sellers */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🏆 Top 10 Más Vendidos
              </h2>
              <p className="text-gray-600">
                Los productos que son tendencia ahora mismo en Argentina
              </p>
            </div>
          </div>
          <Suspense fallback={<ProductsSkeleton count={5} cols={5} />}>
            <TopBestSellersList />
          </Suspense>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Las mejores ofertas seleccionadas por nuestro equipo de expertos
            </p>
          </div>
          <Suspense fallback={<ProductsSkeleton />}>
            <FeaturedProductsList />
          </Suspense>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explora por Categorías
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Navega por nuestras categorías especializadas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
              <div className="text-6xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tecnología</h3>
              <p className="text-gray-600 mb-4">Los mejores gadgets y dispositivos</p>
              <Link 
                href="/tecnologia" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                Explorar →
              </Link>
            </div>
            
            <div className="text-center p-8 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors duration-200">
              <div className="text-6xl mb-4">🌸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Perfumes</h3>
              <p className="text-gray-600 mb-4">Fragancias exclusivas y de marca</p>
              <Link 
                href="/perfumes" 
                className="inline-flex items-center text-pink-600 hover:text-pink-800 font-medium"
              >
                Explorar →
              </Link>
            </div>
            
            <div className="text-center p-8 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Blog</h3>
              <p className="text-gray-600 mb-4">Guías y reseñas detalladas</p>
              <Link 
                href="/blog" 
                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
              >
                Leer →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
