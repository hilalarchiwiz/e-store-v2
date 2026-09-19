import type { Metadata } from "next";

export const SITE_NAME = "Qaam.pk";
export const SITE_URL = "https://qaam.pk";
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
