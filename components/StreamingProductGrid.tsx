'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product } from '@/types';

interface StreamingProductGridProps {
  initialProducts: Product[];
  category?: string;
}

export default function StreamingProductGrid({ 
  initialProducts, 
  category 
}: StreamingProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Ya no simulamos carga de duplicados, usamos los productos reales
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, visibleCount).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        
        {/* Loading skeletons for next batch */}
        {isLoading && (
          <ProductCardSkeleton count={4} />
        )}
      </div>
      
      {/* Load more indicator */}
      {products.length > visibleCount && (
        <div className="text-center py-4">
          <button
            onClick={() => setVisibleCount(prev => prev + 4)}
            className="bg-mercado-yellow hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-black text-sm uppercase tracking-wider transition-all"
          >
            Cargar más productos
          </button>
        </div>
      )}
    </div>
  );
}
