"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { saveOrderRecipients } from "@/app/(admin)/admin/(admin)/orders/actions/order.action";

export default function OrderNotificationRecipients({ initialRecipients }: { initialRecipients: string[] }) {
    const [value, setValue] = useState(initialRecipients.join("\n"));
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    return (
        <form className="m-4 rounded-lg bg-white p-5 shadow" onSubmit={async event => {
            event.preventDefault();
            if (saving) return;
            setSaving(true);
            try {
                const result = await saveOrderRecipients(value);
                if (!result.success) {
                    toast.error(result.message || "Unable to save recipients.");
                    return;
                }
                setValue(result.recipients.join("\n"));
                toast.success(result.message);
                router.refresh();
            } catch {
                toast.error("Unable to save recipients. Please try again.");
            } finally {
                setSaving(false);
            }
        }}>
            <label htmlFor="order-recipients" className="block text-lg font-semibold text-gray-900">Order notification recipients</label>
            <p id="order-recipients-help" className="my-2 text-sm text-gray-600">New order alerts go to these emails. Enter one address per line, or separate addresses with commas. Remove an address to stop its alerts. An empty list disables admin order emails.</p>
            <textarea id="order-recipients" aria-describedby="order-recipients-help" rows={3} value={value}
                onChange={event => setValue(event.target.value)} disabled={saving} maxLength={16000}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900" />
            <button type="submit" disabled={saving} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50">
                {saving ? "Saving..." : "Save recipients"}
            </button>
        </form>
    );
}
