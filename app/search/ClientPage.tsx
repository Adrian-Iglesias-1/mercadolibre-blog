'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import Filters from '@/components/Filters';
import { categories } from '@/lib/categories';
import { Product, FilterOptions } from '@/types';

function SearchResults({ query }: { query: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
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

    if (query.trim().length >= 2) {
      performSearch();
    } else {
      // Default products if query is empty
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
  }, [query]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.priceRange) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.rating) params.set('rating', newFilters.rating.toString());
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
    
    const queryString = params.toString();
    const url = queryString ? `/search?q=${encodeURIComponent(query)}&${queryString}` : `/search?q=${encodeURIComponent(query)}`;
    router.push(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mercado-yellow"></div>
            <p className="mt-4 text-gray-600">Buscando productos...</p>
          </div>
        </div>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Resultados de Búsqueda
          </h1>
          <p className="text-xl text-gray-600">
            {products.length > 0 ? (
              <>Mostrando <span className="font-semibold">{products.length}</span> resultados para: <span className="font-semibold">"{query}"</span></>
            ) : (
              <>No se encontraron resultados para: <span className="font-semibold">"{query}"</span></>
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <Filters 
              categories={categories} 
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            <ProductGrid products={products} filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const searchParamsObj = useSearchParams();
  const query = searchParamsObj.get('q') || '';

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mercado-yellow"></div>
          </div>
        </div>
      </div>
    }>
      <SearchResults query={query} />
    </Suspense>
  );
}
