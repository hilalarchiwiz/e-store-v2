import React from 'react';

const Countdown = () => {
  return (
    <section className="px-6 py-12">
      <div className="bg-primary-dark rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-dark/40">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]">eco</span>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <span className="text-primary bg-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Hurry Up!</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Green Friday Flash Sale</h2>
          <p className="text-white/80 max-w-xl mx-auto">Get massive discounts on our most popular sustainable products. Offer ends in:</p>
          <div className="flex gap-4 md:gap-8 mt-4">
            <div className="flex flex-col gap-1">
              <div className="bg-white/10 backdrop-blur-lg size-16 md:size-24 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black border border-white/20">02</div>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Days</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-white/10 backdrop-blur-lg size-16 md:size-24 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black border border-white/20">14</div>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Hours</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-white/10 backdrop-blur-lg size-16 md:size-24 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black border border-white/20">35</div>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Mins</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-white/10 backdrop-blur-lg size-16 md:size-24 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black border border-white/20">59</div>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Secs</span>
            </div>
          </div>
          <button className="mt-8 bg-primary hover:bg-primary-dark border-2 border-primary text-white px-10 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2">
            Access Sale Now <span className="material-symbols-outlined">bolt</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Countdown;
