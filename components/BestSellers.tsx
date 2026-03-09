'use client';

import { Product } from '@/types';
import Link from 'next/link';

interface BestSellersProps {
  products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {products.map((product, index) => (
        <div key={product.id} className="relative group">
          {/* Badge de Ranking */}
          <div className="absolute -top-4 -left-4 z-10 w-12 h-12 bg-mercado-yellow rounded-full flex items-center justify-center border-4 border-white shadow-lg transform group-hover:scale-110 transition-transform duration-200">
            <span className="font-bold text-xl text-black">#{index + 1}</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 flex-grow">
                {product.title}
              </h3>
              
              <div className="mt-auto">
                <p className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 0
                  }).format(Number(product.price))}
                </p>
                
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block w-full text-center py-2 px-3 text-sm font-semibold text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Ver Ranking
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
