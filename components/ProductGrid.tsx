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
    if (filters.category && filters.category !== 'all') {
      const categoryToFilter = filters.category;

      const normalizedSelected = categoryToFilter
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      filtered = filtered.filter(p => 
        p.category.slug === normalizedSelected || 
        p.category.id === normalizedSelected ||
        p.category.slug === categoryToFilter
      );
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

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return parseFloat(a.price.replace(/[$.,]/g, '')) - parseFloat(b.price.replace(/[$.,]/g, ''));
        case 'price_desc':
          return parseFloat(b.price.replace(/[$.,]/g, '')) - parseFloat(a.price.replace(/[$.,]/g, ''));
        case 'relevance':
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters, sortBy]);

  return (
    <div className="space-y-8">
      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-[13px] text-text-muted-sh font-light">
          Mostrando <span className="text-white font-medium">{filteredAndSortedProducts.length}</span> productos
        </p>
        
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-text-muted-sh uppercase tracking-widest">Ordenar por</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
            className="bg-surface2-sh border border-white/10 rounded-lg px-4 py-2 text-sm text-text-sh focus:outline-none focus:border-accent-sh/30 transition-colors appearance-none cursor-pointer"
          >
            <option value="relevance">Relevancia</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-syne text-xl font-bold text-white mb-2">No se encontraron productos</h3>
          <p className="text-text-muted-sh text-sm font-light">
            Intenta ajustar los filtros para encontrar lo que buscas.
          </p>
        </div>
      )}
    </div>
  );
}
