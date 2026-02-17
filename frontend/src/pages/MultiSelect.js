import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function MultiSelect({ label, options, selectedValues, onChange, required, placeholder, onBlur }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isOpen) {
          if (onBlur) onBlur();
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onBlur, isOpen]);

  const toggleOption = (val) => {
    const next = selectedValues.includes(val)
      ? selectedValues.filter(v => v !== val)
      : [...selectedValues, val];
    onChange(next);
  };

  return (
    <div className="w-full mb-5" ref={containerRef}>
      {/* Label avec étoile rouge */}
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label} {required}
      </label>

      <div className="relative">
        {/* Input Styled Box */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center justify-between w-full px-4 py-3 border rounded-lg cursor-pointer transition-all
            ${isOpen ? 'border-zinc-900 ring-2 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <span className="text-gray-400 text-[15px]">{placeholder || "Select a category"}</span>

          <div className="flex items-center gap-2">
            {/* Bouton reset global (X) si sélectionné */}
            {selectedValues.length > 0 && (
              <X size={18} className="text-gray-300 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onChange([]); }} />
            )}
            {/* Barre de séparation verticale */}
            <div className="w-[1px] h-5 bg-gray-200 mx-1" />
            <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Menu déroulant */}
        {isOpen && (
          <div className="absolute z-30 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => toggleOption(opt)}
                className={`px-4 py-3 text-[14px] cursor-pointer transition-colors
                  ${selectedValues.includes(opt) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags de sélection (en dessous) */}
      <div className="flex flex-wrap gap-2 mt-3">
        {selectedValues.map((val) => (
          <div key={val} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700">
            {val}
            <X size={14} className="cursor-pointer hover:text-red-500 text-gray-400" onClick={() => toggleOption(val)} />
          </div>
        ))}
      </div>
    </div>
  );
};
