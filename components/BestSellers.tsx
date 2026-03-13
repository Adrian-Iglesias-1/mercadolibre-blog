'use client';

import { Product } from '@/types';
import Link from 'next/link';

interface BestSellersProps {
  products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-surface2-sh rounded-xl border-2 border-dashed border-white/10">
        <p className="text-text-muted-sh">No se pudieron cargar los productos más vendidos en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {products.map((product, index) => {
        const imageUrl = product.imageUrl?.startsWith('//')
          ? `https:${product.imageUrl}`
          : product.imageUrl;

        return (
          <div 
            key={product.id} 
            className="group relative bg-surface2-sh rounded-2xl p-4 shadow-sm border border-white/10 hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Badge de Ranking */}
            <div className="absolute -top-3 -left-3 w-10 h-10 bg-black-sh text-accent-sh rounded-full flex items-center justify-center font-black shadow-lg z-10 border-2 border-accent-sh">
              {index + 1}
            </div>

            {/* Imagen del Producto */}
            <div className="relative h-48 w-full mb-4 rounded-xl overflow-hidden bg-surface3-sh flex items-center justify-center">
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('-O.')) {
                    target.src = target.src.replace('-O.', '-W.');
                  } else if (target.src.includes('-W.')) {
                    target.src = target.src.replace('-W.', '-V.');
                  } else {
                    target.style.opacity = '0.15';
                  }
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-medium text-text-sh line-clamp-2 mb-2 group-hover:text-accent-sh transition-colors">
                {product.title}
              </h3>
              
              <div className="mt-auto">
                <p className="text-2xl font-black text-white">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 0
                  }).format(Number(product.price))}
                </p>
                
                <Link 
                  href={product.productUrl}
                  target="_blank"
                  className="mt-4 block w-full bg-accent-sh hover:bg-[#d4eb3a] text-black-sh text-center py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  Ver en Mercado Libre
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
