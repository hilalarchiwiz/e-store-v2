import { AlertTriangle } from "lucide-react";
import { getPendingErpSoldItems } from "@/app/(admin)/admin/actions/erp-sold-items";
import ErpSoldItemsReview from "./ErpSoldItemsReview";

export default async function ErpSoldItemsAlert() {
  const result = await getPendingErpSoldItems();

  if (!result.success) {
    if (result.message?.startsWith("Unauthorized")) return null;

    return (
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
        {result.message || "Unable to check ERP sold items."}
      </div>
    );
  }

  return (
    <ErpSoldItemsReview
      initialItems={result.items || []}
      warning={result.warning}
    />
  );
}
