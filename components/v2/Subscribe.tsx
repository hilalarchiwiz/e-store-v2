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
      toast.success("You're subscribed! Welcome to the eco-revolution.");
    } else {
      toast.error(result.error ?? 'Failed to subscribe.');
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="bg-[#1a251d] rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-16 lg:p-20 relative overflow-hidden flex flex-col items-center text-center shadow-2xl">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, #25a752 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 max-w-2xl w-full">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-6 leading-tight tracking-tight">
            Stay Ahead of the Tech Curve
          </h2>
          <p className="text-white/75 mb-6 sm:mb-10 text-xs sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
            Receive tech updates, exclusive offers, and early access to new laptop collections directly in your inbox.
          </p>

          {subscribed ? (
            <div className="flex flex-col items-center gap-3 sm:gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="size-12 sm:size-16 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-primary">
                  check_circle
                </span>
              </div>
              <p className="text-white font-bold text-lg sm:text-xl">You&apos;re in!</p>
              <p className="text-white/60 text-xs sm:text-sm">
                Check your inbox for a welcome message.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xl mx-auto items-stretch"
            >
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
                  mail
                </span>
                <input
                  className="w-full h-14 rounded-2xl pl-12 pr-5 bg-white text-[#121714] placeholder:text-gray-400 font-medium focus:ring-4 focus:ring-primary/30 border border-transparent outline-none text-base shadow-lg transition-all"
                  placeholder="Enter your email address"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                className="h-14 bg-primary hover:bg-primary/90 text-white font-extrabold px-8 rounded-2xl active:scale-[0.99] transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base w-full sm:w-auto sm:min-w-44 shadow-lg shadow-primary/30 shrink-0"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </form>
          )}

          <p className="text-[10px] sm:text-xs text-white/50 mt-5 sm:mt-6 uppercase tracking-widest font-bold">
            No spam. Only high-performance tech.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
