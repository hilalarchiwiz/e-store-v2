"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { HeroSlide } from "@/app/(site)/page";

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 0,
    title: "Powerful Performance, Unmatched Portability",
    description:
      "Upgrade your workflow with high-performance laptops and tablets — curated for power, efficiency, and effortless style.",
    img: "/images/hero/hero-bg.png",
    link: "/shop",
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
    [isAnimating],
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

  const translateClass = isAnimating
    ? direction === "right"
      ? "-translate-x-4 opacity-0"
      : "translate-x-4 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <section
      className="relative w-full overflow-hidden mx-auto mb-2  bg-[#0a1a0f]"
      style={{
        backgroundImage: `url('${slide.img}')`,
        backgroundColor: "#0a1a0fa4",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "darken",
        backgroundRepeat: "no-repeat",
        maskImage: "linear-gradient(to right, #0a1a0f, #0a1a0f)",
        WebkitMaskImage: "linear-gradient(to right, #0a1a0f, #0a1a0f)",
        maskSize: "cover",
        WebkitMaskSize: "cover",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskComposite: "source-in",
        WebkitMaskComposite: "source-in",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
    >
      {/* Content */}
      <div
        className={`relative z-10 flex flex-col justify-center min-h-105 md:min-h-160 px-8 md:px-16   max-w-3xl transition-all duration-400 ease-out ${translateClass}`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#006d3033] backdrop-blur-sm text-[#82fb9b] rounded-full text-[12px] leading-[16px] font-bold tracking-widest uppercase w-fit mb-6">
          <span
            className="material-symbols-outlined text-sm"
            style={{
              fontSize: "12px",
              color: "#82fb9b",
            }}
          >
            verified
          </span>
          Premium Computing Gear
        </div>

        {/* Title */}
        <h1 className="text-white text-[48px] font-black leading-tight tracking-tight mb-5 drop-shadow-lg">
          {(() => {
            const words = slide.title.split(/\s+/);
            if (words.length > 3) {
              const firstPart = words.slice(0, 3).join(" ");
              const secondPart = words.slice(3).join(" ");
              return (
                <>
                  {firstPart}
                  <br />
                  <span className="text-[#65de82]">{secondPart}</span>
                </>
              );
            }
            return slide.title;
          })()}
        </h1>

        {/* Description */}
        <p className="text-[#e0e3e5] text-[18px] md:text-[18px] leading-[28px] font-family-inter font-normal mb-8 max-w-lg">
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
            className="px-8 h-13 inline-flex items-center border border-white bg-transparent text-white rounded-xl font-bold text-base hover:bg-white/20 transition-all"
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
                className={`transition-all duration-300 rounded-full ${
                  i === current
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
          {/* <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-primary hover:border-primary transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">
              chevron_left
            </span>
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-primary hover:border-primary transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">
              chevron_right
            </span>
          </button> */}
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
