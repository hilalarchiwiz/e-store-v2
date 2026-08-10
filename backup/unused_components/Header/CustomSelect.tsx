import { usePathname, useSearchParams } from "next/navigation"; // Added useSearchParams
import React, { useState, useEffect, useRef } from "react";

const CustomSelect = ({ categories = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchParams = useSearchParams();

  // Get category ID from URL query string (?category=...)
  const categoryIdFromUrl = searchParams.get("category");

  // Sync state with URL whenever categories or URL params change
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (categoryIdFromUrl && categories.length > 0) {
      const found = categories.find((cat) => String(cat.id) === String(categoryIdFromUrl));
      setSelectedOption(found || null);
    } else {
      setSelectedOption(null); // Reset to "All Categories" if no ID in URL
    }
  }, [categoryIdFromUrl, categories]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleOptionClick = (category) => {
    setSelectedOption(category);
    setIsOpen(false);
    onSelect(category.id);
  };

  return (
    <div ref={dropdownRef} className="dropdown-content custom-select relative" style={{ width: "200px" }}>
      <div
        className={`select-selected whitespace-nowrap cursor-pointer ${isOpen ? "select-arrow-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.title || "All Categories"}
      </div>

      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {/* Optional: Add an "All Categories" reset option */}
        <div
          className="select-item block px-2 py-2 cursor-pointer"
          onClick={() => handleOptionClick({ id: "", title: "All Categories" })}
        >
          All Categories
        </div>

        {categories.map((category, index) => (
          <div
            key={category.id || index}
            onClick={() => handleOptionClick(category)}
            className={`select-item ${String(selectedOption?.id) === String(category.id) ? "same-as-selected" : ""} block px-2 py-2 cursor-pointer`}
          >
            {category.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;