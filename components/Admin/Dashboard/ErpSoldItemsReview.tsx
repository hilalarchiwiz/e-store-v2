"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PackageMinus,
  XCircle,
} from "lucide-react";
import { reviewErpSoldItem } from "@/app/(admin)/admin/actions/erp-sold-items";
import type {
  ErpSoldReviewDecision,
  PendingErpSoldItem,
} from "@/types/erp-sold";

interface ErpSoldItemsReviewProps {
  initialItems: PendingErpSoldItem[];
  warning?: string | null;
}

const formatErpDate = (value: string | null) => {
  if (!value) return "ERP update date unavailable";

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function ErpSoldItemsReview({
  initialItems,
  warning,
}: ErpSoldItemsReviewProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [processing, setProcessing] = useState<{
    eventKey: string;
    decision: ErpSoldReviewDecision;
  } | null>(null);

  const reviewItem = async (
    item: PendingErpSoldItem,
    decision: ErpSoldReviewDecision,
  ) => {
    setProcessing({ eventKey: item.eventKey, decision });

    try {
      const result = await reviewErpSoldItem({
        eventKey: item.eventKey,
        productId: item.productId,
        decision,
      });

      if (!result.success) {
        toast.error(result.message || "Unable to review the ERP sold item.");
        return;
      }

      setItems((currentItems) => currentItems
        .filter((currentItem) => currentItem.eventKey !== item.eventKey)
        .map((currentItem) => (
          currentItem.productId === item.productId && typeof result.quantity === "number"
            ? { ...currentItem, currentQuantity: result.quantity }
            : currentItem
        )));
      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Unable to review the ERP sold item. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  if (items.length === 0 && !warning) return null;

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-orange-200 bg-orange-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-orange-100 p-2 text-orange-700">
            <PackageMinus className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold text-orange-950">New ERP sold items</h2>
            <p className="mt-0.5 text-sm text-orange-800">
              Approve to reduce QAAM stock. Use Already adjusted for sales you reconciled manually.
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <span className="self-start rounded-full bg-orange-200 px-3 py-1 text-xs font-bold text-orange-900 sm:self-auto">
            {items.length} pending
          </span>
        )}
      </div>

      {warning && (
        <p className="border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-xs text-amber-800">
          {warning}
        </p>
      )}

      <div className="max-h-[28rem] divide-y divide-gray-100 overflow-y-auto">
        {items.map((item) => {
          const isProcessing = processing?.eventKey === item.eventKey;

          return (
            <article key={item.eventKey} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.erpTitle}</h3>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Sold · {item.units} {item.units === 1 ? "unit" : "units"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    QAAM match: <span className="font-medium text-gray-800">{item.productTitle}</span>
                    {" · "}Current quantity: <span className="font-semibold">{item.currentQuantity}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>ERP ID: {item.erpUniqueId || item.erpProductId}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatErpDate(item.erpUpdatedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => reviewItem(item, "REJECTED")}
                    disabled={processing !== null}
                    className="inline-flex min-w-24 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-wait disabled:opacity-50"
                  >
                    {isProcessing && processing?.decision === "REJECTED" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                    )}
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewItem(item, "ALREADY_ADJUSTED")}
                    disabled={processing !== null}
                    className="inline-flex min-w-32 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-50"
                  >
                    {isProcessing && processing?.decision === "ALREADY_ADJUSTED" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    )}
                    Already adjusted
                  </button>
                  <button
                    type="button"
                    onClick={() => reviewItem(item, "APPROVED")}
                    disabled={processing !== null}
                    className="inline-flex min-w-24 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-50"
                  >
                    {isProcessing && processing?.decision === "APPROVED" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
