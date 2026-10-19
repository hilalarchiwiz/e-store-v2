import assert from "node:assert/strict";
import test from "node:test";
import { listingPage, listingPagePath, SHOP_PAGE_SIZE, visibleListingPage } from "../lib/listing-pagination";

test("visible page increases and decreases with the product boundaries in view", () => {
  const pageAt = (scroll: number) => visibleListingPage(
    [1, 2, 3].map((page) => ({ page, top: 100 + (page - 1) * 1000 - scroll })),
    300,
    1,
  );
  assert.deepEqual([0, 1000, 2000, 1000, 0].map(pageAt), [1, 2, 3, 2, 1]);
  // Prefetched products below the viewport must not advance the address.
  assert.equal(pageAt(100), 1);
  assert.equal(pageAt(10000), 3);
  assert.equal(visibleListingPage([{ page: 4, top: 500 }], 300, 4), 4);
});

test("listing pages accept positive integers and fall back for invalid input", () => {
  for (const value of [undefined, "0", "-1", "NaN", "1.5", "Infinity"]) {
    assert.equal(listingPage(value), 1);
  }
  assert.equal(listingPage("3"), 3);
  assert.equal((listingPage("3") - 1) * SHOP_PAGE_SIZE, 40);
});

test("pagination links preserve filters, encode values, and omit page one", () => {
  assert.equal(listingPagePath("/shop", { page: "2" }, 1), "/shop");
  assert.equal(
    listingPagePath("/shop", { category: "parts & chargers", page: "7", sort: "price_asc" }, 2),
    "/shop?category=parts+%26+chargers&sort=price_asc&page=2",
  );
});
