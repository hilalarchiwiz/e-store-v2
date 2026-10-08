import assert from "node:assert/strict";
import test from "node:test";
import { getIndexableShopFilter } from "../lib/shop-seo";

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
  assert.equal(getIndexableShopFilter({ page: "2" }), null);
  assert.equal(getIndexableShopFilter({ minPrice: "10000", maxPrice: "50000" }), null);
});
