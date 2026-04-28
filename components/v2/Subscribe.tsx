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
    <section className="px-6 py-10">
      <div className="bg-[#1a251d] rounded-3xl p-10 md:p-20 relative overflow-hidden flex flex-col items-center text-center">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #25a752 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 max-w-2xl w-full">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Join the Eco-Revolution</h2>
          <p className="text-white/70 mb-10 text-lg">
            Receive sustainability tips, exclusive offers, and early access to new collections directly in your inbox.
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
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 w-full max-w-lg mx-auto">
              <input
                className="flex-1 h-14 rounded-xl px-6 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Your email address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button
                className="h-14 bg-primary text-white font-bold px-8 rounded-xl hover:bg-primary/90 transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-40"
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

          <p className="text-[10px] text-white/40 mt-6 uppercase tracking-widest font-bold">No spam. Only green vibes.</p>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
