import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

function CustomDropdown({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm transition-all duration-300 ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <span className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-500'}`}>
          {value || placeholder}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-gray-400 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`absolute z-20 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <ul className="max-h-60 overflow-y-auto py-1 space-y-1">
          <li
            onClick={() => { onChange(""); setIsOpen(false); }}
            className={`px-4 py-2.5 mx-1 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-blue-50 flex items-center justify-between ${
              value === "" ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-600'
            }`}
          >
            <span>{placeholder}</span>
            {value === "" && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
          </li>
          {options.map((option) => (
            <li
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`px-4 py-2.5 mx-1 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-blue-50 flex items-center justify-between ${
                value === option ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700'
              }`}
            >
              <span>{option}</span>
              {value === option && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ServicesFilter({
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedCity,
  setSelectedCity,
  cities
}) {
  return (
    <aside className="w-full md:w-1/4 p-6 bg-gray-50 rounded-2xl h-fit mb-6 md:mb-0 border border-gray-100 shadow-sm md:sticky top-10">
      <h2 className="font-bold text-xl mb-6 text-gray-800">Filter</h2>
      <div className="space-y-5">
        
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">Category</label>
          <CustomDropdown
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="All Categories"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">Location</label>
          <CustomDropdown
            options={cities || []}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="All Locations"
          />
        </div>
      </div>
    </aside>
  );
}