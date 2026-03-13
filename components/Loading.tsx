'use client';

import { useEffect, useState } from 'react';

interface LoadingProps {
  message?: string;
  showSpinner?: boolean;
}

export default function Loading({ message = "Cargando...", showSpinner = true }: LoadingProps) {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      {showSpinner && (
        <div className="w-8 h-8 mb-4 animate-spin">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              style={{ color: '#FFE600' }}
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              style={{ color: '#FFE600' }}
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      <p className="text-gray-600 font-medium text-center">
        {message}{dots}
      </p>
    </div>
  );
}
