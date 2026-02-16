import React from 'react';

export default function ServicesFilter({
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedCity,
  setSelectedCity,
  cities
}) {
  return (
    <aside className="w-full md:w-1/4 p-6 bg-gray-50 rounded-lg h-fit mb-6 md:mb-0">
      <h2 className="font-bold text-xl mb-4">Filter</h2>
      {/* Dropdown Filters */}
      <div className="space-y-4">
        <select className="w-full p-2 border rounded bg-white" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select className="w-full p-2 border rounded bg-white" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">All Locations</option>
          {cities && cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>
    </aside>
  );
}