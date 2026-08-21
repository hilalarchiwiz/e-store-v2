'use client'
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { parseISO, isValid } from 'date-fns'; // Helpful for string conversion

import "react-datepicker/dist/react-datepicker.css";

interface DatePickerCalenderProps {
  defaultValue?: string | Date | null;
}

const parseInitialDate = (value: DatePickerCalenderProps['defaultValue']) => {
  if (!value) return null;
  const parsedDate = typeof value === 'string' ? parseISO(value) : value;
  return isValid(parsedDate) ? parsedDate : null;
};

const DatePickerCalender = ({ defaultValue }: DatePickerCalenderProps) => {
  const [startDate, setStartDate] = useState<Date | null>(() => parseInitialDate(defaultValue));

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
