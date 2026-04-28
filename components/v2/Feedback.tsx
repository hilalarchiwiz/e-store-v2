'use client';

import React, { useRef } from 'react';

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

const staticTestimonials = [
  {
    id: 's1',
    name: "Sarah Jenkins",
    role: "Verified Buyer",
    text: "I'm obsessed with the bamboo kitchenware set. It's not only beautiful but incredibly durable. My kitchen feels so much more organic now!",
    image: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=4ade80&color=fff&size=96",
    rating: 5,
  },
  {
    id: 's2',
    name: "Mark Thompson",
    role: "Eco-Enthusiast",
    text: "The sustainability report they provide with every order is eye-opening. Knowing exactly how much carbon I'm saving makes Ecomare my go-to shop.",
    image: "https://ui-avatars.com/api/?name=Mark+Thompson&background=22c55e&color=fff&size=96",
    rating: 5,
    highlight: true,
  },
  {
    id: 's3',
    name: "Elena Rodriguez",
    role: "Verified Buyer",
    text: "Finally, an eco-store that doesn't compromise on style. The ceramic mugs are a piece of art.",
    image: "https://ui-avatars.com/api/?name=Elena+Rodriguez&background=16a34a&color=fff&size=96",
    rating: 5,
  },
  {
    id: 's4',
    name: "David Wu",
    role: "Verified Buyer",
    text: "Shipping was surprisingly fast and the packaging was 100% compostable. Truly living up to the promise.",
    image: "https://ui-avatars.com/api/?name=David+Wu&background=15803d&color=fff&size=96",
    rating: 5,
  },
];

const Feedback: React.FC<FeedbackProps> = ({ reviews = [] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -400 : 400,
        behavior: 'smooth',
      });
    }
  };

  const useDB = reviews.length > 0;

  return (
    <section className="px-6 py-16">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Our Happy Earthlings</h2>
          <p className="text-[#121714]/60 dark:text-white/60">Real stories from real customers who switched to a greener lifestyle.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="size-10 rounded-full border border-[#f1f4f2] dark:border-[#2a3a2f] flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => scroll('right')}
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
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name ?? 'User')}&background=${isHighlight ? 'ffffff' : '4ade80'}&color=${isHighlight ? '16a34a' : 'fff'}&size=96`;
            return (
              <div
                key={review.id}
                className={`min-w-87.5 md:min-w-100 p-8 rounded-2xl shadow-sm border transition-shadow ${
                  isHighlight
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 border-transparent'
                    : 'bg-white dark:bg-[#2a3a2f] border-[#f1f4f2] dark:border-[#2a3a2f] hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`size-12 rounded-full bg-cover bg-center shrink-0 ${isHighlight ? 'border-2 border-white' : ''}`}
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                  />
                  <div>
                    <h4 className="font-bold">{review.name ?? "Anonymous"}</h4>
                    <p className={`text-xs ${isHighlight ? 'opacity-70' : 'text-[#121714]/60 dark:text-white/60'}`}>
                      {review.product.title}
                    </p>
                  </div>
                </div>
                <div className={`flex gap-1 mb-4 ${isHighlight ? 'text-white' : 'text-yellow-500'}`}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'fill-1' : 'opacity-30'}`}>
                      star
                    </span>
                  ))}
                </div>
                <p className={`leading-relaxed ${isHighlight ? 'font-medium' : 'text-[#121714]/80 dark:text-white/80 italic'}`}>
                  "{review.comment}"
                </p>
              </div>
            );
          })
        ) : (
          staticTestimonials.map((t) => (
            <div
              key={t.id}
              className={`min-w-87.5 md:min-w-100 p-8 rounded-2xl shadow-sm border transition-shadow ${
                t.highlight
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 border-transparent'
                  : 'bg-white dark:bg-[#2a3a2f] border-[#f1f4f2] dark:border-[#2a3a2f] hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`size-12 rounded-full bg-cover bg-center shrink-0 ${t.highlight ? 'border-2 border-white' : ''}`}
                  style={{ backgroundImage: `url(${t.image})` }}
                />
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <p className={`text-xs ${t.highlight ? 'opacity-70' : 'text-[#121714]/60 dark:text-white/60'}`}>{t.role}</p>
                </div>
              </div>
              {!t.highlight && (
                <div className="text-yellow-500 mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm fill-1">star</span>
                  ))}
                </div>
              )}
              <p className={`leading-relaxed ${t.highlight ? 'font-medium' : 'text-[#121714]/80 dark:text-white/80 italic'}`}>
                "{t.text}"
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Feedback;
