"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { FlashSaleSettings } from "@/lib/flash-sale";

const Countdown = ({ sale, initialRemaining }: { sale: FlashSaleSettings; initialRemaining: number }) => {
  const [remaining, setRemaining] = useState(initialRemaining);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, Date.parse(sale.endsAt) - Date.now()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sale.endsAt]);

  if (!sale.enabled || remaining <= 0) return null;

  const units = [
    { value: Math.floor(remaining / 86400000), label: "Days" },
    { value: Math.floor(remaining / 3600000) % 24, label: "Hours" },
    { value: Math.floor(remaining / 60000) % 60, label: "Mins" },
    { value: Math.floor(remaining / 1000) % 60, label: "Secs" },
  ];

  return (
    <section className="py-8 sm:py-10">
      <div className="relative isolate overflow-hidden rounded-xl bg-[#071E13] px-5 py-7 text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:px-8 lg:min-h-[198px] lg:px-10 lg:py-7">
        <div
          className="pointer-events-none absolute inset-0 -z-20 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,.24) 1px, transparent 0)",
            backgroundSize: "8px 8px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_50%,rgba(20,145,79,.25),transparent_35%),linear-gradient(90deg,rgba(0,0,0,.12),transparent_45%,rgba(0,0,0,.12))]" />

        <div className="grid items-center gap-6 lg:grid-cols-[minmax(310px,1fr)_auto_minmax(230px,.85fr)_auto] lg:gap-7">
          <div className="text-center lg:text-left">
            <p className="text-base font-semibold text-primary sm:text-xl">{sale.badge}</p>
            <h2 className="mt-2 text-3xl font-medium leading-none tracking-[-0.04em] sm:text-4xl">
              {sale.title}
            </h2>
            <p className="mx-auto mt-4 max-w-md whitespace-pre-line text-sm leading-[1.25] text-white/75 sm:text-lg lg:mx-0">
              {sale.description}
            </p>
          </div>

          <div className="mx-auto grid grid-cols-4 gap-2.5 lg:mx-0">
            {units.map((unit) => (
              <div
                key={unit.label}
                className="flex h-[84px] w-[58px] flex-col items-center justify-center rounded-md bg-white/10 shadow-inner backdrop-blur-sm sm:w-[66px]"
              >
                <strong className="text-[28px] font-medium leading-none sm:text-[34px]">
                  {String(unit.value).padStart(2, "0")}
                </strong>
                <span className="mt-2 text-[11px] font-medium leading-none text-white/65 sm:text-sm">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <div className="pointer-events-none relative mx-auto hidden h-36 w-full max-w-[330px] lg:block">
            <img
              src={sale.image}
              alt="Products included in the limited-time sale"
              className="h-full w-full object-contain drop-shadow-2xl"
            />
          </div>

          <Link
            href={sale.link}
            className="mx-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-lg transition hover:bg-primary/90 sm:text-base lg:mx-0"
          >
            {sale.buttonText}<span className="ml-1" aria-hidden="true">→</span>
          </Link>
        </div>

        <img
          src={sale.image}
          alt=""
          aria-hidden="true"
          className="pointer-events-none mx-auto mt-5 h-32 w-full object-contain opacity-90 lg:hidden"
        />
      </div>
    </section>
  );
};

export default Countdown;
