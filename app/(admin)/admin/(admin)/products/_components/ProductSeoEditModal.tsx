"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { updateProductSeo } from "../(actions)/product-list.action";
import { ProductSeoSchema } from "../validations/product-seo";

export interface SeoEditProduct {
  id: number;
  title: string;
  metaDescription: string | null;
  metaKeywords: string | null;
}

export default function ProductSeoEditModal({ product, onClose }: {
  product: SeoEditProduct;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const saving = useRef(false);
  const [metaDescription, setMetaDescription] = useState(product.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(product.metaKeywords ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    element?.showModal();
    element?.querySelector("textarea")?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const handleClose = () => {
    if (!saving.current) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving.current) return;
    const parsed = ProductSeoSchema.safeParse({ metaDescription, metaKeywords });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    saving.current = true;
    setIsSaving(true);
    setError("");
    try {
      const result = await updateProductSeo(product.id, parsed.data);
      if (!result.success) {
        setError(result.message || "Unable to update SEO metadata.");
        return;
      }
      toast.success(result.message);
      onClose();
      router.refresh();
    } catch {
      setError("Unable to update SEO metadata. Please try again.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="product-seo-title"
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); handleClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) handleClose(); }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl border-0 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
        <div>
          <h2 id="product-seo-title" className="text-lg font-semibold">Edit SEO metadata</h2>
          <p className="mt-1 text-sm text-gray-500">{product.title}</p>
        </div>
        <button type="button" onClick={handleClose} disabled={isSaving} aria-label="Close SEO editor" className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <form onSubmit={handleSubmit} aria-busy={isSaving}>
        <fieldset disabled={isSaving} inert={isSaving} className="min-w-0 space-y-5 border-0 p-6">
          <div>
            <label htmlFor="seo-meta-description" className="mb-1.5 block text-sm font-medium">Meta description</label>
            <textarea id="seo-meta-description" name="metaDescription" rows={4} value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} aria-describedby="seo-description-help" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <p id="seo-description-help" className="mt-1 text-xs text-gray-500">{metaDescription.length} characters. Aim for 150–160. Leave blank to use the product description.</p>
          </div>
          <div>
            <label htmlFor="seo-meta-keywords" className="mb-1.5 block text-sm font-medium">Meta keywords</label>
            <textarea id="seo-meta-keywords" name="metaKeywords" rows={5} value={metaKeywords} onChange={(event) => setMetaKeywords(event.target.value)} aria-describedby="seo-keywords-help" placeholder="Product name, product price in Pakistan, brand, model" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <p id="seo-keywords-help" className="mt-1 text-xs text-gray-500">Enter keywords separated by commas.</p>
          </div>
          <p role="alert" className="min-h-5 text-sm text-red-600">{error}</p>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={handleClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {isSaving ? "Saving..." : "Save metadata"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
