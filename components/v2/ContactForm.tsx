"use client";

import React, { useState, useActionState } from "react";
import Input from "@/components/v2/Input";
import TextArea from "@/components/v2/TextArea";
import Button from "@/components/v2/Button";
import { contact } from "@/lib/action/home.action";

interface ContactInfo {
  name?: string;
  phone_number?: string;
  address?: string;
}

interface GeneralSetting {
  support_number?: string;
  support_email?: string;
  home_address_location?: string;
  home_number?: string;
}

export default function ContactForm({
  contactInfo,
  generalSetting,
}: {
  contactInfo: ContactInfo;
  generalSetting: GeneralSetting;
}) {
  const [state, formAction, isPending] = useActionState(contact, null);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (state?.success) setSubmitted(true);
  }, [state]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Contact Info Sidebar */}
      <div className="lg:col-span-4 bg-white dark:bg-[#1a251d] rounded-3xl shadow-xl border border-primary/5 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-2xl font-black text-[#121714] dark:text-white">
            Contact Info
          </h2>
        </div>
        <div className="p-8 space-y-8">
          {contactInfo.name && (
            <InfoItem icon="person" label="Customer Support" value={contactInfo.name} />
          )}
          {(contactInfo.phone_number || generalSetting.support_number) && (
            <InfoItem
              icon="call"
              label="Phone Number"
              value={(contactInfo.phone_number || generalSetting.support_number)!}
              href={`tel:${contactInfo.phone_number || generalSetting.support_number}`}
            />
          )}
          {generalSetting.support_email && (
            <InfoItem
              icon="mail"
              label="Email Address"
              value={generalSetting.support_email}
              href={`mailto:${generalSetting.support_email}`}
            />
          )}
          {(contactInfo.address || generalSetting.home_address_location) && (
            <InfoItem
              icon="location_on"
              label="Office Location"
              value={(contactInfo.address || generalSetting.home_address_location)!}
            />
          )}
          {!contactInfo.name && !contactInfo.phone_number && !generalSetting.support_number && !generalSetting.support_email && !contactInfo.address && !generalSetting.home_address_location && (
            <p className="text-sm text-gray-400">Contact information not configured yet.</p>
          )}
        </div>

        <div className="p-8 bg-[#f1f4f2] dark:bg-white/5">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-4">
            Connect with us
          </p>
          <div className="flex gap-3">
            {(["public", "play_arrow", "camera"] as const).map((icon) => (
              <button
                key={icon}
                className="size-10 rounded-xl bg-white dark:bg-[#1a251d] text-gray-400 hover:text-primary hover:shadow-lg transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="lg:col-span-8 bg-white dark:bg-[#1a251d] rounded-3xl shadow-xl border border-primary/5 p-8 md:p-12">
        {submitted ? (
          <SuccessState onReset={() => setSubmitted(false)} />
        ) : (
          <>
            {state?.success === false && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                {Array.isArray(state.message) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {state.message.map((msg: string, i: number) => (
                      <li key={i} className="text-sm text-red-600 dark:text-red-400">{msg}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
                )}
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Name" name="name" placeholder="John Doe" icon="person" required />
                <Input label="Email" name="email" type="email" placeholder="name@example.com" icon="mail" required />
                <Input label="Subject" name="subject" placeholder="How can we help?" icon="topic" />
                <Input label="Phone" name="phone" type="tel" placeholder="+1234567890" icon="call" />
              </div>

              <TextArea label="Message" name="message" placeholder="Write your message here..." icon="chat_bubble" required />

              <div className="pt-2">
                <Button fullWidth icon="send" className="md:w-fit px-12" disabled={isPending}>
                  {isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        {href ? (
          <a href={href} className="text-[#121714] dark:text-white font-bold text-lg hover:text-primary transition-colors">
            {value}
          </a>
        ) : (
          <p className="text-[#121714] dark:text-white font-bold text-lg leading-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
      <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-lg">
        <span className="material-symbols-outlined !text-4xl">check_circle</span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-[#121714] dark:text-white mb-2">Message Sent!</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
      </div>
      <button onClick={onReset} className="text-sm text-primary hover:underline font-semibold">
        Send another message
      </button>
    </div>
  );
}
