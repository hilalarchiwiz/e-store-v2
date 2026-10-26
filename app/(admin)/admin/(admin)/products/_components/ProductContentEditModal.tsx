"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/Admin/RichTextEditor";
import { updateProductContent } from "../(actions)/product-list.action";
import { ProductContentSchema } from "../validations/product-content";

export interface ContentEditProduct {
  id: number;
  title: string;
  description: string;
  additionalInfo: string | null;
}

export default function ProductContentEditModal({ product, onClose }: {
  product: ContentEditProduct;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const saving = useRef(false);
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [additionalInfo, setAdditionalInfo] = useState(product.additionalInfo ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    element?.showModal();
    element?.querySelector("input")?.focus();
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
    const parsed = ProductContentSchema.safeParse({ title, description, additionalInfo });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    saving.current = true;
    setIsSaving(true);
    setError("");
    try {
      const result = await updateProductContent(product.id, parsed.data);
      if (!result.success) {
        setError(result.message || "Unable to update product content.");
        return;
      }
      toast.success(result.message);
      onClose();
      router.refresh();
    } catch {
      setError("Unable to update product content. Please try again.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="product-content-title"
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); handleClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) handleClose(); }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl border-0 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
        <div>
          <h2 id="product-content-title" className="text-lg font-semibold">Edit product content</h2>
          <p className="mt-1 text-sm text-gray-500">Update the product title, description, and additional information.</p>
        </div>
        <button type="button" onClick={handleClose} disabled={isSaving} aria-label="Close content editor" className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <form onSubmit={handleSubmit} aria-busy={isSaving}>
        <fieldset disabled={isSaving} inert={isSaving} className="min-w-0 space-y-5 border-0 p-6">
          <div>
            <label htmlFor="content-product-title" className="mb-1.5 block text-sm font-medium">Product title</label>
            <input id="content-product-title" name="title" required minLength={5} maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            <p className="mt-1 text-xs text-gray-500">{title.length}/200 characters. The product URL stays the same.</p>
          </div>
          <div role="group" aria-labelledby="content-product-description-label">
            <p id="content-product-description-label" className="mb-1.5 text-sm font-medium">Description</p>
            <RichTextEditor name="description" defaultValue={product.description} onChange={setDescription} placeholder="Product description" />
          </div>
          <div role="group" aria-labelledby="content-additional-info-label">
            <p id="content-additional-info-label" className="mb-1.5 text-sm font-medium">Additional information</p>
            <RichTextEditor name="additionalInfo" defaultValue={product.additionalInfo} onChange={setAdditionalInfo} placeholder="Additional information" />
          </div>
          <p role="alert" className="min-h-5 text-sm text-red-600">{error}</p>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={handleClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {isSaving ? "Saving..." : "Save content"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
