'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/v2/Breadcrumbs';
import ProductCard from '@/components/v2/ProductCard';
import Button from '@/components/v2/Button';
import Link from 'next/link';
import { getRecentlyViewedProducts, clearRecentlyViewed } from '@/lib/action/home.action';
import { useSession } from '@/lib/auth-client';

const RecentlyViewedPage = () => {
  const { data: session, isPending: sessionPending } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    const res = await getRecentlyViewedProducts(session?.user?.id);
    if (res?.success) {
      setProducts(res.products);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!sessionPending) {
      fetchProducts();
    }
  }, [session?.user?.id, sessionPending]);

  const handleClear = async () => {
    setIsLoading(true);
    const res = await clearRecentlyViewed(session?.user?.id);
    if (res?.success) {
      setProducts([]);
    }
    setIsLoading(false);
  };

  const isEmpty = products.length === 0;

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
              {isLoading
                ? "Loading your recently viewed items..."
                : isEmpty
                ? "You haven't viewed any products yet."
                : "Items you've looked at recently across our eco-store."
              }
            </p>
          </div>
          {!isEmpty && !isLoading && (
            <Button variant="secondary" icon="delete_sweep" className="!px-6" onClick={handleClear}>
              Clear History
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="size-12 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
          </div>
        ) : isEmpty ? (
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
            {products.map((product: any, idx: number) => (
              <ProductCard 
                key={product.id || idx} 
                id={product.id}
                name={product.title}
                price={product.discountedPrice || product.price}
                oldPrice={product.discountedPrice ? product.price : undefined}
                image={product.images?.[0] || ""}
                images={product.images || []}
                description={product.description || ""}
                category={product.category?.title || "Uncategorized"}
                rating={4.5}
                reviews={10}
              />
            ))}
          </div>
        )}

        <div className="mt-10 p-8 bg-primary/5 dark:bg-white/5 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">recommend</span>
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
