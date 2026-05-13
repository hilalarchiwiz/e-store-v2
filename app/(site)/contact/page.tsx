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
  const { contactInfo, generalSetting } = await getSiteSettings();

  return (
    <main className="flex-1 max-w-300 mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <div className="text-center max-w-2xl mx-auto mb-4">
        <h1 className="text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-4">
          Get in Touch
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Have questions about our premium computing products? We&apos;re here to help
          you find the perfect tech solution for your home or office.
        </p>
      </div>

      <ContactForm contactInfo={contactInfo} generalSetting={generalSetting} />
    </main>
  );
}
