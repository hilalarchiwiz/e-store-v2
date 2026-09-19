import React from "react";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import ContactForm from "@/components/v2/ContactForm";
import { getSiteSettings } from "@/lib/action/settings.action";
import { Metadata } from "next";
import { createPublicMetadata } from "@/lib/seo";

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
    </main>
  );
}
