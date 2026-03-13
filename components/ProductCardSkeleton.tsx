interface ProductCardSkeletonProps {
  count?: number;
}

export default function ProductCardSkeleton({ count = 1 }: ProductCardSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div 
          key={index} 
          className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden animate-pulse"
        >
          {/* Imagen Skeleton */}
          <div className="relative h-48 w-full mb-6 rounded-2xl overflow-hidden bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-shimmer"></div>
            {/* Badge de Categoría Skeleton */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gray-200 h-6 w-20"></div>
          </div>

          {/* Info Skeleton */}
          <div className="flex-1 flex flex-col">
            {/* Brand Skeleton */}
            <div className="mb-1">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>

            {/* Title Skeleton */}
            <div className="mb-4 min-h-[3rem] space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>

            {/* Price Skeleton */}
            <div className="mt-auto flex flex-col">
              <div className="border-t border-gray-50 pt-4 mb-4 min-h-[4.5rem] flex flex-col justify-center">
                <div className="flex flex-col space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>

                {/* Envío Gratis Skeleton */}
                <div className="mt-1.5 h-6 bg-gray-200 rounded-full w-28"></div>
              </div>

              {/* CTA Button Skeleton */}
              <div className="w-full h-12 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
