
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
    keywords: blog.tag
      ? blog.tag.split(",").map((keyword: string) => keyword.trim()).filter(Boolean)
      : undefined,
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

  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="flex-1 max-w-400 mx-auto w-full px-6 md:px-10 py-10 md:py-20 flex flex-col gap-10">
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

      <article className="animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full break-words">
        <header className="mb-10 mx-auto max-w-300 text-center">
          <h1 className="text-3xl md:text-5xl font-medium text-foreground dark:text-foreground leading-tight mb-6">
            {blog.title}
          </h1>
          {blog.description && (
            <p className="text-lg text-muted dark:text-muted font-medium leading-relaxed mb-6">
              {blog.description}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3 py-1.5 dark:border-outline dark:bg-surface">
              <SiteIcon className="text-base text-primary">event_note</SiteIcon>
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3 py-1.5 dark:border-outline dark:bg-surface">
              <SiteIcon className="text-base text-primary">visibility</SiteIcon>
              {blog.views + 1} Views
            </span>
          </div>
        </header>

        {blog.image && (
          <div className="relative aspect-video md:aspect-21/9 w-full overflow-hidden rounded-3xl border border-outline dark:border-outline shadow-sm mb-12">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="overflow-x-auto no-scrollbar">
          <div
            className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-medium prose-headings:text-foreground dark:prose-headings:text-white
                prose-p:text-muted dark:prose-p:text-muted prose-p:leading-relaxed
                prose-strong:text-foreground dark:prose-strong:text-white
                prose-img:rounded-2xl prose-img:shadow-sm prose-img:max-w-full prose-img:h-auto
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-li:text-muted dark:prose-li:text-muted
                prose-blockquote:border-primary prose-blockquote:text-foreground
                prose-pre:overflow-x-auto prose-pre:max-w-full
                prose-table:overflow-x-auto prose-table:block prose-table:w-full"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>

      {/* Back / shop banner */}
      <div className="mt-10 p-10 md:p-16 bg-[#121714] rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 size-80 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 size-80 bg-primary/10 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <div className="size-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
            <SiteIcon className="text-4xl">newspaper</SiteIcon>
          </div>
          <h2 className="text-3xl md:text-4xl font-medium italic">Keep reading</h2>
          <p className="text-white/60 font-medium">
            Explore more guides on laptops, technology and smart buying.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/blog" className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-95">
              <SiteIcon className="text-base">arrow_back</SiteIcon> Back to Blog
            </Link>
            <Link href="/shop" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BlogDetailsPage;
