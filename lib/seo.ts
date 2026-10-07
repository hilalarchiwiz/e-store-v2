import type { Metadata } from "next";

export const SITE_NAME = "Qaam.pk";
export const SITE_URL = "https://www.qaam.pk";
export const DEFAULT_OG_IMAGE = "/og";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function metaDescription(value: string, fallback: string) {
  const text = plainText(value) || fallback;
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}…`;
}

const PRODUCT_TITLE_LIMIT = 48;
const PRODUCT_PRICE_SUFFIX = " – Price in Pakistan";

function truncateAtWord(value: string, limit: number) {
  if (value.length <= limit) return value;

  const candidate = value.slice(0, limit + 1);
  const lastSpace = candidate.lastIndexOf(" ");

  return (lastSpace >= Math.floor(limit * 0.6)
    ? candidate.slice(0, lastSpace)
    : value.slice(0, limit)
  ).trimEnd();
}

/**
 * Keeps product page titles concise enough for search results. Product names are
 * imported from several suppliers and can contain repeated model numbers or an
 * entire compatibility list, neither of which belongs in the document title.
 * The root layout adds " | Qaam.pk" after this value.
 */
export function productMetaTitle(value: string) {
  const seen = new Set<string>();
  const productName = plainText(value)
    .split(" ")
    .filter((word) => {
      const normalized = word.toLocaleLowerCase("en-US").replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
      if (!normalized || !seen.has(normalized)) {
        if (normalized) seen.add(normalized);
        return true;
      }
      return false;
    })
    .join(" ");

  if (productName.length + PRODUCT_PRICE_SUFFIX.length <= PRODUCT_TITLE_LIMIT) {
    return `${productName}${PRODUCT_PRICE_SUFFIX}`;
  }

  return truncateAtWord(productName, PRODUCT_TITLE_LIMIT);
}

type PublicMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function createPublicMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
}: PublicMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const socialImage = image || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_PK",
      type,
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export const PRIVATE_PAGE_METADATA: Metadata = {
  title: "Customer Area",
  robots: { index: false, follow: false, noarchive: true },
};
