import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import SearchBar from '@/components/SearchBar';
import BestSellers from '@/components/BestSellers';
import { getMLBestSellers } from '@/lib/mercadolibre';
import { getAllBlogPosts } from '@/lib/blog';
import { categories } from '@/lib/categories';

async function BestSellersList() {
  const products = await getMLBestSellers();
  return <BestSellers products={products} />;
}

function BestSellersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
          <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const allPosts = getAllBlogPosts();
  const featuredPosts = allPosts.slice(0, 3);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section con SearchBar */}
      <section className="bg-mercado-yellow py-24 px-4 relative overflow-hidden">
        {/* Adornos decorativos de fondo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
            Encontrá lo mejor de <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">Mercado Libre</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Analizamos miles de productos para traerte <br className="hidden md:block" /> las mejores ofertas y guías de compra.
          </p>
          
          <div className="max-w-2xl mx-auto transform scale-105 md:scale-110 mb-10">
            <div className="shadow-2xl rounded-full bg-white">
              <SearchBar />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-12 text-gray-900/60 uppercase tracking-widest font-black text-[10px] md:text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span>Ofertas Verificadas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span>Análisis Real</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <span>Links Directos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <span>Actualización Diaria</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selector de Categorías Visual */}
      <section className="py-24 md:py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900">Categorías Populares</h2>
          <p className="text-gray-500 mt-3 font-medium text-lg">Nuestras selecciones favoritas para vos</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.filter(cat => cat.id !== 'blog').map((category) => (
            <Link 
              key={category.id} 
              href={`/${category.id}`}
              className="group bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 hover:border-mercado-yellow transition-all duration-500 text-center flex flex-col items-center justify-center relative overflow-hidden"
            >
              <span className="text-6xl mb-6 block group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                {category.icon}
              </span>
              <span className="font-black text-gray-900 text-xl group-hover:text-mercado-yellow transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top 10 Más Vendidos */}
      <section className="py-24 px-4 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-red-100 text-red-600 px-4 py-1.5 rounded-full text-xs font-black mb-4 tracking-wider">
              🔥 TENDENCIA NACIONAL
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Top 10 Más Vendidos</h2>
            <p className="text-gray-500 font-medium text-lg">Lo que todo el mundo está comprando hoy en Argentina</p>
          </div>
          
          <Suspense fallback={<BestSellersSkeleton />}>
            <BestSellersList />
          </Suspense>

          <div className="mt-16 text-center">
            <Link href="/search?q=mas-vendidos" className="group inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-full font-black hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Explorar Catálogo Completo
              <span className="text-xl group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Blog Editorial (Refactorizado a 3 columnas) */}
      <section className="py-24 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-mercado-yellow font-black tracking-[0.2em] uppercase text-xs">Nuestro Magazine</span>
              <h2 className="text-5xl font-black mt-4">Guías de Compra <br className="hidden md:block" /> & Reviews</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Columna Izquierda y Central: Post Principal */}
            {featuredPosts[0] && (
              <div className="lg:col-span-2">
                <Link 
                  href={`/blog/${featuredPosts[0].slug}`}
                  className="relative overflow-hidden rounded-[48px] group block h-[500px] md:h-[650px] shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 p-8 md:p-14 z-20 w-full">
                    <span className="bg-mercado-yellow text-black px-4 py-1 rounded-full text-[10px] font-black mb-6 inline-block uppercase tracking-wider">
                      ARTÍCULO DESTACADO
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black mb-6 group-hover:text-mercado-yellow transition-colors leading-tight">
                      {featuredPosts[0].title}
                    </h3>
                    <p className="text-slate-300 line-clamp-2 max-w-2xl text-lg font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                      {featuredPosts[0].excerpt}
                    </p>
                  </div>
                  <div className="h-full w-full relative transition-transform duration-1000 group-hover:scale-110">
                    <Image
                      src={featuredPosts[0].coverImage || "https://images.unsplash.com/photo-1550745165-9bc0b252726f"}
                      alt={featuredPosts[0].title}
                      fill
                      className="object-cover opacity-60"
                    />
                  </div>
                </Link>
              </div>
            )}

            {/* Columna Derecha: Últimas Guías */}
            <div className="lg:col-span-1 flex flex-col h-full">
              <div className="bg-white/5 border border-white/10 p-10 rounded-[48px] flex flex-col h-full">
                <h4 className="text-white font-black uppercase text-sm tracking-widest mb-10 border-b border-white/10 pb-4">
                  Últimas Guías
                </h4>
                <div className="flex flex-col gap-8 flex-1">
                  {allPosts.slice(1, 6).map((post) => (
                    <div key={post.slug} className="group border-b border-white/5 pb-6 last:border-0">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="block"
                      >
                        <h3 className="text-lg font-bold text-gray-300 group-hover:text-mercado-yellow transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <div className="mt-2 w-0 group-hover:w-12 h-0.5 bg-mercado-yellow transition-all duration-300"></div>
                      </Link>
                    </div>
                  ))}
                </div>
                
                <Link 
                  href="/blog"
                  className="mt-12 inline-flex items-center justify-center gap-2 text-sm font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest group"
                >
                  Ir al Blog Completo
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Newsletter */}
      <section className="py-24 px-4 bg-mercado-yellow">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-7xl mb-10 block">📩</span>
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">¿Querés ofertas exclusivas?</h2>
          <p className="text-xl text-gray-800 mb-12 font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
            Suscribite a nuestro newsletter y recibí los mejores precios de Mercado Libre antes que nadie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto bg-black/5 p-3 rounded-[40px] md:rounded-full shadow-lg">
            <input 
              type="email" 
              placeholder="Tu mejor email..." 
              className="flex-1 px-10 py-5 rounded-full bg-white border-none focus:outline-none focus:ring-4 focus:ring-black/10 text-gray-900 font-bold placeholder:text-gray-400 text-lg"
            />
            <button className="bg-black text-white px-12 py-5 rounded-full font-black hover:bg-gray-900 transition-all transform active:scale-95 shadow-2xl text-lg uppercase tracking-wider">
              Unirse gratis
            </button>
          </div>
          <p className="mt-10 text-gray-800 font-black text-[10px] uppercase tracking-[0.2em] opacity-50">
            Respetamos tu privacidad. 100% libre de spam.
          </p>
        </div>
      </section>
    </div>
  );
}
