"use client";

import React, { useState, useEffect } from "react";

const Countdown = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const deadline = "December, 31, 2026";

  useEffect(() => {
    const getTime = () => {
      const time = Date.parse(deadline) - Date.now();
      if (time > 0) {
        setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((time / 1000 / 60) % 60));
        setSeconds(Math.floor((time / 1000) % 60));
      }
    };
    getTime();
    const interval = setInterval(getTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 sm:py-12">
      <div className="bg-primary-dark rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-dark/40">
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[120px] sm:text-[200px]">eco</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
          <span className="text-primary bg-white px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
            Hurry Up!
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Green Friday Flash Sale
          </h2>
          <p className="text-white/80 text-xs sm:text-base max-w-xl mx-auto px-2">
            Get massive discounts on our most popular sustainable products. Offer ends in:
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-8 mt-2 sm:mt-4 w-full max-w-md mx-auto">
            <div className="flex flex-col items-center gap-1">
              <div className="bg-white/10 backdrop-blur-lg w-full aspect-square max-h-16 sm:max-h-24 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-5xl font-black border border-white/20 shadow-inner">
                {days < 10 ? `0${days}` : days}
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-75">
                Days
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="bg-white/10 backdrop-blur-lg w-full aspect-square max-h-16 sm:max-h-24 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-5xl font-black border border-white/20 shadow-inner">
                {hours < 10 ? `0${hours}` : hours}
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-75">
                Hours
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="bg-white/10 backdrop-blur-lg w-full aspect-square max-h-16 sm:max-h-24 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-5xl font-black border border-white/20 shadow-inner">
                {minutes < 10 ? `0${minutes}` : minutes}
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-75">
                Mins
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="bg-white/10 backdrop-blur-lg w-full aspect-square max-h-16 sm:max-h-24 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl md:text-5xl font-black border border-white/20 shadow-inner">
                {seconds < 10 ? `0${seconds}` : seconds}
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-75">
                Secs
              </span>
            </div>
          </div>

          <button className="w-full sm:w-auto mt-4 sm:mt-8 bg-primary hover:bg-primary-dark border-2 border-primary text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base">
            Access Sale Now{" "}
            <span className="material-symbols-outlined text-base sm:text-xl">bolt</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Countdown;
