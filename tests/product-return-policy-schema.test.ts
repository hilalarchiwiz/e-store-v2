import assert from "node:assert/strict";
import test from "node:test";
import { productReturnPolicy } from "../lib/product-return-policy-schema";

test("product return policy matches the published 14-day policy for Pakistan", () => {
  assert.equal(productReturnPolicy["@type"], "MerchantReturnPolicy");
  assert.equal(productReturnPolicy.applicableCountry, "PK");
  assert.equal(
    productReturnPolicy.returnPolicyCategory,
    "https://schema.org/MerchantReturnFiniteReturnWindow",
  );
  assert.equal(productReturnPolicy.merchantReturnDays, 14);
  assert.match(productReturnPolicy.merchantReturnLink, /\/returns-exchanges$/);
  assert.doesNotThrow(() => JSON.stringify(productReturnPolicy));
});
