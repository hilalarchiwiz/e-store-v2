import assert from "node:assert/strict";
import test from "node:test";
import { ProductSeoSchema } from "../app/(admin)/admin/(admin)/products/validations/product-seo";

test("SEO edits accept comma-separated keywords and exclude unrelated product fields", () => {
  assert.deepEqual(ProductSeoSchema.parse({
    metaDescription: "  Buy a laptop with nationwide delivery.  ",
    metaKeywords: " Dell, laptop price in Pakistan ",
    price: 1, quantity: 0, status: "inactive", slug: "changed-url", title: "Changed",
  }), {
    metaDescription: "Buy a laptop with nationwide delivery.",
    metaKeywords: "Dell, laptop price in Pakistan",
  });
});

test("SEO edits allow clearing both values but reject missing or invalid fields", () => {
  assert.deepEqual(ProductSeoSchema.parse({ metaDescription: "  ", metaKeywords: "" }), {
    metaDescription: "", metaKeywords: "",
  });
  for (const input of [{}, { metaDescription: "text" }, { metaDescription: null, metaKeywords: [] }]) {
    assert.equal(ProductSeoSchema.safeParse(input).success, false);
  }
});
