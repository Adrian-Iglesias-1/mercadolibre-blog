'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';

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
  const observerTarget = useRef<HTMLDivElement>(null);

  // Lógica de ordenamiento
  const sortedProducts = useMemo(() => {
    const list = [...products];

    const parseSales = (soldStr: string | undefined): number => {
      if (!soldStr) return 0;
      let cleaned = soldStr.toLowerCase()
        .replace(/nuevo\s*\|\s*/i, '')
        .replace(/vendidos/i, '')
        .replace(/\+/g, '')
        .trim();

      if (cleaned.includes('mil')) {
        const num = parseFloat(cleaned.replace('mil', '').replace(',', '.').trim());
        return num * 1000;
      }
      if (cleaned.includes('millón') || cleaned.includes('millon')) {
        const num = parseFloat(cleaned.replace(/millon|millón/, '').replace(',', '.').trim());
        return num * 1000000;
      }
      return parseInt(cleaned.replace(/[^\d]/g, '') || '0');
    };
    
    return list.sort((a, b) => {
      if (sortBy === 'sales') {
        return parseSales(b.soldCount) - parseSales(a.soldCount);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, visibleCount, sortedProducts]);

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

      {/* Sensor de Scroll e Indicadores */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="py-20 flex justify-center items-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-accent-sh/20 border-t-accent-sh rounded-full animate-spin"></div>
            <p className="text-accent-sh text-[10px] font-bold tracking-[3px] uppercase animate-pulse">
              Cargando más productos
            </p>
          </div>
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
