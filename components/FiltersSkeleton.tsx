export default function FiltersSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Categories Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="space-y-3">
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>

      {/* Brand Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Rating Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-3 h-3 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
