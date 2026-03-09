'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';
import Filters from '@/components/Filters';
import { categories } from '@/lib/categories';
import { Product, FilterOptions } from '@/types';

interface ClientPageProps {
  products: Product[];
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ClientPage({ products }: ClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'perfumes',
    priceRange: searchParams?.get('minPrice') && searchParams?.get('maxPrice') ? 
      [parseInt(searchParams.get('minPrice')!), parseInt(searchParams.get('maxPrice')!)] : 
      undefined,
    brand: searchParams?.get('brand') || undefined,
    rating: searchParams?.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
    sortBy: searchParams?.get('sort') as FilterOptions['sortBy']
  });

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.priceRange) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.rating) params.set('rating', newFilters.rating.toString());
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
    
    const queryString = params.toString();
    const url = queryString ? `/perfumes?${queryString}` : '/perfumes';
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌸 Perfumes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Explora nuestra selección exclusiva de fragancias de lujo. Desde perfumes 
            icónicos hasta las últimas novedades de las mejores marcas del mundo.
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

          {/* Products */}
          <div className="flex-1">
            <ProductGrid products={products} filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}
