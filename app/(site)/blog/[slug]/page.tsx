
import SiteIcon from '@/components/v2/SiteIcon';
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import { getBlogDetails, incrementBlogViews } from "@/lib/action/home.action";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { absoluteUrl, createPublicMetadata, metaDescription } from "@/lib/seo";

interface BlogDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getBlogDetails(slug);

  if (!response.success || !response.blog) return {};

  const { blog } = response;
  const title = blog.title;
  const description = metaDescription(
    blog.description,
    `Read ${blog.title} on the Qaam.pk technology blog.`,
  );

  return createPublicMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    image: blog.image,
    type: "article",
  });
}

const BlogDetailsPage = async ({ params }: BlogDetailsPageProps) => {
  const { slug } = await params;
  const response = await getBlogDetails(slug);

  if (!response.success || !response.blog) {
    notFound();
  }

  const { blog } = response;
  const blogUrl = absoluteUrl(`/blog/${blog.slug}`);
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: metaDescription(blog.description, blog.title),
    image: blog.image ? [absoluteUrl(blog.image)] : undefined,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    mainEntityOfPage: blogUrl,
    author: { "@type": "Organization", name: "Qaam.pk", url: absoluteUrl() },
    publisher: {
      "@type": "Organization",
      name: "Qaam.pk",
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo/logo.png") },
    },
  };

  // Increment views
  await incrementBlogViews(blog.id);

  return (
    <main className="flex-1 max-w-[1000px] mx-auto w-full px-4 py-10 md:py-20 flex flex-col gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: blog.title },
        ]}
      />

      <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full overflow-hidden break-words">
        <header className="mb-12 border-b border-outline dark:border-white/5 pb-10">
          <h1 className="text-3xl md:text-5xl font-black text-foreground dark:text-foreground leading-tight mb-6">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted dark:text-muted font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <SiteIcon className="text-primary text-xl">event_note</SiteIcon>
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            {blog.tag && (
              <div className="flex items-center gap-2">
                <SiteIcon className="text-primary text-xl">sell</SiteIcon>
                {blog.tag}
              </div>
            )}
            <div className="flex items-center gap-2">
              <SiteIcon className="text-primary text-xl">visibility</SiteIcon>
              {blog.views + 1} Views
            </div>
          </div>
        </header>

        {blog.image && (
          <div className="relative h-[300px] md:h-[500px] w-full rounded-2xl overflow-hidden mb-12 shadow-lg">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="overflow-x-auto no-scrollbar">
          <div
            className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-black prose-headings:text-foreground dark:prose-headings:text-white
                prose-p:text-muted dark:prose-p:text-muted prose-p:leading-relaxed
                prose-strong:text-foreground dark:prose-strong:text-white
                prose-img:rounded-xl prose-img:shadow-md prose-img:max-w-full prose-img:h-auto
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-li:text-muted dark:prose-li:text-muted
                prose-pre:overflow-x-auto prose-pre:max-w-full"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>

      {/* Return to Blog Section */}
      <div className="mt-10 p-6 md:p-10 bg-primary/5 dark:bg-white/5 rounded-2xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="size-14 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <SiteIcon className="text-3xl">newspaper</SiteIcon>
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground dark:text-foreground">
              Stay Updated
            </h3>
            <p className="text-sm text-muted font-medium">
              Read more articles on technology and trends.
            </p>
          </div>
        </div>
        <Link
          href="/blog"
          className="text-sm font-black uppercase tracking-widest text-foreground dark:text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          Back to Blog{" "}
          <SiteIcon >arrow_forward</SiteIcon>
        </Link>
      </div>
    </main>
  );
};

export default BlogDetailsPage;
