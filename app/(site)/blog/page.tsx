import Breadcrumbs from "@/components/v2/Breadcrumbs";
import { getBlogs } from "@/lib/action/home.action";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

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

  let title = "Blog | Qaam.pk";
  let description = "Read our latest news and updates.";

  if (search) {
    title = `Search results for "${search}" | Blog | Qaam.pk`;
  } else if (tag) {
    title = `${tag} | Blog | Qaam.pk`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://qaam.pk/blog${search ? `?search=${search}` : ""}`,
      siteName: "Qaam.pk",
      images: [{ url: "/images/og-image.png" }],
      type: "website",
    },
    alternates: {
      canonical: "/blog",
    },
  };
}

const BlogPage = async ({ searchParams }: BlogPageProps) => {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const tag = params.tag;
  const search = params.search;

  const response = await getBlogs({ page: currentPage, tag, search });

  if (!response.success) {
    return (
      <div className="flex-1 max-w-300 mx-auto w-full py-6 md:py-10 flex flex-col gap-8 px-4">
        <div className="text-center py-10">
          <p className="text-red-500">Error loading blogs.</p>
        </div>
      </div>
    );
  }

  const { blogs, totalPages } = response;

  return (
    <main className="flex-1 max-w-300 mx-auto w-full py-6 md:py-10 flex flex-col gap-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: search ? `Search: "${search}"` : "All Posts" },
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-[#121714] dark:text-white">Blog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Read our latest news and updates.</p>
        </div>
        
        <form action="/blog" className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search blogs..."
            className="flex-1 md:w-64 border-[#dce5df] dark:border-[#2a3a30] dark:bg-[#1a2e22] text-[#121714] dark:text-white rounded-lg focus:ring-primary focus:border-primary outline-none px-4 py-2"
          />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>
      </div>

      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog: any) => (
            <Link href={`/blog/${blog.slug}`} key={blog.id} className="group">
              <div className="bg-white dark:bg-[#1a251d] rounded-xl border border-[#e5e9e6] dark:border-[#2a3a30] overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div className="relative h-48 w-full bg-gray-100 dark:bg-[#121714]">
                  <Image
                    src={blog.image || "/images/placeholder-product.jpg"}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {blog.tag && (
                    <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                      {blog.tag}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm">event</span>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <h2 className="text-xl font-bold text-[#121714] dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                    {blog.description}
                  </p>
                  <div className="text-primary text-sm font-bold uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#1a251d] rounded-xl border border-[#e5e9e6] dark:border-[#2a3a30]">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">
            search_off
          </span>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No blogs found matching your criteria.</p>
          <Link href="/blog" className="text-primary hover:underline mt-2 inline-block">
            Clear filters
          </Link>
        </div>
      )}

      {totalPages && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}${tag ? `&tag=${tag}` : ""}${search ? `&search=${search}` : ""}`}
              className={`px-4 py-2 rounded-lg ${p === currentPage ? "bg-primary text-white font-bold" : "bg-white dark:bg-[#1a251d] text-[#121714] dark:text-white border border-[#e5e9e6] dark:border-[#2a3a30] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default BlogPage;
