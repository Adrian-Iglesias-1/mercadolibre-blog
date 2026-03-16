'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import { BlogPost } from '@/types';
import Link from 'next/link';

interface SearchResultsProps {
  query: string;
  category: string;
  blogResults: BlogPost[];
}

function SearchResults({ query, category, blogResults }: SearchResultsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      try {
        const searchUrl = new URL('/api/products', window.location.origin);
        if (query) searchUrl.searchParams.append('q', query);
        if (category) searchUrl.searchParams.append('category', category);

        const response = await fetch(searchUrl.toString());
        if (!response.ok) throw new Error('Search failed');
        const searchResults = await response.json();
        setProducts(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (query.trim().length >= 2 || category) {
      performSearch();
    } else {
      const loadDefaults = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/products');
          const data = await res.json();
          setProducts(data);
        } catch (e) {
          setProducts([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadDefaults();
    }
  }, [query, category]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-accent-sh/20 border-t-accent-sh rounded-full animate-spin"></div>
        <p className="mt-6 text-white/50 font-syne tracking-widest uppercase text-sm">Buscando en el catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-24">
      {/* Sección de Productos */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-syne font-bold text-white">
            {category ? `Productos en ${category}` : 'Productos Encontrados'}
          </h2>
          <div className="h-[1px] flex-1 bg-white/10"></div>
          <span className="text-accent-sh font-bold text-sm bg-accent-sh/10 px-3 py-1 rounded-full border border-accent-sh/20">
            {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center">
            <div className="text-6xl mb-4">🏜️</div>
            <h3 className="text-xl font-syne font-bold text-white mb-2">Sin productos</h3>
            <p className="text-white/40">
              No hay productos que coincidan con {query ? `"${query}"` : 'esta categoría'}.
            </p>
          </div>
        )}
      </section>

      {/* Sección de Blog (Valor Agregado) */}
      {blogResults.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-syne font-bold text-white">Guías y Artículos Recomendados</h2>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogResults.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:translate-y-[-4px]"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-accent-sh text-black-sh">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-syne font-bold text-white group-hover:text-accent-sh transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-white/40 text-sm mt-3 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 flex items-center text-accent-sh text-xs font-bold tracking-widest uppercase gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Leer guía completa
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ClientPage({ 
  searchParams, 
  blogResults = [] 
}: { 
  searchParams?: { [key: string]: string | string[] | undefined },
  blogResults?: BlogPost[]
}) {
  const query = (searchParams?.q as string) || '';
  const category = (searchParams?.category as string) || '';

  return (
    <div className="min-h-screen bg-black-sh pt-32 pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-sh/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent-sh text-xs font-bold tracking-widest uppercase mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Explorador Inteligente
          </div>
          
          <h1 className="text-5xl md:text-7xl font-syne font-black text-white tracking-tighter mb-6">
            {query ? (
              <>Resultados para <span className="text-accent-sh">&quot;{query}&quot;</span></>
            ) : category ? (
              <>Categoría: <span className="text-accent-sh">&quot;{category}&quot;</span></>
            ) : (
              <>Explorá nuestro <span className="text-accent-sh">Catálogo</span></>
            )}
          </h1>
          
          <p className="text-xl text-white/40 max-w-2xl">
            Combinamos los productos más vendidos con guías expertas para que compres siempre lo mejor.
          </p>
        </div>

        <SearchResults query={query} category={category} blogResults={blogResults} />
      </div>
    </div>
  );
}
