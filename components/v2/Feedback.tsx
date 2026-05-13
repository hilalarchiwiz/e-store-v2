"use client";

import React, { useRef } from "react";

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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  const useDB = reviews.length > 0;

  return (
    <section className="px-6 py-16">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Satisfied Professionals
          </h2>
          <p className="text-[#121714]/60 dark:text-white/60">
            Real feedback from tech enthusiasts and professionals who upgraded
            their workflow with our high-performance gear.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="size-10 rounded-full border border-[#f1f4f2] dark:border-[#2a3a2f] flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="size-10 rounded-full border border-[#f1f4f2] dark:border-[#2a3a2f] flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-8 scroll-smooth"
      >
        {useDB ? (
          reviews.map((review, idx) => {
            const isHighlight = idx === 1;
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name ?? "User")}&background=${isHighlight ? "ffffff" : "4ade80"}&color=${isHighlight ? "16a34a" : "fff"}&size=96`;
            return (
              <div
                key={review.id}
                className={`min-w-87.5 md:min-w-100 p-8 rounded-2xl shadow-sm border transition-shadow ${
                  isHighlight
                    ? "bg-primary text-white shadow-xl shadow-primary/20 border-transparent"
                    : "bg-white dark:bg-[#2a3a2f] border-[#f1f4f2] dark:border-[#2a3a2f] hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`size-12 rounded-full bg-cover bg-center shrink-0 ${isHighlight ? "border-2 border-white" : ""}`}
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                  />
                  <div>
                    <h3 className="font-bold">{review.name ?? "Anonymous"}</h3>
                    <p
                      className={`text-xs ${isHighlight ? "opacity-70" : "text-[#121714]/60 dark:text-white/60"}`}
                    >
                      {review.product.title}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex gap-1 mb-4 ${isHighlight ? "text-white" : "text-yellow-500"}`}
                >
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`material-symbols-outlined text-sm ${i < review.rating ? "fill-1" : "opacity-30"}`}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p
                  className={`leading-relaxed ${isHighlight ? "font-medium" : "text-[#121714]/80 dark:text-white/80 italic"}`}
                >
                  "{review.comment}"
                </p>
              </div>
            );
          })
        ) : (
          <div className="w-full min-h-[250px] flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-[#2a3a2f]/30 rounded-2xl border-2 border-dashed border-[#f1f4f2] dark:border-[#2a3a2f]">
            <div className="size-16 rounded-full bg-white dark:bg-[#2a3a2f] shadow-sm flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-primary opacity-40">
                rate_review
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1">No Reviews Yet</h3>
            <p className="text-[#121714]/60 dark:text-white/60 text-sm max-w-[280px] text-center">
              We haven't received any reviews for our database yet. Be the first
              to share your earth-friendly journey!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Feedback;
