// Mirrors the only active checkout shipping option (FREE, 5-7 business days)
// in app/(site)/checkout/page.tsx. Keep in sync if that policy changes.
export const productShippingDetails = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: "0",
    currency: "PKR",
  },
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "PK",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 5,
      maxValue: 7,
      unitCode: "DAY",
    },
  },
};
