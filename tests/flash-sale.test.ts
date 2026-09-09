import assert from "node:assert/strict";
import test from "node:test";
import { defaultFlashSale, flashSaleSchema, getFlashSaleDeadline, parseFlashSale } from "../lib/flash-sale";

test("flash sale visibility preserves explicit hiding and fails closed for corrupt settings", () => {
  assert.equal(parseFlashSale(JSON.stringify({ ...defaultFlashSale, enabled: false })).enabled, false);
  assert.equal(parseFlashSale("broken").enabled, false);
  assert.deepEqual(parseFlashSale(null), defaultFlashSale);
});
test("countdown changes use one saved deadline and blank duration preserves it", () => {
  const now = Date.parse("2026-09-09T00:00:00Z");
  assert.equal(getFlashSaleDeadline("2", "3", defaultFlashSale.endsAt, now), "2026-09-11T03:00:00.000Z");
  assert.equal(getFlashSaleDeadline("", "", defaultFlashSale.endsAt, now), defaultFlashSale.endsAt);
  for (const [days, hours] of [["0", "0"], ["-1", "0"], ["1.5", "0"], ["366", "0"], ["1", "24"], ["abc", ""]]) {
    assert.throws(() => getFlashSaleDeadline(days, hours, defaultFlashSale.endsAt, now));
  }
});
test("sale button accepts site links and rejects unsafe destinations", () => {
  for (const link of ["/shop", "/shop?category=2"]) {
    assert.equal(flashSaleSchema.safeParse({ ...defaultFlashSale, link }).success, true);
  }
  for (const link of ["javascript:alert(1)", "//example.com", "/\\example.com", "https://example.com"]) {
    assert.equal(flashSaleSchema.safeParse({ ...defaultFlashSale, link }).success, false);
  }
});
