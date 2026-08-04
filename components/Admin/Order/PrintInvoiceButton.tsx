"use client";

import { Printer } from "lucide-react";

export default function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
    >
      <Printer size={18} />
      Print Invoice
    </button>
  );
}
