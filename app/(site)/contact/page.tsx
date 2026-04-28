import React from "react";
import Breadcrumbs from "@/components/v2/Breadcrumbs";
import ContactForm from "@/components/v2/ContactForm";
import { getSiteSettings } from "@/lib/action/settings.action";

export default async function ContactPage() {
  const { contactInfo, generalSetting } = await getSiteSettings();

  return (
    <main className="flex-1 max-w-300 mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/v2" }, { label: "Contact Us" }]}
      />

      <div className="text-center max-w-2xl mx-auto mb-4">
        <h1 className="text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-4">
          Get in Touch
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Have questions about our sustainable products? We&apos;re here to
          help you grow your green journey.
        </p>
      </div>

      <ContactForm contactInfo={contactInfo} generalSetting={generalSetting} />
    </main>
  );
}
