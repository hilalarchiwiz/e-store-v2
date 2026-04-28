// components/Admin/Common/CouponDiscountType.tsx
"use client";

import React, { useState } from "react";
import { Percent, Banknote } from "lucide-react";

export default function CouponDiscountType({
    initialType = "PERCENTAGE",
    initialValue = ""
}: {
    initialType?: string,
    initialValue?: any
}) {
    // Initialize state with the passed initialType
    const [discountType, setDiscountType] = useState(initialType);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            {/* Type Selector */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type</label>
                <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                        <input
                            type="radio"
                            name="discountType"
                            value="PERCENTAGE"
                            className="hidden peer"
                            checked={discountType === "PERCENTAGE"}
                            onChange={(e) => setDiscountType(e.target.value)}
                        />
                        <div className="text-center p-3 bg-white border rounded-lg peer-checked:border-emerald-500 peer-checked:text-emerald-600 peer-checked:bg-emerald-50 transition-all font-medium">
                            Percentage (%)
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input
                            type="radio"
                            name="discountType"
                            value="FIXED_AMOUNT"
                            className="hidden peer"
                            checked={discountType === "FIXED_AMOUNT"}
                            onChange={(e) => setDiscountType(e.target.value)}
                        />
                        <div className="text-center p-3 bg-white border rounded-lg peer-checked:border-emerald-500 peer-checked:text-emerald-600 peer-checked:bg-emerald-50 transition-all font-medium">
                            Flat Amount (Rs)
                        </div>
                    </label>
                </div>
            </div>

            {/* Dynamic Input */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {discountType === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount"}
                </label>
                <div className="relative">
                    <div className="absolute left-3 top-4 text-gray-400">
                        {discountType === "PERCENTAGE" ? (
                            <Percent className="w-5 h-5" />
                        ) : (
                            <Banknote className="w-5 h-5" />
                        )}
                    </div>

                    <input
                        type="number"
                        name="discountValue"
                        defaultValue={initialValue} // Use defaultValue for uncontrolled input in forms
                        placeholder={discountType === "PERCENTAGE" ? "e.g. 20%" : "e.g. 500 Rs"}
                        className="w-full pl-10 pr-4 py-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 transition-colors"
                        min="0"
                        max={discountType === "PERCENTAGE" ? "100" : undefined}
                    />
                </div>
            </div>
        </div>
    );
}