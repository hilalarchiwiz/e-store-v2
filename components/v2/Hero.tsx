"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
      aria-label="Featured products"
      aria-roledescription="carousel"
      className="relative mx-auto mt-4 mb-2 w-full overflow-hidden rounded-3xl border border-black/5 bg-[#eef1f0] shadow-xl shadow-black/5 dark:border-white/10 dark:bg-[#101010]"
    >
      {/* Soft neutral lighting and geometric detail frame the product. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,white,transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top_left,#292929,transparent_65%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 size-[600px] rounded-full border border-black/5 dark:border-white/5" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-20 size-[440px] rounded-full border border-black/5 dark:border-white/5" />

      <div className="relative grid items-center gap-8 px-6 pt-9 pb-6 sm:px-10 sm:pt-12 md:min-h-[480px] md:grid-cols-[0.95fr_1.05fr] md:gap-6 lg:min-h-[540px] lg:gap-12 lg:px-14 lg:pt-14">
        <div className={`min-w-0 transition-all duration-400 ease-out motion-reduce:transition-none ${translateClass}`}>
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary sm:text-xs">
            <span className="material-symbols-outlined text-base">laptop_mac</span>
            Premium Computing Gear
          </div>
          <h1 className="max-w-xl text-3xl font-black leading-[1.08] tracking-tight text-[#121714] sm:text-4xl lg:text-5xl xl:text-6xl dark:text-white [overflow-wrap:anywhere]">
            {slide.title}
          </h1>
          <div aria-hidden="true" className="my-5 h-1 w-12 rounded-full bg-primary sm:my-6" />
          <p className="max-w-lg text-sm leading-relaxed text-gray-600 sm:text-base lg:text-lg dark:text-gray-300">
            {slide.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <Link
              href={slide.link || "/shop"}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/15 transition-colors hover:bg-primary-dark sm:px-7 sm:text-base"
            >
              {slide.link ? "Shop Now" : "Shop All"}
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1 motion-reduce:transform-none">arrow_forward</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/15 px-6 py-3 text-sm font-bold text-[#121714] transition-colors hover:bg-white sm:px-7 sm:text-base dark:border-white/20 dark:text-white dark:hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* The actual slide image stays fully visible, without a dark overlay. */}
        <div className={`relative min-w-0 transition-all duration-400 ease-out motion-reduce:transition-none ${translateClass}`}>
          <div aria-hidden="true" className="absolute inset-x-8 bottom-0 h-10 rounded-[50%] bg-black/10 blur-2xl dark:bg-black/40" />
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm sm:rounded-3xl dark:border-white/10 dark:bg-[#1c1c1c]">
            <img
              key={slide.img}
              src={slide.img}
              alt={slide.title}
              width={800}
              height={600}
              fetchPriority={current === 0 ? "high" : "auto"}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {data.length > 1 && (
        <div className="relative mx-6 flex items-center justify-between gap-4 border-t border-black/10 py-5 sm:mx-10 lg:mx-14 dark:border-white/10">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {data.map((item, i) => (
              <button
                key={item.id}
                onClick={() => handleDot(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
                className="flex min-h-8 min-w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className={`h-2 rounded-full transition-all motion-reduce:transition-none ${i === current ? "w-7 bg-primary" : "w-2 bg-black/25 dark:bg-white/30"}`} />
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-2 text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
              {String(current + 1).padStart(2, "0")} / {String(data.length).padStart(2, "0")}
            </span>
            <button onClick={handlePrev} aria-label="Previous slide" className="flex size-10 items-center justify-center rounded-full border border-black/15 text-[#121714] transition-colors hover:border-primary hover:bg-primary hover:text-white dark:border-white/20 dark:text-white">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button onClick={handleNext} aria-label="Next slide" className="flex size-10 items-center justify-center rounded-full border border-black/15 text-[#121714] transition-colors hover:border-primary hover:bg-primary hover:text-white dark:border-white/20 dark:text-white">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
