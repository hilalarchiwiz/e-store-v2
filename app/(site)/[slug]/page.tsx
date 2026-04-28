import React from 'react';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import Breadcrumbs from '@/components/v2/Breadcrumbs';
import Link from 'next/link';
import { getPageBySlug } from '@/lib/action/home.action';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const DynamicPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const response = await getPageBySlug(slug);

  if (!response.success || !response.page) {
    notFound();
  }

  const { page } = response;

  return (


    <main className="flex-1 max-w-[1000px] mx-auto w-full px-6 py-10 md:py-20 flex flex-col gap-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/v2' },
          { label: page.title }
        ]}
      />

      <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full overflow-hidden break-words">
        <header className="mb-12 border-b border-gray-100 dark:border-white/5 pb-10">
          <h1 className="text-4xl md:text-6xl font-black text-[#121714] dark:text-white leading-tight mb-4">
            {page.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-primary text-xl">event_note</span>
            Last Updated: {new Date(page.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <div className="overflow-x-auto no-scrollbar">
          <div
            className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:text-[#121714] dark:prose-headings:text-white
                prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed
                prose-strong:text-[#121714] dark:prose-strong:text-white
                prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:max-w-full prose-img:h-auto
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-li:text-gray-600 dark:prose-li:text-gray-400
                prose-pre:overflow-x-auto prose-pre:max-w-full
                prose-table:overflow-x-auto prose-table:block prose-table:w-full"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </article>

      {/* Global Sustainability Impact Section to maintain branding */}
      <div className="mt-20 p-10 bg-primary/5 dark:bg-white/5 rounded-[3rem] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="size-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-4xl">eco</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-[#121714] dark:text-white">Eco-Conscious Promise</h3>
            <p className="text-sm text-gray-500 font-medium">This page was rendered with minimal digital carbon footprint.</p>
          </div>
        </div>
        <Link href="/shop" className="text-sm font-black uppercase tracking-widest text-[#121714] dark:text-white hover:text-primary transition-colors flex items-center gap-2">
          Return to Shop <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </main>

  );
};

export default DynamicPage;
