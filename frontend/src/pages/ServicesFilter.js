import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck, faFilter } from '@fortawesome/free-solid-svg-icons';

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
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`dropdown-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''}`}
      >
        <span className="dropdown-label">{value || placeholder}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            <li
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`dropdown-item ${value === "" ? 'selected' : ''}`}
            >
              <span>{placeholder}</span>
              {value === "" && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
            </li>
            {options.map((option) => (
              <li
                key={option}
                onClick={() => { onChange(option); setIsOpen(false); }}
                className={`dropdown-item ${value === option ? 'selected' : ''}`}
              >
                <span>{option}</span>
                {value === option && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ServicesFilter({
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedCity,
  setSelectedCity,
  cities,
  sortBy,
  setSortBy
}) {
  const sortOptions = ["Most Popular (Hires)", "Highest Rated", "Newest"];

  return (
    <div className="filter-sidebar-inner">
      <div className="filter-header">
        <FontAwesomeIcon icon={faFilter} className="filter-icon" />
        <h2 className="filter-title">Filters</h2>
      </div>
      
      <div className="filter-groups-wrapper">
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <CustomDropdown
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="All Categories"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Location</label>
          <CustomDropdown
            options={cities || []}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="All Locations"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <CustomDropdown
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Default"
          />
        </div>
      </div>
      
      {(selectedCategory || selectedCity || sortBy) && (
        <button 
          className="clear-filters-btn"
          onClick={() => {
            setSelectedCategory("");
            setSelectedCity("");
            setSortBy("");
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}