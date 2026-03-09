'use client';

import { useState } from 'react';
import { FilterOptions, Category } from '@/types';

interface FiltersProps {
  categories: Category[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export default function Filters({ categories, filters, onFiltersChange }: FiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange || [0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedBrand, setSelectedBrand] = useState(filters.brand || '');
  const [selectedRating, setSelectedRating] = useState(filters.rating || 0);

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categoryId === selectedCategory ? '' : categoryId;
    setSelectedCategory(newCategory);
    onFiltersChange({ ...filters, category: newCategory });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    onFiltersChange({ ...filters, priceRange: [min, max] });
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    onFiltersChange({ ...filters, brand });
  };

  const handleRatingChange = (rating: number) => {
    const newRating = rating === selectedRating ? 0 : rating;
    setSelectedRating(newRating);
    onFiltersChange({ ...filters, rating: newRating });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 100000]);
    setSelectedBrand('');
    setSelectedRating(0);
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-mercado-yellow hover:text-yellow-400 font-medium"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categorías</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategory === category.id}
                onChange={() => handleCategoryChange(category.id)}
                className="rounded text-mercado-yellow focus:ring-mercado-yellow"
              />
              <span className="flex items-center space-x-2">
                <span>{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Rango de Precio</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Mínimo: ${priceRange[0].toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), priceRange[1])}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Máximo: ${priceRange[1].toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Marca</h4>
        <input
          type="text"
          placeholder="Buscar por marca..."
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mercado-yellow"
        />
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Calificación Mínima</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRating === rating}
                onChange={() => handleRatingChange(rating)}
                className="rounded text-mercado-yellow focus:ring-mercado-yellow"
              />
              <span className="flex items-center space-x-1">
                <span className="text-yellow-400">{'★'.repeat(rating)}</span>
                <span className="text-gray-400">{'★'.repeat(5 - rating)}</span>
                <span className="text-sm">y más</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
