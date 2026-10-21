"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { Award, ChevronDown, DollarSign, FilePenLine, PenLine, Pencil, Search } from "lucide-react";

type ProductEditDropdownProps = {
  productId: number;
  productTitle: string;
  onSeo: () => void;
  onContent: () => void;
  onQuickEdit: () => void;
  onGrading: () => void;
  onPrice: () => void;
};

export default function ProductEditDropdown({ productId, productTitle, onSeo, onContent, onQuickEdit, onGrading, onPrice }: ProductEditDropdownProps) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const itemClass = "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600";
  const select = (action: () => void) => {
    panel.current?.hidePopover();
    trigger.current?.focus();
    action();
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        popoverTarget={id}
        aria-expanded={isOpen}
        aria-controls={id}
        aria-label={`Edit product: ${productTitle}`}
        onClick={() => {
          const rect = trigger.current?.getBoundingClientRect();
          if (rect) setPosition({ top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 360)), left: Math.max(8, Math.min(rect.right - 240, window.innerWidth - 248)) });
        }}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        <Pencil size={14} aria-hidden="true" />
        Edit product
        <ChevronDown size={14} aria-hidden="true" className={isOpen ? "rotate-180" : ""} />
      </button>
      <div
        id={id}
        ref={panel}
        popover="auto"
        onToggle={(event) => setIsOpen(event.newState === "open")}
        style={position}
        className="fixed m-0 max-h-[calc(100vh-1rem)] w-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
      >
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Product editing</p>
        <button type="button" className={itemClass} onClick={() => select(onSeo)}><Search size={16} aria-hidden="true" />Edit SEO metadata</button>
        <button type="button" className={itemClass} onClick={() => select(onContent)}><FilePenLine size={16} aria-hidden="true" />Edit product content</button>
        <button type="button" className={itemClass} onClick={() => select(onQuickEdit)}><PenLine size={16} aria-hidden="true" />Edit title & quantity</button>
        <button type="button" className={itemClass} onClick={() => select(onPrice)}><DollarSign size={16} aria-hidden="true" />Update price</button>
        <button type="button" className={itemClass} onClick={() => select(onGrading)}><Award size={16} aria-hidden="true" />Assign grading</button>
        <div className="my-1 border-t border-gray-100" />
        <Link href={`/admin/products/edit/${productId}`} className={itemClass} onClick={() => panel.current?.hidePopover()}><Pencil size={16} aria-hidden="true" />Edit all product details</Link>
      </div>
    </>
  );
}
