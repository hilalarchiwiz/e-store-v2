import React from "react";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import ContactForm from "@/components/v2/ContactForm";
import { getSiteSettings } from "@/lib/action/settings.action";
import { Metadata } from "next";
import { createPublicMetadata } from "@/lib/seo";
import SeoContent from "@/components/v2/SeoContent";

export const metadata: Metadata = createPublicMetadata({
  title: "Contact Support & Sales",
  description: "Contact Qaam.pk for laptop and computer product questions, technical support, order assistance and sales enquiries in Pakistan.",
  path: "/contact",
});

export default async function ContactPage() {
  const { contactInfo, generalSetting, socialInfo } = await getSiteSettings();

  return (
    <main className="max-w-400 mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <ContactForm
        contactInfo={contactInfo}
        generalSetting={generalSetting}
        socialInfo={socialInfo}
      />
      <SeoContent
        eyebrow="Sales and customer care"
        title="How Qaam.pk can help"
        paragraphs={[
          "Contact Qaam.pk when you need help selecting a laptop, desktop computer, tablet, projector or compatible accessory. Include the product name, your expected workload and any important requirements such as budget, portability, battery life or graphics performance. Clear details help our team compare suitable options and explain the specifications that matter for your purchase instead of recommending equipment that does not fit your needs.",
          "Existing customers can contact support about an order, delivery update, product question, return or exchange. Please provide your order number and the email address or telephone number used at checkout, but never send passwords or payment credentials. If you are reporting a physical or technical problem, photographs and a concise description of what happened can help the team understand the request and advise you on the appropriate next step.",
          "Before sending a message, you can review our frequently asked questions for general information about ordering, delivery and product support. Our returns and exchanges page explains the current eligibility requirements and process. Product availability can change as orders are completed, so contact the team promptly if you need confirmation about a listed item. Qaam.pk serves customers across Pakistan and responds during the support hours shown on this page.",
        ]}
        links={[
          { href: "/shop", label: "Browse products" },
          { href: "/faq", label: "Read common questions" },
          { href: "/returns-exchanges", label: "Returns and exchanges" },
        ]}
      />
    </main>
  );
}
