'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import Filters from '@/components/Filters';
import { categories } from '@/lib/categories';
import { Product, FilterOptions } from '@/types';

interface SearchResultsProps {
  query: string;
  initialSearchParams?: { [key: string]: string | string[] | undefined };
}

function SearchResults({ query, initialSearchParams }: SearchResultsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: (initialSearchParams?.category as string) || undefined,
    priceRange: initialSearchParams?.minPrice && initialSearchParams?.maxPrice ? 
      [parseInt(initialSearchParams.minPrice as string), parseInt(initialSearchParams.maxPrice as string)] : 
      undefined,
    brand: (initialSearchParams?.brand as string) || undefined,
    sortBy: (initialSearchParams?.sort as FilterOptions['sortBy']) || undefined
  });
  
  const router = useRouter();

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
    
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.priceRange) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
    
    router.push(`/search?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mercado-yellow"></div>
        <p className="mt-4 text-gray-600">Buscando productos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-80 flex-shrink-0">
        <Filters 
          categories={categories} 
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      <div className="flex-1">
        {products.length > 0 ? (
          <ProductGrid products={products} filters={filters} />
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <p className="text-xl text-gray-600">No encontramos resultados exactos para "{query}".</p>
            <p className="text-gray-500 mt-2">Intentá con otras palabras clave.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const query = (searchParams?.q as string) || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Resultados de Búsqueda
          </h1>
          {query && (
            <p className="text-xl text-gray-600">
              Mostrando resultados para: <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>
        <SearchResults query={query} initialSearchParams={searchParams} />
      </div>
    </div>
  );
}
