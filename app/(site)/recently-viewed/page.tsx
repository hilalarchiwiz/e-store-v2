'use client';

import React from 'react';
import Breadcrumbs from '@/components/v2/Breadcrumbs';
import ProductCard from '@/components/v2/ProductCard';
import Button from '@/components/v2/Button';
import Link from 'next/link';

const recentlyViewedProducts = [
  {
    name: "Peace Lily",
    price: 38.00,
    oldPrice: 45.00,
    category: "Flowering plant that filters indoor air toxins",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfJIT2ugUf0_CAcb2aAI_R_VCXrHgXyqymXs0P8bhQkV6Y038HWXX4p0GNyAHlTO-vIhYJCvRmxurtGmd3Y_SSOKSdOaEfMqAX_ZVl-SF3_tJFzipeuL1oLOM7YQvkaZAbvQjm0sUse_wyorj6YRPKl97mYUGKNxMojQFOBsSouvaXyDNOAZUcJyUNM0K3EXD6AN5oWstUNQJdaJF7VZeb3XbOldn3oCmYk0gE941sNPZPGhvHLGKU3aCEvq1JIvXIUAhgKqsTkyc",
    rating: 4.2,
    reviews: 92
  },
  {
    name: "Bird of Paradise",
    price: 89.00,
    category: "Large-scale statement plant for bright rooms",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFfJ2GXRfw3zjPZRcHM9rz5vif5SsMkZgqqGUp07YWLeASoJVnuIRaCP3r5jdBfpvzxHABTnjX-sFhWcuEwN-04a5LZOk8aHVue6r4D5jQ4YQOnB6UZnl-UcDltsrCO7l3VKzttbH4w6ydrTmo0uubsxRSYjkZzDN_rBmX18NUIE8SqQQl3R9ijggnN1bY2-om4JvRT9d2F630OmUO8GfWHFoYwJIPh9-neAkss1wp_NMNcxNoG28tuzEVI05MNIXt2uZMOHt9O-w",
    rating: 4.9,
    reviews: 210,
    badge: { text: "New", variant: "secondary" } as const
  },
  {
    name: "Golden Pothos",
    price: 24.99,
    category: "Easy-care trailing vine for beginners",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuLHQ2Z8ALeaGFLZLm2_mbpBklRU9DnCCVGI_ZYfWULK_41GPHD7eMiua8n7JygFL88PzTlKx5f-lpv5yxGEH924t5RUguDThyDS1Jya1rEKnJaheohQiFciH2HQef6LEgAczJF2kQ0jhjtMsOQq7d5Az1oJ3caJ_0hIgmDjr_YCCO02AJrnf2G7KC50DXslY980BtcglBPymk9X0EErwKh8BkCmOpwEh2bEt2N98NT3J2aYYioPMNK2XwgywszSWm2xfDMXm6GHE",
    rating: 4.8,
    reviews: 156
  },
  {
    name: "Spider Plant",
    price: 18.50,
    category: "Resilient air purifier with arching leaves",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHVMPBF6WYNImarGoEJ3ZbDG1T0yu_lyZU_2T1zaWlIN3htSLFcbez855KbQ9NlNY2qKoaOoK5ltmtzoHbaLLhaD3MG-GIHdUn77qVw1I737WzM2GqOD41BpjYquZIMf4pqJPndM7me8EbNzwY76Qqdzz-9xXm5A32uqiPNZZQZewktxzCo62YZHixqTUkZ0g5CSbQfnn3pTdn7HI-yKUs0kg8qHtxOPvmLkgwGnRrCsOM0K0tFjumupNwnc-5VPjAXiUHsaWSrJ0",
    rating: 4.4,
    reviews: 67
  }
];

const RecentlyViewedPage = () => {
  const isEmpty = recentlyViewedProducts.length === 0;

  return (
    <>
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Recently Viewed' }
          ]}
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-4">Recently Viewed</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {isEmpty
                ? "You haven't viewed any products yet."
                : "Items you've looked at recently across our eco-store."
              }
            </p>
          </div>
          {!isEmpty && (
            <Button variant="secondary" icon="delete_sweep" className="!px-6">
              Clear History
            </Button>
          )}
        </div>

        {isEmpty ? (
          <div className="py-24 flex flex-col items-center text-center bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl">
            <div className="size-32 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8">
              <span className="material-symbols-outlined !text-6xl">history</span>
            </div>
            <h2 className="text-2xl font-bold text-[#121714] dark:text-white mb-2">History is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 leading-relaxed px-6">
              Browse our shop to see your recently viewed items here. We make it easy to find what you were looking for.
            </p>
            <Button variant="primary" icon="explore">
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewedProducts.map((product, idx) => (
              <ProductCard key={idx} {...product} />
            ))}
          </div>
        )}

        <div className="mt-10 p-8 bg-primary/5 dark:bg-white/5 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">psychiatry</span>
            </div>
            <div className="text-left">
              <h3 className="font-black text-[#121714] dark:text-white">Need a recommendation?</h3>
              <p className="text-sm text-gray-500">Our eco-experts have curated collections just for you.</p>
            </div>
          </div>
          <Button variant="primary" icon="auto_awesome">Get Recommendations</Button>
        </div>
      </main>
    </>
  );
};

export default RecentlyViewedPage;
