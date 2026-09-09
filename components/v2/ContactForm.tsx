"use client";

import React, { useState, useActionState, useEffect } from "react";
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

interface SocialInfo {
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
}

export default function ContactForm({
  contactInfo,
  generalSetting,
  socialInfo,
}: {
  contactInfo: ContactInfo;
  generalSetting: GeneralSetting;
  socialInfo?: SocialInfo;
}) {
  const [state, formAction, isPending] = useActionState(contact, null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (state?.success) setSubmitted(true);
  }, [state]);

  // Fallback values from settings
  const phone = contactInfo?.phone_number || generalSetting?.support_number || "+92 330 4753338";
  const email = generalSetting?.support_email || "admin1@qaam.com";
  const address = contactInfo?.address || generalSetting?.home_address_location || "Plot # 104, Industrial Estates, Peshawar, Pakistan";

  // Clean WhatsApp number
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const waNumber = cleanPhone.startsWith("+")
    ? cleanPhone.substring(1)
    : cleanPhone.startsWith("0")
    ? "92" + cleanPhone.substring(1)
    : cleanPhone;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello Qaam.pk team! I have a question regarding your products and support.")}`;

  return (
    <div className="flex flex-col gap-10 sm:gap-14 w-full">
      {/* Section 1: GET IN TOUCH Info + Contact Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Left Column: Get In Touch Info */}
        <div className="lg:col-span-6 bg-surface dark:bg-surface p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between gap-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col gap-3">
            <span className="text-green-600 dark:text-emerald-400 text-sm font-bold tracking-wider uppercase">
              GET IN TOUCH
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
              We are always ready to help you and answer your questions
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
              Our support team is ready to assist you with product information, orders, returns and technical support.
            </p>
          </div>

          {/* 4 Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Call Center */}
            <div className="p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/50 dark:bg-surface flex items-start gap-3.5 shadow-2xs transition-all hover:border-green-500/40">
              <div className="size-10 rounded-lg bg-green-600/10 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined !text-xl">call</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-neutral-900 dark:text-white font-bold text-base leading-snug">
                  Call Center
                </h4>
                <a
                  href={`tel:${phone}`}
                  className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm font-normal tracking-tight hover:text-green-600 transition-colors truncate mt-1"
                >
                  {phone}
                </a>
              </div>
            </div>

            {/* Our Location */}
            <div className="p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/50 dark:bg-surface flex items-start gap-3.5 shadow-2xs transition-all hover:border-green-500/40">
              <div className="size-10 rounded-lg bg-green-600/10 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined !text-xl">location_on</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-neutral-900 dark:text-white font-bold text-base leading-snug">
                  Our Location
                </h4>
                <p className="text-neutral-600 dark:text-neutral-300 text-xs font-normal tracking-tight line-clamp-2 mt-1">
                  {address}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/50 dark:bg-surface flex items-start gap-3.5 shadow-2xs transition-all hover:border-green-500/40">
              <div className="size-10 rounded-lg bg-green-600/10 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined !text-xl">mail</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-neutral-900 dark:text-white font-bold text-base leading-snug">
                  Email
                </h4>
                <a
                  href={`mailto:${email}`}
                  className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm font-normal tracking-tight hover:text-green-600 transition-colors truncate mt-1"
                >
                  {email}
                </a>
                <span className="text-neutral-400 dark:text-neutral-500 text-[10px] font-normal tracking-tight mt-0.5">
                  we respond within 24 hours
                </span>
              </div>
            </div>

            {/* Social Network */}
            <div className="p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/50 dark:bg-surface flex items-start gap-3.5 shadow-2xs transition-all hover:border-green-500/40">
              <div className="size-10 rounded-lg bg-green-600/10 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined !text-xl">share</span>
              </div>
              <div className="flex flex-col min-w-0 w-full">
                <h4 className="text-neutral-900 dark:text-white font-bold text-base leading-snug mb-1.5">
                  Social Network
                </h4>
                <div className="flex items-center gap-2">
                  {socialInfo?.facebook_url ? (
                    <a
                      href={socialInfo.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-full bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-green-600 hover:text-white transition-colors"
                      title="Facebook"
                    >
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  ) : (
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-full bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-green-600 hover:text-white transition-colors"
                      title="Facebook"
                    >
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}

                  {socialInfo?.instagram_url ? (
                    <a
                      href={socialInfo.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-full bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-green-600 hover:text-white transition-colors"
                      title="Instagram"
                    >
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  ) : (
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-full bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-green-600 hover:text-white transition-colors"
                      title="Instagram"
                    >
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}

                  {socialInfo?.linkedin_url ? (
                    <a
                      href={socialInfo.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-full bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-green-600 hover:text-white transition-colors"
                      title="LinkedIn"
                    >
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  ) : (
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-full bg-neutral-200/70 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-green-600 hover:text-white transition-colors"
                      title="LinkedIn"
                    >
                      <svg className="size-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send Us A Message Form */}
        <div className="lg:col-span-6 bg-surface dark:bg-surface p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.15)] flex flex-col justify-between">
          {submitted ? (
            <div className="flex flex-col items-center justify-center my-auto py-12 text-center gap-5">
              <div className="size-16 bg-green-600/10 rounded-full flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined !text-4xl">check_circle</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  Message Sent!
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-sm">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 text-sm font-semibold text-green-600 hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col h-full justify-between gap-5">
              <div>
                <span className="text-green-600 dark:text-emerald-400 text-sm font-bold tracking-wider uppercase block mb-1">
                  SEND US A MESSAGE
                </span>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm font-normal mb-5">
                  Drop us a message and we’ll get back to you as soon as possible.
                </p>

                {state?.success === false && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                    {Array.isArray(state.message) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {state.message.map((msg: string, i: number) => (
                          <li key={i} className="text-xs text-red-600 dark:text-red-400">
                            {msg}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {state.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3.5">
                  {/* Name Input */}
                  <div className="px-3.5 py-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-surface dark:bg-surface flex items-center gap-3 focus-within:border-green-600 transition-colors">
                    <span className="material-symbols-outlined text-green-600 dark:text-emerald-400 !text-xl shrink-0">
                      person
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your Full Name"
                      className="w-full text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="px-3.5 py-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-surface dark:bg-surface flex items-center gap-3 focus-within:border-green-600 transition-colors">
                    <span className="material-symbols-outlined text-green-600 dark:text-emerald-400 !text-xl shrink-0">
                      mail
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Your personal email"
                      className="w-full text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="px-3.5 py-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-surface dark:bg-surface flex items-center gap-3 focus-within:border-green-600 transition-colors">
                    <span className="material-symbols-outlined text-green-600 dark:text-emerald-400 !text-xl shrink-0">
                      call
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Your phone number (+92...)"
                      className="w-full text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Subject Input */}
                  <div className="px-3.5 py-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-surface dark:bg-surface flex items-center gap-3 focus-within:border-green-600 transition-colors">
                    <span className="material-symbols-outlined text-green-600 dark:text-emerald-400 !text-xl shrink-0">
                      topic
                    </span>
                    <input
                      type="text"
                      name="subject"
                      required
                      placeholder="Subject / Concern"
                      className="w-full text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-neutral-900 dark:text-white">
                      Message
                    </label>
                    <div className="p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-surface dark:bg-surface flex items-start gap-3 focus-within:border-green-600 transition-colors">
                      <textarea
                        name="message"
                        required
                        rows={3}
                        placeholder="Your message"
                        className="w-full text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 bg-transparent focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm px-7 py-2.5 rounded-sm outline outline-1 outline-offset-[-1px] outline-neutral-400 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Section 2: Full-Width Google Maps Embed */}
      <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-neutral-800 h-[380px] sm:h-[480px] lg:h-[550px] relative bg-neutral-100 dark:bg-neutral-900">
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Qaam.pk Office Location Map"
        />
      </div>

      {/* Section 3: Live Chat & WhatsApp Banner */}
      <div className="w-full bg-[#f4f9f5] dark:bg-surface border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden">
        {/* Left Side: Circular Badge & Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center lg:items-start gap-6 flex-1">
          {/* Headset Multi-Ring Badge */}
          <div className="relative size-24 sm:size-28 rounded-full bg-green-600/10 flex items-center justify-center shrink-0 border border-green-600/20">
            <div className="size-16 sm:size-20 rounded-full bg-green-600/20 flex items-center justify-center">
              <div className="size-10 sm:size-12 rounded-full bg-green-600 flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined !text-2xl sm:!text-3xl">
                  headset_mic
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {/* Live Chat Available Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-green-600/40 bg-white/60 dark:bg-surface text-green-600 dark:text-emerald-400 text-sm font-semibold w-fit">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-green-500"></span>
              </span>
              Live Chat Available
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight">
              Need Instant help choosing{" "}
              <span className="text-green-600 dark:text-emerald-400">
                the right device?
              </span>
            </h3>

            {/* Subtitle */}
            <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Skip the email wait! Connect directly with our tech support team for instant product advice, custom quotes, and order assistance.
            </p>

            {/* Actions Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold text-sm rounded-lg transition-all shadow-md shadow-green-600/20 flex items-center justify-center gap-2.5 group whitespace-nowrap cursor-pointer"
              >
                <svg className="size-5 fill-white group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Chat on Whatsapp</span>
              </a>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3.5 py-2.5 rounded-lg bg-surface dark:bg-surface border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
                  <span className="material-symbols-outlined text-green-600 !text-base">verified</span>
                  Expert Advice
                </div>
                <div className="px-3.5 py-2.5 rounded-lg bg-surface dark:bg-surface border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
                  <span className="material-symbols-outlined text-green-600 !text-base">bolt</span>
                  Fast Response
                </div>
                <div className="px-3.5 py-2.5 rounded-lg bg-surface dark:bg-surface border border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
                  <span className="material-symbols-outlined text-green-600 !text-base">mood</span>
                  Friendly support
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="w-full lg:w-auto shrink-0 max-w-sm lg:max-w-md">
          <img
            src="/images/contact-devices.jpg"
            alt="Device Support"
            className="w-full h-auto rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 shadow-md object-cover"
          />
        </div>
      </div>
    </div>
  );
}
