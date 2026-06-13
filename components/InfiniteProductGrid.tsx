'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import { parseSoldCount } from '@/lib/sold-count';

type SortOption = 'sales' | 'price_asc' | 'price_desc';

interface InfiniteProductGridProps {
  products: Product[];
  initialItems?: number;
  itemsPerScroll?: number;
}

export default function InfiniteProductGrid({ 
  products, 
  initialItems = 10, 
  itemsPerScroll = 10 
}: InfiniteProductGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('sales');
  const [visibleCount, setVisibleCount] = useState(initialItems);

  // Lógica de ordenamiento
  const sortedProducts = useMemo(() => {
    const list = [...products];

    return list.sort((a, b) => {
      if (sortBy === 'sales') {
        return parseSoldCount(b.soldCount) - parseSoldCount(a.soldCount);
      }
      
      if (sortBy === 'price_asc') {
        return parseInt(a.price) - parseInt(b.price);
      }
      
      if (sortBy === 'price_desc') {
        return parseInt(b.price) - parseInt(a.price);
      }
      
      return 0;
    });
  }, [products, sortBy]);

  const hasMore = visibleCount < sortedProducts.length;

  // Reiniciar cuando cambian los productos base o el orden
  useEffect(() => {
    setVisibleCount(initialItems);
  }, [products, sortBy, initialItems]);

  const loadMore = () => {
    setVisibleCount(prev => prev + itemsPerScroll);
  };

  const visibleProducts = sortedProducts.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      {/* Sistema de Filtros */}
      <ProductFilters currentSort={sortBy} onSortChange={setSortBy} />

      {/* Grilla de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {visibleProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} rank={sortBy === 'sales' ? index + 1 : undefined} />
        ))}
      </div>

      {/* Botón Cargar Más */}
      {hasMore && (
        <div className="py-12 flex justify-center">
          <button
            onClick={loadMore}
            className="px-8 py-3.5 rounded-xl border border-white/10 bg-surface2-sh text-white text-[13px] font-bold tracking-widest uppercase hover:border-accent-sh hover:text-accent-sh transition-all"
          >
            Cargar más productos
          </button>
        </div>
      )}

      {!hasMore && sortedProducts.length > initialItems && (
        <div className="py-20 text-center">
          <p className="text-text-muted-sh font-medium text-sm border-t border-white/5 pt-12">
            Has llegado al final de la colección ✨
          </p>
        </div>
      )}

      {sortedProducts.length === 0 && (
        <div className="py-20 text-center bg-black/20 rounded-[32px] border border-dashed border-white/5">
          <p className="text-text-muted-sh font-light text-lg">
            No encontramos productos por ahora.
          </p>
        </div>
      )}
    </div>
  );
}
