"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { FlashSaleSettings } from "@/lib/flash-sale";

const Countdown = ({ sale, initialRemaining }: { sale: FlashSaleSettings; initialRemaining: number }) => {
  const [remaining, setRemaining] = useState(initialRemaining);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, Date.parse(sale.endsAt) - Date.now()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sale.endsAt]);

  if (!sale.enabled || remaining <= 0) return null;
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor(remaining / 3600000) % 24;
  const minutes = Math.floor(remaining / 60000) % 60;
  const seconds = Math.floor(remaining / 1000) % 60;

  return (
    <section className="py-8 sm:py-12">
      <div className="bg-primary-dark dark:bg-surface rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-dark/40 dark:shadow-black/40">
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[120px] sm:text-[200px]">eco</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
          <span className="text-primary bg-white px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest">
            {sale.badge}
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {sale.title}
          </h2>
          <p className="text-white/80 text-xs sm:text-base max-w-xl mx-auto px-2">
            {sale.description}
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

          <Link href={sale.link} className="w-full sm:w-auto mt-4 sm:mt-8 bg-primary hover:bg-primary-dark border-2 border-primary text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base">
            {sale.buttonText}{" "}
            <span className="material-symbols-outlined text-base sm:text-xl">bolt</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Countdown;
