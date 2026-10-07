import Link from "next/link";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import ProductCard from "@/components/v2/ProductCard";
import { getDealCategories, getDealProducts } from "@/lib/deals";
import type { Metadata } from "next";
import { createPublicMetadata } from "@/lib/seo";
import SeoContent from "@/components/v2/SeoContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPublicMetadata({
  title: "Laptop & Computer Deals in Pakistan",
  description: "Shop current deals on tested laptops, computers, tablets and PC accessories at Qaam.pk, with delivery available across Pakistan.",
  path: "/deals",
});

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const selectedCategory = Number(params.category) || undefined;
  const allDeals = await getDealProducts();
  const categories = getDealCategories(allDeals);
  const products = selectedCategory
    ? allDeals.filter((product) => product.categoryId === selectedCategory)
    : allDeals;

  return (
    <main className="mx-auto w-full max-w-400 px-4 py-8 sm:px-6 md:px-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Best Deals" }]} />
      <div className="mb-8 mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Limited-time savings</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-5xl">Best deals</h1>
        </div>
        <nav className="no-scrollbar flex gap-5 overflow-x-auto pb-1" aria-label="Deal categories">
          <Link href="/deals" className={`shrink-0 border-b-2 pb-1 ${!selectedCategory ? "border-primary text-primary" : "border-transparent text-muted"}`}>All</Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/deals?category=${category.id}`} className={`shrink-0 border-b-2 pb-1 ${selectedCategory === category.id ? "border-primary text-primary" : "border-transparent text-muted"}`}>
              {category.title}
            </Link>
          ))}
        </nav>
      </div>
      {products.length ? (
        <section aria-labelledby="discounted-products-heading">
          <h2 id="discounted-products-heading" className="sr-only">Discounted products</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6">
            {products.map((product) => <ProductCard key={product.id} {...product} />)}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-outline py-24 text-center text-muted">No discounted products found in this category.</div>
      )}
      {!selectedCategory && (
        <SeoContent
          eyebrow="Current Qaam.pk offers"
          title="Save on laptops, computers and accessories"
          paragraphs={[
            "The Qaam.pk deals collection brings together products that currently have a reduced price, making it easier to compare available savings in one place. Offers may include laptops, desktop computers, projectors, tablets, batteries, chargers and other accessories. Stock is limited and the selection changes as promotions begin or products sell out, so the price and availability shown on each individual product page should be treated as the latest information.",
            "A useful deal is one that matches your requirements, not simply the largest percentage reduction. Compare the processor generation, memory, storage, display, graphics capability and physical condition before choosing a computer. For accessories and replacement parts, check the model numbers and compatibility details carefully. The category links above can narrow the promotion list, while the full shop provides additional filters when you want to compare discounted products with the wider catalogue.",
            "New and refurbished equipment can both offer strong value depending on your priorities. A tested refurbished business laptop may provide durable construction and practical performance at a lower cost, while a newer system may offer longer battery life or recent connectivity features. Qaam.pk delivers orders across Pakistan and can answer product questions before purchase. Check the complete description, current stock status and final displayed price for every offer. If you are uncertain about a specification, condition grade or compatible part, contact the team before placing your order.",
          ]}
          links={[
            { href: "/shop", label: "Compare the full catalogue" },
            { href: "/faq", label: "Read shopping FAQs" },
            { href: "/returns-exchanges", label: "Review return information" },
            { href: "/contact", label: "Ask about a deal" },
          ]}
        />
      )}
    </main>
  );
}
