import assert from "node:assert/strict";
import test from "node:test";
import { productShippingDetails } from "../lib/product-shipping-schema";

test("product shipping details describe free PKR shipping within Pakistan", () => {
  assert.equal(productShippingDetails["@type"], "OfferShippingDetails");
  assert.deepEqual(productShippingDetails.shippingRate, {
    "@type": "MonetaryAmount",
    value: "0",
    currency: "PKR",
  });
  assert.equal(productShippingDetails.shippingDestination.addressCountry, "PK");
  assert.equal(productShippingDetails.deliveryTime.transitTime.minValue, 5);
  assert.equal(productShippingDetails.deliveryTime.transitTime.maxValue, 7);
  assert.doesNotThrow(() => JSON.stringify(productShippingDetails));
});
