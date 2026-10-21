import assert from "node:assert/strict";
import test from "node:test";
import { absoluteUrl, createPublicMetadata, LAPTOP_SEO_KEYWORDS, productMetaTitle } from "../lib/seo";

test("absoluteUrl uses the verified Search Console hostname", () => {
  assert.equal(absoluteUrl("/sitemap.xml"), "https://www.qaam.pk/sitemap.xml");
});

test("productMetaTitle adds the search phrase to short product names", () => {
  assert.equal(
    productMetaTitle("Dell Latitude 7490"),
    "Dell Latitude 7490 – Price in Pakistan",
  );
});

test("productMetaTitle shortens supplier titles and removes repeated terms", () => {
  const title = productMetaTitle(
    "HP ProBook 645 G4 640 G4 650 G4 CD03XL HSN-I14C-4 Laptop Battery",
  );

  assert.ok(title.length <= 48);
  assert.equal(title.match(/\bG4\b/g)?.length, 1);
  assert.equal(title, "HP ProBook 645 G4 640 650 CD03XL HSN-I14C-4");
});

test("productMetaTitle strips HTML from imported names", () => {
  assert.equal(
    productMetaTitle("<strong>Lenovo ThinkPad</strong> T14"),
    "Lenovo ThinkPad T14 – Price in Pakistan",
  );
});


test("public metadata preserves custom SEO text and shares the description with social previews", () => {
  const description = 'Buy a laptop with 16GB RAM & 512GB SSD. ' + 'Delivery across Pakistan. '.repeat(6);
  const keywords = 'Dell Latitude, laptop price in Pakistan, used laptops';
  const metadata = createPublicMetadata({
    title: "Dell Latitude",
    description,
    keywords,
    path: "/product/dell-latitude",
  });

  assert.equal(metadata.description, description);
  assert.equal(metadata.keywords, keywords);
  assert.equal(metadata.openGraph?.description, description);
  assert.equal(metadata.twitter?.description, description);
  assert.deepEqual(metadata.alternates, { canonical: "https://www.qaam.pk/product/dell-latitude" });
});

test("public metadata accepts the shared laptop keywords and optional product keywords", () => {
  const options = { title: "Shop", description: "Shop laptops", path: "/shop" };
  assert.deepEqual(createPublicMetadata({ ...options, keywords: LAPTOP_SEO_KEYWORDS }).keywords, LAPTOP_SEO_KEYWORDS);
  assert.equal(createPublicMetadata({ ...options, keywords: null }).keywords, null);
  assert.equal(createPublicMetadata(options).keywords, undefined);
});
