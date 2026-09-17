"use client";

import SiteIcon from "@/components/v2/SiteIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface DBReview {
  id: string | number;
  name: string | null;
  rating: number;
  comment: string;
  createdAt: Date | string;
  product: { title: string };
}

interface FeedbackProps {
  reviews?: DBReview[];
}

const Feedback: React.FC<FeedbackProps> = ({ reviews = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pageCount = Math.max(1, Math.ceil(reviews.length / 2));

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const firstReview = container.firstElementChild as HTMLElement | null;
    const distance = firstReview
      ? firstReview.getBoundingClientRect().width + 16
      : container.clientWidth;
    container.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (reviews.length < 2 || isPaused) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const interval = window.setInterval(() => {
      const container = scrollRef.current;
      if (!container || container.scrollWidth <= container.clientWidth) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      const isAtEnd = container.scrollLeft >= maxScroll - 4;

      if (isAtEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [isPaused, reviews.length, scroll]);

  const updateActivePage = () => {
    const container = scrollRef.current;
    if (!container || container.scrollWidth <= container.clientWidth) {
      setActivePage(0);
      return;
    }

    const progress = container.scrollLeft / (container.scrollWidth - container.clientWidth);
    setActivePage(Math.min(pageCount - 1, Math.round(progress * (pageCount - 1))));
  };

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black tracking-[-0.025em] text-foreground sm:text-[26px]">
          What Our Customers Say
        </h2>
      </div>

      {reviews.length > 0 ? (
        <>
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsPaused(false);
              }
            }}
          >
            <div
              ref={scrollRef}
              onScroll={updateActivePage}
              className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-0.5 pb-1 scroll-smooth"
            >
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="flex min-h-[164px] min-w-[calc(100%-4px)] snap-start items-start gap-4 rounded-lg border border-black/10 bg-white px-5 py-6 shadow-[0_2px_7px_rgba(0,0,0,0.16)] dark:border-white/10 dark:bg-surface sm:min-w-[calc(50%-8px)] sm:px-6 lg:min-w-[calc((100%-32px)/3)]"
                >
                  <div
                    aria-hidden="true"
                    className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#f1f1f1] text-lg font-bold uppercase text-[#555] dark:bg-white/10 dark:text-white"
                    aria-label={`${review.name || "Anonymous"} avatar`}
                  >
                    {review.name?.trim().slice(0, 2).toUpperCase() || "AN"}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="mb-2 flex gap-2 text-[#f2bb00]" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <FontAwesomeIcon
                          key={index}
                          icon={faStar}
                          className={`text-[15px] ${index < review.rating ? "opacity-100" : "opacity-25"}`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="line-clamp-3 text-[15px] leading-[1.18] text-[#555] dark:text-white/75 sm:text-base">
                      {review.comment}
                    </p>
                    <p className="mt-2 text-sm font-medium text-primary sm:text-base">
                      {review.name || "Anonymous"}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous reviews"
              className="absolute left-0 top-1/2 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f4f4f4] text-black shadow-sm transition hover:bg-white"
            >
              <SiteIcon className="text-base">chevron_left</SiteIcon>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next reviews"
              className="absolute right-0 top-1/2 z-10 flex size-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f4f4f4] text-black shadow-sm transition hover:bg-white"
            >
              <SiteIcon className="text-base">chevron_right</SiteIcon>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6" aria-label="Review carousel position">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const container = scrollRef.current;
                  if (!container) return;
                  const maxScroll = container.scrollWidth - container.clientWidth;
                  container.scrollTo({
                    left: pageCount === 1 ? 0 : (maxScroll * index) / (pageCount - 1),
                    behavior: "smooth",
                  });
                }}
                aria-label={`Go to review page ${index + 1}`}
                className={`size-3 rounded-full transition-colors ${index === activePage ? "bg-primary" : "bg-[#606060]"}`}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-black/10 bg-white text-sm text-muted shadow-sm dark:border-white/10 dark:bg-surface">
          No reviews yet.
        </div>
      )}
    </section>
  );
};

export default Feedback;
