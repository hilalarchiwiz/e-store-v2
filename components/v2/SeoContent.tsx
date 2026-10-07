import Link from "next/link";

type SeoContentProps = {
  eyebrow: string;
  title: string;
  paragraphs: readonly string[];
  links?: readonly { href: string; label: string }[];
};

export default function SeoContent({
  eyebrow,
  title,
  paragraphs,
  links = [],
}: SeoContentProps) {
  return (
    <section
      aria-labelledby="seo-content-heading"
      className="my-10 rounded-2xl border border-outline bg-surface px-5 py-7 sm:px-8 sm:py-9"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 id="seo-content-heading" className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 grid gap-4 text-sm leading-7 text-muted lg:grid-cols-3">
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {links.length > 0 && (
        <nav aria-label={`${title} links`} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-primary">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
      )}
    </section>
  );
}
