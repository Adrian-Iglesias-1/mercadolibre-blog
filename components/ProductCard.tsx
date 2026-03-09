'use client';

import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <div className="aspect-w-16 aspect-h-12 bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x200?text=Producto+no+disponible';
            }}
          />
        </div>
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            -{product.discount}%
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <span className="text-xs font-medium">{product.category.icon}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {product.category.name}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 overflow-hidden">
          {product.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                maximumFractionDigits: 0
              }).format(Number(product.price))}
            </p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">
                {product.originalPrice}
              </p>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-medium">{product.rating}</span>
              {product.reviews && (
                <span className="text-xs text-gray-500">({product.reviews})</span>
              )}
            </div>
          )}
        </div>
        
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-mercado-yellow hover:bg-yellow-400 text-black font-semibold text-center py-3 px-4 rounded transition-colors duration-200"
        >
          Ver en MercadoLibre
        </a>
      </div>
    </div>
  );
}
