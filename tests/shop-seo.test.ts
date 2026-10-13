import assert from "node:assert/strict";
import test from "node:test";
import {
  getIndexableShopFilter,
  isIndexableShopListing,
} from "../lib/shop-seo";

test("single category and brand views are indexable landing-page candidates", () => {
  assert.deepEqual(getIndexableShopFilter({ category: "chargers" }), {
    type: "category",
    value: "chargers",
  });
  assert.deepEqual(getIndexableShopFilter({ brand: "12" }), {
    type: "brand",
    value: "12",
  });
});

test("compound and utility shop filters remain excluded", () => {
  assert.equal(getIndexableShopFilter({ category: "laptops,chargers" }), null);
  assert.equal(getIndexableShopFilter({ category: "laptops", sort: "price_asc" }), null);
  assert.equal(getIndexableShopFilter({ search: "thinkpad" }), null);
  assert.equal(getIndexableShopFilter({ minPrice: "10000", maxPrice: "50000" }), null);
});

test("plain, category, and brand pagination remain crawlable", () => {
  assert.equal(isIndexableShopListing({ page: "2" }), true);
  assert.equal(isIndexableShopListing({ category: "laptops", page: "2" }), true);
  assert.equal(isIndexableShopListing({ brand: "12", page: "3" }), true);
  assert.deepEqual(getIndexableShopFilter({ category: "laptops", page: "2" }), {
    type: "category",
    value: "laptops",
  });
});

test("invalid pagination and paginated utility filters remain excluded", () => {
  assert.equal(isIndexableShopListing({ page: "not-a-page" }), false);
  assert.equal(isIndexableShopListing({ page: "0" }), false);
  assert.equal(isIndexableShopListing({ search: "thinkpad", page: "2" }), false);
  assert.equal(isIndexableShopListing({ category: "laptops", sort: "price_asc", page: "2" }), false);
});
