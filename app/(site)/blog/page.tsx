
import SiteIcon from '@/components/v2/SiteIcon';
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import { getBlogs } from "@/lib/action/home.action";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createPublicMetadata } from "@/lib/seo";
import SeoContent from "@/components/v2/SeoContent";

export const dynamic = "force-dynamic";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    search?: string;
  }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = params.search?.trim() || "";
  const tag = params.tag;
  const page = Number(params.page);
  const hasValidPage = !params.page || (Number.isSafeInteger(page) && page > 0);
  const isIndexableListing = !search && !tag && hasValidPage;
  const canonicalPath = isIndexableListing && page > 1
    ? `/blog?page=${page}`
    : "/blog";

  let title = "Laptop Buying Guides & Technology Blog";
  const description = "Read practical laptop buying guides, computer advice, product insights and technology updates from the Qaam.pk team in Pakistan.";

  if (search) {
    title = `Blog search results for “${search}”`;
  } else if (tag) {
    title = `${tag} Articles`;
  }

  return createPublicMetadata({
    title,
    description,
    path: canonicalPath,
    noIndex: !isIndexableListing,
  });
}

const BlogPage = async ({ searchParams }: BlogPageProps) => {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const tag = params.tag;
  const search = params.search;

  const response = await getBlogs({ page: currentPage, tag, search });

  if (!response.success) {
    return (
      <main className="flex-1 max-w-400 mx-auto w-full px-6 md:px-10 py-10 md:py-20">
        <div className="text-center py-20 bg-surface dark:bg-surface rounded-2xl border border-outline dark:border-outline">
          <SiteIcon className="text-5xl text-primary mb-4">error</SiteIcon>
          <p className="text-foreground dark:text-foreground font-medium">We couldn&apos;t load the blog right now.</p>
          <p className="text-muted text-sm mt-1">Please try again in a moment.</p>
        </div>
      </main>
    );
  }

  const { blogs, totalPages } = response;
  const showFeatured = !search && !tag && currentPage === 1 && !!blogs && blogs.length > 1;
  const featured = showFeatured ? blogs![0] : null;
  const gridBlogs = featured ? blogs!.slice(1) : blogs;

  const pageHref = (p: number) => {
    const query = new URLSearchParams();
    if (p > 1) query.set("page", String(p));
    if (tag) query.set("tag", tag);
    if (search) query.set("search", search);
    const qs = query.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  const pageNumbers = (): (number | "...")[] => {
    const total = totalPages || 1;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  const btnBase = "size-10 rounded-xl flex items-center justify-center font-bold transition-all active:scale-95";
  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <main className="flex-1 max-w-400 mx-auto w-full px-6 md:px-10 py-10 md:py-20 flex flex-col gap-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: search ? `Search: "${search}"` : "All Posts" },
        ]}
      />

      {/* Intro */}
      <div className="text-center max-w-300 mx-auto">
        <h1 className="text-4xl md:text-6xl font-medium text-foreground dark:text-foreground mb-6">
          {search ? "Search Results" : tag ? `${tag} Articles` : "Guides & Insights"}
        </h1>
        <p className="text-lg text-muted dark:text-muted font-medium leading-relaxed">
          {search
            ? `Showing articles matching “${search}”.`
            : "Laptop buying guides, tech advice and product insights from the Qaam.pk team."}
        </p>
      </div>

      {/* Search */}
      <form
        action="/blog"
        role="search"
        className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-outline bg-surface p-2 shadow-sm dark:border-outline dark:bg-surface"
      >
        <SiteIcon className="ml-2 text-xl text-muted">search</SiteIcon>
        <input
          type="text"
          name="search"
          defaultValue={search || ""}
          placeholder="Search articles..."
          aria-label="Search articles"
          className="h-11 min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted focus:ring-0 dark:text-foreground"
        />
        {search && (
          <Link href="/blog" className="flex h-11 items-center rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:text-primary">
            Clear
          </Link>
        )}
        <button
          type="submit"
          className="h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 active:scale-95"
        >
          Search
        </button>
      </form>

      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid overflow-hidden rounded-2xl border border-outline bg-surface shadow-sm transition-all duration-300 hover:shadow-xl dark:border-outline dark:bg-surface lg:grid-cols-2"
        >
          <div className="relative aspect-16/10 w-full overflow-hidden lg:aspect-auto lg:min-h-96">
            <Image
              src={featured.image || "/images/placeholder-product.jpg"}
              alt={featured.title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute left-4 top-4 rounded bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Latest
            </span>
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <SiteIcon className="text-base text-primary">event</SiteIcon>
              {formatDate(featured.createdAt)}
            </div>
            <h2 className="text-2xl font-medium leading-snug text-foreground transition-colors group-hover:text-primary dark:text-foreground md:text-4xl">
              {featured.title}
            </h2>
            <p className="line-clamp-4 text-base font-medium leading-relaxed text-muted">{featured.description}</p>
            <span className="mt-2 flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-primary transition-all group-hover:gap-2">
              Read Article <SiteIcon className="text-base">arrow_forward</SiteIcon>
            </span>
          </div>
        </Link>
      )}

      {/* Grid */}
      {gridBlogs && gridBlogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {gridBlogs.map((blog: any) => (
            <Link href={`/blog/${blog.slug}`} key={blog.id} className="group">
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-outline bg-surface shadow-sm transition-all duration-300 hover:shadow-xl dark:border-outline dark:bg-surface">
                <div className="relative aspect-16/10 w-full overflow-hidden bg-surface">
                  <Image
                    src={blog.image || "/images/placeholder-product.jpg"}
                    alt={blog.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <SiteIcon className="text-base text-primary">event</SiteIcon>
                    {formatDate(blog.createdAt)}
                  </div>
                  <h2 className="line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary dark:text-foreground">
                    {blog.title}
                  </h2>
                  <p className="mb-2 line-clamp-3 flex-1 text-sm font-medium text-muted">{blog.description}</p>
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary transition-all group-hover:gap-2">
                    Read More <SiteIcon className="text-base">arrow_forward</SiteIcon>
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : !featured ? (
        <div className="text-center py-20 bg-surface dark:bg-surface rounded-2xl border border-outline dark:border-outline">
          <SiteIcon className="text-6xl text-muted mb-4">search_off</SiteIcon>
          <p className="text-foreground dark:text-foreground text-lg font-medium">No articles found.</p>
          <p className="text-muted text-sm mt-1">Try a different search term.</p>
          <Link href="/blog" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition-all hover:bg-primary/90">
            Clear filters
          </Link>
        </div>
      ) : null}

      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <nav aria-label="Blog pagination" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <p className="text-sm font-medium tracking-wide text-muted whitespace-nowrap">
            Page <span className="font-bold text-foreground dark:text-foreground">{currentPage}</span> of{" "}
            <span className="font-bold text-foreground dark:text-foreground">{totalPages}</span> pages
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link href={pageHref(currentPage - 1)} aria-label="Previous page" className={`${btnBase} border border-outline text-muted hover:border-primary hover:bg-primary hover:text-white dark:border-outline`}>
                <SiteIcon>chevron_left</SiteIcon>
              </Link>
            ) : (
              <span aria-hidden="true" className={`${btnBase} border border-outline text-muted opacity-40 dark:border-outline`}>
                <SiteIcon>chevron_left</SiteIcon>
              </span>
            )}
            {pageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`gap-${i}`} className="px-1 text-muted">…</span>
              ) : (
                <Link
                  key={p}
                  href={pageHref(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`${btnBase} ${p === currentPage ? "bg-primary text-white shadow-lg shadow-primary/30" : "border border-outline text-foreground hover:border-primary hover:text-primary dark:border-outline dark:text-foreground"}`}
                >
                  {p}
                </Link>
              ),
            )}
            {currentPage < totalPages ? (
              <Link href={pageHref(currentPage + 1)} aria-label="Next page" className={`${btnBase} border border-outline text-muted hover:border-primary hover:bg-primary hover:text-white dark:border-outline`}>
                <SiteIcon>chevron_right</SiteIcon>
              </Link>
            ) : (
              <span aria-hidden="true" className={`${btnBase} border border-outline text-muted opacity-40 dark:border-outline`}>
                <SiteIcon>chevron_right</SiteIcon>
              </span>
            )}
          </div>
        </nav>
      )}

      {!search && !tag && currentPage === 1 && (
        <SeoContent
          eyebrow="Practical technology advice"
          title="Laptop guides and computing insights"
          paragraphs={[
            "The Qaam.pk blog explains computer specifications and buying decisions in straightforward language. Our articles are designed to help readers understand how processors, memory, storage, displays, graphics and battery life affect everyday use. Whether you are choosing a laptop for university, office work, creative software or gaming, a clear understanding of these components makes it easier to compare models and avoid paying for features you do not need.",
            "We also cover refurbished technology, maintenance, upgrades and accessories. A well-selected refurbished business laptop can offer strong value, while additional memory or faster storage may extend the useful life of an existing computer. Advice about chargers, batteries and replacement components focuses on compatibility because similar-looking parts are not always interchangeable. Always compare the exact model details on the relevant product page before placing an order.",
            "New articles and product insights are added as technology and customer questions change. Use the article search to find a particular subject, explore the complete shop when you are ready to compare available products, or contact Qaam.pk for help with a specific requirement. We also publish answers inspired by recurring questions from shoppers across Pakistan, helping readers make more confident and informed technology decisions. Guides provide general information, while the current price, stock status, warranty and condition shown on each product listing apply to the item being offered.",
          ]}
          links={[
            { href: "/shop", label: "Compare available products" },
            { href: "/deals", label: "See current offers" },
            { href: "/contact", label: "Ask a product question" },
          ]}
        />
      )}

      {/* Help banner */}
      <div className="p-10 md:p-16 bg-[#121714] rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 size-80 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 size-80 bg-primary/10 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <div className="size-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
            <SiteIcon className="text-4xl">laptop_mac</SiteIcon>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium italic">Ready to find your laptop?</h2>
          <p className="text-white/60 font-medium">Browse available laptops and parts, or ask our team to help you choose.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/shop" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-95">
              Shop Now <SiteIcon className="text-base">arrow_forward</SiteIcon>
            </Link>
            <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BlogPage;
