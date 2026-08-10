"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CustomSelect = ({ options }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Determine active option based on URL or default to first option
  const currentSort = searchParams.get("sort") || options[0].value;
  const selectedOption = options.find(opt => opt.value === currentSort) || options[0];

  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", option.value);

    setIsOpen(false);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="custom-select custom-select-2 flex-shrink-0 relative" ref={selectRef}>
      <div
        className={`select-selected whitespace-nowrap cursor-pointer ${isOpen ? "select-arrow-active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item cursor-pointer ${selectedOption.value === option.value ? "same-as-selected" : ""
              }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;