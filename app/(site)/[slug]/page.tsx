import React from "react";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import Link from "next/link";
import { getPageBySlug } from "@/lib/action/home.action";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getPageBySlug(slug);

  if (!response.success || !response.page) return {};

  const { page } = response;
  const title = `${page.title} | Qaam.pk`;
  const description = page.content.replace(/<[^>]*>/g, "").substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://qaam.pk/${slug}`,
      siteName: "Qaam.pk",
      images: [{ url: "/images/og-image.png" }],
      type: "article",
    },
  };
}

const DynamicPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const response = await getPageBySlug(slug);

  if (!response.success || !response.page) {
    notFound();
  }

  const { page } = response;

  return (
    <main className="flex-1 max-w-400 mx-auto w-full px-6 px-10 py-10 md:py-20 flex flex-col gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: page.title }]}
      />

      <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full overflow-hidden break-words">
        <header className="mb-12 border-b border-outline dark:border-white/5 pb-10">
          <h1 className="text-4xl md:text-6xl font-black text-foreground dark:text-foreground leading-tight mb-4">
            {page.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-primary text-xl">
              event_note
            </span>
            Last Updated:{" "}
            {new Date(page.updatedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </header>

        <div className="overflow-x-auto no-scrollbar">
          <div
            className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:text-foreground dark:prose-headings:text-white
                prose-p:text-muted dark:prose-p:text-muted prose-p:leading-relaxed
                prose-strong:text-foreground dark:prose-strong:text-white
                prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:max-w-full prose-img:h-auto
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-li:text-muted dark:prose-li:text-muted
                prose-pre:overflow-x-auto prose-pre:max-w-full
                prose-table:overflow-x-auto prose-table:block prose-table:w-full"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </article>
    </main>
  );
};

export default DynamicPage;
