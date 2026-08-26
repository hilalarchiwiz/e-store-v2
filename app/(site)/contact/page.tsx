import React from "react";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import ContactForm from "@/components/v2/ContactForm";
import { getSiteSettings } from "@/lib/action/settings.action";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Qaam.pk Support & Sales",
  description: "Have a question about our laptops or computing gear? Reach out to Qaam.pk. Our technical support team is here to help you with your tech needs.",
  openGraph: {
    title: "Contact Qaam.pk | We're Here to Help",
    description: "Get in touch with the Qaam.pk team for product inquiries, technical support, and order assistance.",
    url: "https://qaam.pk/contact",
    siteName: "Qaam.pk",
    images: [{ url: "/images/og-image.png" }],
    type: "website",
  },
};

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
