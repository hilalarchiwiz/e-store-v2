export const SHOP_PAGE_SIZE = 20;

export function visibleListingPage(
  boundaries: { page: number; top: number }[],
  readingLine: number,
  initialPage: number,
) {
  let page = initialPage;
  for (const boundary of boundaries) {
    if (boundary.top > readingLine) break;
    page = boundary.page;
  }
  return page;
}

export function listingPage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function listingPagePath(
  pathname: string,
  filters: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key !== "page" && value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
