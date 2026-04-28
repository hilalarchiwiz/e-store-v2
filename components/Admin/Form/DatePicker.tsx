'use client'
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { parseISO, isValid } from 'date-fns'; // Helpful for string conversion

import "react-datepicker/dist/react-datepicker.css";

const DatePickerCalender = ({ defaultValue }: any) => {
  const [startDate, setStartDate] = useState(null);

  useEffect(() => {
    console.log(defaultValue);
    if (defaultValue) {
      const parsedDate = typeof defaultValue === 'string'
        ? parseISO(defaultValue)
        : defaultValue;

      if (isValid(parsedDate)) {
        setStartDate(parsedDate);
      }
    }
  }, [defaultValue]);

  return (
    <div className="relative group w-full">
      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 z-10 pointer-events-none" />

      {/* 1. ADD THIS HIDDEN INPUT */}
      <input
        type="hidden"
        name="expiryDate"
        value={startDate ? startDate.toISOString() : ""}
      />

      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/20 
                   focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
        dateFormat="MMMM d, yyyy"
        placeholderText="Select date"
        isClearable
      />
    </div>
  );
};

export default DatePickerCalender;