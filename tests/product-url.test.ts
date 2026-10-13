import assert from "node:assert/strict";
import test from "node:test";
import { productPath } from "../lib/product-url";

test("productPath prefers the canonical slug over the database ID", () => {
  assert.equal(
    productPath({ id: 42, slug: "lenovo-thinkpad-t14" }),
    "/product/lenovo-thinkpad-t14",
  );
});

test("productPath trims and safely encodes slugs", () => {
  assert.equal(productPath({ id: 42, slug: " model / 14 " }), "/product/model%20%2F%2014");
});

test("productPath keeps legacy products without slugs reachable", () => {
  assert.equal(productPath({ id: 42, slug: null }), "/product/42");
});
