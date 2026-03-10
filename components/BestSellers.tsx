'use client';

import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface BestSellersProps {
  products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500">No se pudieron cargar los productos más vendidos en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="group relative bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
        >
          {/* Badge de Ranking */}
          <div className="absolute -top-3 -left-3 w-10 h-10 bg-slate-900 text-mercado-yellow rounded-full flex items-center justify-center font-black shadow-lg z-10 border-2 border-mercado-yellow">
            {index + 1}
          </div>

          {/* Imagen del Producto */}
          <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden bg-gray-50">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
              className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-sm font-medium text-gray-700 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
            
            <div className="mt-auto">
              <p className="text-2xl font-black text-gray-900">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits: 0
                }).format(Number(product.price))}
              </p>
              
              <Link 
                href={product.productUrl}
                target="_blank"
                className="mt-4 block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                Ver en Mercado Libre
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
