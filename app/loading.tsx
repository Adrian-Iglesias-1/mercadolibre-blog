export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and description skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-100 rounded w-3/4 max-w-2xl"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters skeleton */}
          <div className="lg:w-80 flex-shrink-0 animate-pulse">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 h-[600px]">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
                  <div className="h-8 bg-gray-50 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Grid skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-100 rounded w-32"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 h-[450px] animate-pulse">
                  <div className="bg-gray-100 h-48 rounded-2xl mb-6"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="mt-auto border-t border-gray-50 pt-4">
                    <div className="h-3 bg-gray-50 rounded w-1/4 mb-2"></div>
                    <div className="h-8 bg-gray-100 rounded w-1/2 mb-4"></div>
                    <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
