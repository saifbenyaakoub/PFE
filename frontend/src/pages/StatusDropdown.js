import React, { useState, useRef, useEffect } from 'react';
import './StatusDropdown.css';

const StatusDropdown = ({ booking, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const STATUS_META = {
    confirmed: { label: "Confirmed", bg: "#e0f2fe", color: "#0284c7" },
    completed: { label: "Completed", bg: "#dcfce7", color: "#166534" },
    cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b" }
  };

  const currentMeta = STATUS_META[booking.status] || STATUS_META.confirmed;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button 
        className="custom-dropdown-button"
        style={{ backgroundColor: currentMeta.bg, color: currentMeta.color }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentMeta.label}
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div
              key={key}
              className="custom-dropdown-item"
              onClick={() => {
                onStatusChange(booking.id, key);
                setIsOpen(false);
              }}
            >
              <span className="status-dot" style={{ backgroundColor: meta.color }}></span>
              {meta.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;