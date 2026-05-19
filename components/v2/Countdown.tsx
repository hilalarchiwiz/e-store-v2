"use client";

import React, { useState, useEffect } from "react";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
              days--;
              if (days < 0) {
                // Timer finished, reset to default stateful loop or freeze at zero
                clearInterval(timer);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
      <div className="relative bg-emerald-deep rounded-[32px] p-10 md:p-20 overflow-hidden group shadow-2xl">
        {/* Abstract patterns */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] group-hover:bg-primary/30 transition-colors duration-500"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-block bg-primary px-4 py-1 rounded-full">
            <p className="font-label-bold text-label-bold text-on-primary uppercase tracking-widest">
              Hurry Up!
            </p>
          </div>
          
          <h2 className="font-display-hero text-white text-display-hero-mobile md:text-display-hero">
            Green Friday <span className="text-primary-fixed">Flash Sale</span>
          </h2>
          
          <p className="font-body-lg text-body-lg text-surface-variant/80">
            Get massive discounts on our most popular sustainable products.
            Precision performance at unprecedented value.
          </p>

          {/* Countdown */}
          <div className="flex justify-center gap-4 md:gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-display-hero text-white text-3xl md:text-4xl border border-white/20 shadow-lg">
                {formatNumber(timeLeft.days)}
              </div>
              <span className="mt-2 text-white/60 font-label-bold uppercase tracking-wider text-[10px]">
                Days
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-display-hero text-white text-3xl md:text-4xl border border-white/20 shadow-lg">
                {formatNumber(timeLeft.hours)}
              </div>
              <span className="mt-2 text-white/60 font-label-bold uppercase tracking-wider text-[10px]">
                Hours
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-display-hero text-white text-3xl md:text-4xl border border-white/20 shadow-lg">
                {formatNumber(timeLeft.minutes)}
              </div>
              <span className="mt-2 text-white/60 font-label-bold uppercase tracking-wider text-[10px]">
                Mins
              </span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-display-hero text-white text-3xl md:text-4xl border border-white/20 shadow-lg">
                {formatNumber(timeLeft.seconds)}
              </div>
              <span className="mt-2 text-white/60 font-label-bold uppercase tracking-wider text-[10px]">
                Secs
              </span>
            </div>
          </div>

          <button className="bg-primary-container hover:bg-primary-fixed text-on-primary-container font-bold px-12 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer shadow-lg hover:scale-105">
            Access Sale Now
            <span className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </button>
        </div>
      </div>
    </section>
  );
}

