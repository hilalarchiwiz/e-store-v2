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
            <InfoItem
              icon="person"
              label="Customer Support"
              value={contactInfo.name}
            />
          )}
          {(contactInfo.phone_number || generalSetting.support_number) && (
            <InfoItem
              icon="call"
              label="Phone Number"
              value={
                (contactInfo.phone_number || generalSetting.support_number)!
              }
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
              value={
                (contactInfo.address || generalSetting.home_address_location)!
              }
            />
          )}
          {!contactInfo.name &&
            !contactInfo.phone_number &&
            !generalSetting.support_number &&
            !generalSetting.support_email &&
            !contactInfo.address &&
            !generalSetting.home_address_location && (
              <p className="text-sm text-gray-400">
                Contact information not configured yet.
              </p>
            )}
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
                      <li
                        key={i}
                        className="text-sm text-red-600 dark:text-red-400"
                      >
                        {msg}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {state.message}
                  </p>
                )}
              </div>
            )}

            <form action={formAction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Name"
                  name="name"
                  placeholder="John Doe"
                  icon="person"
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  icon="mail"
                  required
                />
                <Input
                  label="Subject"
                  name="subject"
                  placeholder="How can we help?"
                  icon="topic"
                />
                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  icon="call"
                />
              </div>

              <TextArea
                label="Message"
                name="message"
                placeholder="Write your message here..."
                icon="chat_bubble"
                required
              />

              <div className="pt-2">
                <Button
                  fullWidth
                  icon="send"
                  className="md:w-fit px-12"
                  disabled={isPending}
                >
                  {isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>

            {/* WhatsApp Direct Chat Box — Under Form */}
            <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5">
              {(() => {
                const phone = (contactInfo.phone_number || generalSetting.support_number || "+923001234567").replace(/[^\d+]/g, "");
                const num = phone.startsWith("+") ? phone.substring(1) : phone.startsWith("0") ? "92" + phone.substring(1) : phone;
                const waUrl = `https://wa.me/${num}?text=${encodeURIComponent("Hello Qaam.pk team! I have a question regarding your products and support.")}`;
                return (
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-[#1b3323] dark:to-[#14281b] border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="relative size-14 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
                        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 flex size-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full size-3 bg-green-500"></span>
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest">
                            Live Chat Available
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-[#121714] dark:text-white leading-tight">
                          Need Instant Help? Chat on WhatsApp
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1 leading-relaxed">
                          Skip the email wait! Connect directly with our tech support team for instant product advice, custom quotes, and order assistance.
                        </p>
                      </div>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto shrink-0 py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2.5 group whitespace-nowrap"
                    >
                      <svg className="w-4.5 h-4.5 fill-white group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>Chat Live on WhatsApp</span>
                    </a>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="text-[#121714] dark:text-white font-bold text-lg hover:text-primary transition-colors"
          >
            {value}
          </a>
        ) : (
          <p className="text-[#121714] dark:text-white font-bold text-lg leading-tight">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
      <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-lg">
        <span className="material-symbols-outlined !text-4xl">
          check_circle
        </span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-[#121714] dark:text-white mb-2">
          Message Sent!
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Thank you for reaching out. We&apos;ll get back to you as soon as
          possible.
        </p>
      </div>
      <button
        onClick={onReset}
        className="text-sm text-primary hover:underline font-semibold"
      >
        Send another message
      </button>
    </div>
  );
}
