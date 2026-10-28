import assert from "node:assert/strict";
import test from "node:test";
import { ProductContentSchema } from "../app/(admin)/admin/(admin)/products/validations/product-content";

const content = {
  title: "Updated laptop title",
  description: "Updated product description.",
  additionalInfo: "<h2>Details</h2><p>Original formatting.</p>",
};

test("content updates cannot modify URLs, fonts, inventory, price, or status", () => {
  const parsed = ProductContentSchema.parse({
    ...content, slug: "changed-url", titleFont: "changed-font", quantity: 0,
    price: 1, status: "inactive", images: [], specifications: {},
  });
  assert.deepEqual(parsed, content);
});

test("content validates trimmed titles and descriptions using existing product limits", () => {
  for (const change of [
    { title: "     " }, { title: "a".repeat(201) }, { title: "Short".slice(0, 4) },
    { description: "          " }, { description: "Too short" },
    { additionalInfo: null }, { description: undefined },
  ]) {
    assert.equal(ProductContentSchema.safeParse({ ...content, ...change }).success, false);
  }
  assert.equal(ProductContentSchema.parse({ ...content, title: ` ${content.title} ` }).title, content.title);
});

test("additional information preserves HTML and can be cleared explicitly", () => {
  assert.equal(ProductContentSchema.parse(content).additionalInfo, content.additionalInfo);
  assert.equal(ProductContentSchema.parse({ ...content, additionalInfo: "" }).additionalInfo, "");
  const { additionalInfo: _, ...missingInfo } = content;
  assert.equal(ProductContentSchema.safeParse(missingInfo).success, false);
});

test("description preserves rich text and validates visible text length", () => {
  const description = "<h1>Laptop details</h1><p><strong>Excellent condition</strong></p>";
  assert.equal(ProductContentSchema.parse({ ...content, description }).description, description);
  for (const description of ["<p></p>", "<h1>Short</h1>", "<p>&nbsp; &nbsp;</p>"]) {
    assert.equal(ProductContentSchema.safeParse({ ...content, description }).success, false);
  }
});
