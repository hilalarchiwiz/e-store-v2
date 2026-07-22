"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getPendingErpSoldItems } from "@/app/(admin)/admin/actions/erp-sold-items";
import ErpSoldItemsReview from "./ErpSoldItemsReview";
import type { PendingErpSoldItem } from "@/types/erp-sold";

interface SoldItemsState {
  status: "loading" | "loaded" | "error" | "unauthorized";
  items: PendingErpSoldItem[];
  warning: string | null;
  message: string | null;
}

const initialState: SoldItemsState = {
  status: "loading",
  items: [],
  warning: null,
  message: null,
};

export default function ErpSoldItemsAlert() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let isActive = true;

    const loadSoldItems = async () => {
      const result = await getPendingErpSoldItems();
      if (!isActive) return;

      if (!result.success) {
        setState({
          status: result.message?.startsWith("Unauthorized") ? "unauthorized" : "error",
          items: [],
          warning: null,
          message: result.message || "Unable to check ERP sold items.",
        });
        return;
      }

      setState({
        status: "loaded",
        items: result.items || [],
        warning: result.warning || null,
        message: null,
      });
    };

    const timeout = window.setTimeout(() => {
      loadSoldItems().catch(() => {
        if (!isActive) return;
        setState({
          status: "error",
          items: [],
          warning: null,
          message: "Unable to check ERP sold items.",
        });
      });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, []);

  // ERP checking happens silently after the dashboard has rendered.
  if (state.status === "loading" || state.status === "unauthorized") return null;

  if (state.status === "error") {
    return (
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
        {state.message}
      </div>
    );
  }

  return (
    <ErpSoldItemsReview
      initialItems={state.items}
      warning={state.warning}
    />
  );
}
