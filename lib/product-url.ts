type ProductUrlSource = {
  slug?: string | null;
  id?: number | string;
};

/** Builds the canonical storefront URL. The ID fallback only supports legacy rows without a slug. */
export function productPath({ slug, id }: ProductUrlSource) {
  const normalizedSlug = slug?.trim();
  if (normalizedSlug) return `/product/${encodeURIComponent(normalizedSlug)}`;
  if (id !== undefined) return `/product/${id}`;
  return "/shop";
}
