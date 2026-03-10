'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import Filters from '@/components/Filters';
import { categories } from '@/lib/categories';
import { Product, FilterOptions } from '@/types';

interface ClientPageProps {
  products: Product[];
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ClientPage({ products, searchParams }: ClientPageProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'gaming',
    priceRange: searchParams?.minPrice && searchParams?.maxPrice ? 
      [parseInt(searchParams.minPrice as string), parseInt(searchParams.maxPrice as string)] : 
      undefined,
    brand: (searchParams?.brand as string) || undefined,
    sortBy: (searchParams?.sort as FilterOptions['sortBy']) || undefined
  });

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.priceRange) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
    
    const queryString = params.toString();
    router.push(queryString ? `/gaming?${queryString}` : '/gaming');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 Gaming
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Descubre lo último en hardware, consolas y accesorios para llevar tu experiencia de juego al siguiente nivel.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <Filters 
              categories={categories} 
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
          <div className="flex-1">
            <ProductGrid products={products} filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}
