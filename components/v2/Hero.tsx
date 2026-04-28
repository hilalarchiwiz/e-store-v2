"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { HeroSlide } from "@/app/v2/page";

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 0,
    title: "Live Green, Shop Better",
    description:
      "Upgrade your home with planet-friendly essentials — curated for quality, sustainability, and effortless style.",
    img: "/images/hero/hero-bg.png",
    link: "/v2/shop",
  },
];

const AUTO_PLAY_INTERVAL = 5000;

export default function Hero({ slides = [] }: { slides: HeroSlide[] }) {
  const data = slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number, dir: "left" | "right" = "right") => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 400);
    },
    [isAnimating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % data.length, "right");
  }, [current, data.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + data.length) % data.length, "left");
  }, [current, data.length, goTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
  }, [next]);

  useEffect(() => {
    if (data.length <= 1) return;
    timerRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, data.length]);

  const handlePrev = () => {
    prev();
    resetTimer();
  };

  const handleNext = () => {
    next();
    resetTimer();
  };

  const handleDot = (i: number) => {
    if (i === current) return;
    goTo(i, i > current ? "right" : "left");
    resetTimer();
  };

  const slide = data[current];

  const translateClass =
    isAnimating
      ? direction === "right"
        ? "-translate-x-4 opacity-0"
        : "translate-x-4 opacity-0"
      : "translate-x-0 opacity-100";

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl mx-auto mt-4 mb-2 shadow-2xl bg-[#0a1a0f]"
      style={{ backgroundImage: `url('${slide.img}')`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Dark gradient overlays */}
      <div className="absolute inset-0 z-0 bg-linear-to-r from-black/80 via-black/50 to-black/10" />
      <div className="absolute inset-0 z-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col justify-center min-h-105 md:min-h-135 px-8 md:px-16 py-12 md:py-16 max-w-3xl transition-all duration-400 ease-out ${translateClass}`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 backdrop-blur-sm border border-primary/40 text-primary rounded-full text-xs font-bold tracking-widest uppercase w-fit mb-6">
          <span className="material-symbols-outlined text-sm">verified</span>
          Eco-Conscious Shopping
        </div>

        {/* Title */}
        <h1 className="text-white text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-5 drop-shadow-lg">
          {slide.title.split(",").map((part, i, arr) =>
            i < arr.length - 1 ? (
              <React.Fragment key={i}>
                {part},<br />
              </React.Fragment>
            ) : (
              <span key={i} className="text-primary">
                {part}
              </span>
            )
          )}
        </h1>

        {/* Description */}
        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
          {slide.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          {slide.link ? (
            <Link
              href={slide.link}
              className="px-8 h-13 inline-flex items-center gap-2 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 group"
            >
              Shop Now
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          ) : (
            <Link
              href="/shop"
              className="px-8 h-13 inline-flex items-center gap-2 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 group"
            >
              Shop All Products
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          )}
          <Link
            href="/about"
            className="px-8 h-13 inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold text-base hover:bg-white/20 transition-all"
          >
            Our Story
          </Link>
        </div>
      </div>

      {/* Slide counter badge */}
      {data.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {data.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDot(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${i === current
                    ? "w-8 h-2.5 bg-primary"
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prev / Next arrows */}
      {data.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-primary hover:border-primary transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-primary hover:border-primary transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </>
      )}

      {/* Progress bar */}
      {data.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
          <div
            key={current}
            className="h-full bg-primary origin-left"
            style={{
              animation: `slideProgress ${AUTO_PLAY_INTERVAL}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .duration-400 {
          transition-duration: 400ms;
        }
        .h-13 {
          height: 3.25rem;
        }
      `}</style>
    </section>
  );
}
