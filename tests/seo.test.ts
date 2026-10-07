import assert from "node:assert/strict";
import test from "node:test";
import { absoluteUrl, productMetaTitle } from "../lib/seo";

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
