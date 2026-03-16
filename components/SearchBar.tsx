'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle Enter key and real-time search suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Buscar productos en tiempo real..."
          className="w-full px-4 py-3 pr-12 text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-mercado-yellow transition-colors duration-200"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-mercado-yellow hover:bg-yellow-400 text-black p-2 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Search suggestions */}
      {query.trim().length >= 2 && (
        <div className="mt-2 text-sm text-gray-500 text-center">
          💡 Presiona Enter para buscar &quot;{query}&quot; en MercadoLibre
        </div>
      )}
    </form>
  );
}
