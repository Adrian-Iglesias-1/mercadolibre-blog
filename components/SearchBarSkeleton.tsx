export default function SearchBarSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative animate-pulse">
        <div className="w-full h-12 bg-gray-200 rounded-lg border-2 border-gray-300"></div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
}
