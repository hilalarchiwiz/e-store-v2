import { absoluteUrl } from "@/lib/seo";

// Mirrors app/(site)/returns-exchanges/page.tsx: 14 days from delivery, return
// to an address provided after approval. Return fees and refund type are not
// stated there, so they are intentionally omitted rather than guessed.
export const productReturnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "PK",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  merchantReturnLink: absoluteUrl("/returns-exchanges"),
};
