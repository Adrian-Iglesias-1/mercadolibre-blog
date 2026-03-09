'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { Product, FilterOptions } from '@/types';

interface ProductGridProps {
  products: Product[];
  filters?: FilterOptions;
}

export default function ProductGrid({ products, filters = {} }: ProductGridProps) {
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('relevance');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category.id === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price.replace(/[$.,]/g, ''));
        return price >= min && price <= max;
      });
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.brand?.toLowerCase().includes(filters.brand!.toLowerCase())
      );
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(product => 
        (product.rating || 0) >= filters.rating!
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return parseFloat(a.price.replace(/[$.,]/g, '')) - parseFloat(b.price.replace(/[$.,]/g, ''));
        case 'price_desc':
          return parseFloat(b.price.replace(/[$.,]/g, '')) - parseFloat(a.price.replace(/[$.,]/g, ''));
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'relevance':
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters, sortBy]);

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando {filteredAndSortedProducts.length} de {products.length} productos
        </p>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Ordenar por:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-mercado-yellow"
          >
            <option value="relevance">Relevancia</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="rating">Mejor Valorados</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros o realizar una nueva búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
