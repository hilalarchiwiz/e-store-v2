import React from 'react';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import Breadcrumbs from '@/components/v2/Breadcrumbs';
import Button from '@/components/v2/Button';
import FaqAccordion from '@/components/v2/FaqAccordion';
import { getFaqs } from '@/lib/action/home.action';
import Link from 'next/link';

export const metadata = {
  title: 'Frequently Asked Questions | Ecomare Help Center',
  description: 'Find answers to common questions about Ecomare orders, shipping, and sustainable practices.',
};

const FAQPage = async () => {
  const { faqs = [] } = await getFaqs();

  return (


    <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-10 md:py-20 flex flex-col gap-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Frequently Asked Questions' }
        ]}
      />

      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 mb-6 text-primary">
          <span className="material-symbols-outlined text-4xl">help_center</span>
          <span className="text-sm font-black uppercase tracking-[0.3em]">Help Center</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-[#121714] dark:text-white mb-6">Common Questions</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          Everything you need to know about our products, billing, and how we're working together for a greener future.
        </p>
      </div>

      <div className="max-w-[900px] mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <FaqAccordion faqs={faqs} />
      </div>

      {/* Still have questions Section */}
      <div className="mt-20 p-10 md:p-16 bg-[#121714] rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 size-80 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 size-80 bg-primary/10 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-lg mx-auto space-y-8">
          <div className="size-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
            <span className="material-symbols-outlined text-4xl">forum</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black italic">Still have questions?</h2>
          <p className="text-white/60 font-medium">
            Can't find the answer you're looking for? Please reach out to our friendly green experts.
          </p>
          <div className="pt-4">
            <Button variant="primary" icon="mail">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Category Help Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        {[
          { title: "Ordering", icon: "shopping_basket", desc: "Track, change, or cancel your orders effortlessly." },
          { title: "Shipping", icon: "local_shipping", desc: "Learn about our carbon-neutral delivery methods." },
          { title: "Sustainability", icon: "eco", desc: "Deep dive into our material sourcing and plant care." }
        ].map((cat, i) => (
          <div key={i} className="p-8 rounded-[2rem] bg-white dark:bg-[#1a251d] border border-primary/5 shadow-xl hover:shadow-2xl transition-all group">
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
              <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
            </div>
            <h3 className="text-xl font-black text-[#121714] dark:text-white mb-2">{cat.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{cat.desc}</p>
          </div>
        ))}
      </div>
    </main>

  );
};

export default FAQPage;
