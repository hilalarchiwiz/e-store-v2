'use client';

import React, { useState } from 'react';
import { subscribeEmail } from '@/lib/action/subscribe.action';
import { toast } from 'react-hot-toast';

const Subscribe = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const result = await subscribeEmail(email);
    setLoading(false);

    if (result.success) {
      setSubscribed(true);
      setEmail('');
      toast.success('You\'re subscribed! Welcome to the eco-revolution.');
    } else {
      toast.error(result.error ?? 'Failed to subscribe.');
    }
  };

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap bg-surface-container rounded-[40px] overflow-hidden my-8">
      <div className="bg-emerald-deep rounded-[40px] px-8 py-20 text-center relative overflow-hidden group">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-500">
          <span className="material-symbols-outlined text-[200px] text-white">eco</span>
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="font-display-hero text-display-hero-mobile md:text-display-hero text-white leading-tight">
            Stay Ahead of the Tech Curve
          </h2>
          
          <p className="font-body-lg text-body-lg text-surface-variant/80">
            Receive tech updates, exclusive offers, and early access to new laptop collections directly in your inbox.
          </p>

          {subscribed ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
              </div>
              <p className="text-white font-bold text-xl">You're in!</p>
              <p className="text-white/60">Check your inbox for a welcome message.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto w-full">
              <input
                className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Your email address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button
                className="bg-primary-container hover:bg-primary-fixed text-on-primary-container font-bold px-8 py-4 rounded-xl transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>
          )}

          <p className="text-[10px] text-white/40 uppercase tracking-widest">
            No spam. Only high-performance tech.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
