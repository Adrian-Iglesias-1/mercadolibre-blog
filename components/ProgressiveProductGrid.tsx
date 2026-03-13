'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product } from '@/types';

interface ProgressiveProductGridProps {
  initialProducts: Product[];
  finalProducts?: Product[];
  loading?: boolean;
}

export default function ProgressiveProductGrid({ 
  initialProducts, 
  finalProducts, 
  loading = false 
}: ProgressiveProductGridProps) {
  const [displayProducts, setDisplayProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (finalProducts && finalProducts.length > 0) {
      // Simulate a smooth transition when real data arrives
      const timer = setTimeout(() => {
        setDisplayProducts(finalProducts);
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [finalProducts]);

  if (isLoading && !finalProducts) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCardSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
