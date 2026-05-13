import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { getPendingOrdersCount } from "@/lib/action/v2-order.action";

export default async function PendingOrdersAlert() {
  const res = await getPendingOrdersCount();
  
  if (!res.success || res.count === 0) {
    return null;
  }

  return (
    <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              You have <span className="font-bold text-amber-900 font-black">{res.count}</span> pending orders waiting for processing.
            </p>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors uppercase tracking-wider"
          >
            Manage Orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
