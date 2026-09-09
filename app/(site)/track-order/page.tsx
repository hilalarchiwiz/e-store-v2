import React from 'react';
import Breadcrumbs from '@/components/v2/Breadcrumbs';

const TrackOrderPage = () => {
  return (
    <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Track Your Order' }
        ]}
      />

      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-black text-foreground dark:text-foreground mb-6">
          Track Your Order
        </h1>
        <p className="text-muted dark:text-muted mb-10 text-lg leading-relaxed">
          Waiting for your eco-friendly goodies from <strong>qaam.pk</strong>? We know you're excited! Enter your order number and email address below to see the current status of your delivery.
        </p>

        <div className="bg-surface dark:bg-surface p-8 md:p-10 rounded-3xl border border-outline dark:border-outline shadow-xl">
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="orderId" className="text-sm font-bold text-foreground dark:text-foreground">
                Order ID
              </label>
              <input
                type="text"
                id="orderId"
                placeholder="e.g. QAAM-123456"
                className="w-full bg-surface dark:bg-surface border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-foreground dark:text-foreground placeholder:text-muted outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-foreground dark:text-foreground">
                Billing Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email address used during checkout"
                className="w-full bg-surface dark:bg-surface border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-foreground dark:text-foreground placeholder:text-muted outline-none transition-all"
              />
            </div>

            <button
              type="button"
              className="mt-4 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors shadow-lg active:scale-95 flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined">local_shipping</span>
              Track Order
            </button>
          </form>
        </div>

        <div className="mt-12 p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 flex items-start gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">info</span>
          <div>
            <h3 className="font-bold text-foreground dark:text-foreground mb-1">Standard Delivery Times</h3>
            <p className="text-sm text-muted dark:text-muted">
              Orders placed on <strong>qaam.pk</strong> are typically processed within 1-2 business days. Standard shipping usually takes 3-5 business days across the country. If you have any concerns about your delivery, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TrackOrderPage;
