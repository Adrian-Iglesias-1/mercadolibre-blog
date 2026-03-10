'use client';

import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative overflow-hidden">
      {/* Imagen Premium Container */}
      <div className="relative h-48 w-full mb-6 rounded-2xl overflow-hidden bg-gray-50/50 p-4 group-hover:bg-white transition-colors duration-500">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-contain transition-transform duration-700 group-hover:scale-110"
        />
        {/* Badge de Categoría Flotante */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-sm ${product.category.color}`}>
          {product.category.name}
        </div>
      </div>

      {/* Info Body */}
      <div className="flex-1 flex flex-col">
        <div className="mb-1">
          <span className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase opacity-80">{product.brand}</span>
        </div>

        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[3rem] mb-4 group-hover:text-blue-700 transition-colors leading-tight">
          {product.title}
        </h3>

        <div className="mt-auto flex flex-col">
          <div className="border-t border-gray-50 pt-4 mb-4 min-h-[4.5rem] flex flex-col justify-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Precio Final</span>
              <span className="text-2xl font-black text-gray-900 leading-none tracking-tight">
                {new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits: 0
                }).format(Number(product.price))}
              </span>
            </div>

            <div className="mt-1.5 inline-flex items-center gap-1 bg-green-50 text-green-600 text-[11px] font-black px-2 py-0.5 rounded-full border border-green-100 self-start">
              <span>🚚</span>
              <span className="uppercase tracking-wide">Envío Gratis</span>
            </div>
          </div>

          <Link 
            href={product.productUrl}
            target="_blank"
            className="block w-full bg-mercado-yellow hover:bg-yellow-400 text-gray-900 text-center py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all transform active:scale-95 shadow-md hover:shadow-xl border-b-4 border-yellow-600 active:border-b-0"
          >
            Ver en Mercado Libre
          </Link>
        </div>
      </div>
    </div>
  );
}
