"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

const PriceDropdown = ({ min, max }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toggleDropdown, setToggleDropdown] = useState(true);

  // Initialize values from URL, if empty use the DB min/max
  const [selectedPrice, setSelectedPrice] = useState({
    from: Number(searchParams.get("minPrice")) || min,
    to: Number(searchParams.get("maxPrice")) || max,
  });

  useEffect(() => {
    const urlMin = searchParams.get("minPrice");
    const urlMax = searchParams.get("maxPrice");

    // If URL params are missing but state is different, reset state
    if (!urlMin && !urlMax) {
      setSelectedPrice({ from: min, to: max });
    }
  }, [searchParams, min, max]);

  useEffect(() => {
    // 1. If the current state matches the defaults, don't push to URL.
    // This allows "Clean All" to work without the slider putting values back.
    if (selectedPrice.from === min && selectedPrice.to === max) {
      return;
    }

    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      // 2. Only set params if they are actually filtering something
      params.set("minPrice", selectedPrice.from.toString());
      params.set("maxPrice", selectedPrice.to.toString());

      router.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(handler);
  }, [selectedPrice, min, max, router]); // searchParams removed from here to prevent infinite loops

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className="cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5"
      >
        <p className="text-dark">Price Range</p>
        <button
          type="button"
          className={`text-dark ease-out duration-200 ${toggleDropdown && 'rotate-180'}`}
        >
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className={`p-6 ${toggleDropdown ? 'block' : 'hidden'}`}>
        <div className="price-range">
          <RangeSlider
            id="range-slider-gradient"
            min={min}
            max={max}
            step={100}
            // Ensure the value prop uses the state
            value={[selectedPrice.from, selectedPrice.to]}
            onInput={(e) =>
              setSelectedPrice({
                from: Math.floor(e[0]),
                to: Math.ceil(e[1]),
              })
            }
          />

          <div className="price-amount flex items-center justify-between pt-4">
            <div className="text-custom-xs text-dark-4 flex flex-col rounded border border-gray-3/80 p-2">
              <span className="text-[10px] uppercase text-gray-500">Min</span>
              <span className="font-bold">Rs. {selectedPrice.from.toLocaleString()}</span>
            </div>

            <div className="text-custom-xs text-dark-4 flex flex-col rounded border border-gray-3/80 p-2 text-right">
              <span className="text-[10px] uppercase text-gray-500">Max</span>
              <span className="font-bold">Rs. {selectedPrice.to.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDropdown;