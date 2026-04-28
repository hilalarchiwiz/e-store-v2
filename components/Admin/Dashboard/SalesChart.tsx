'use client';
import { getCategoryDistribution } from "@/app/(admin)/admin/actions/dashboard";
import { useEffect, useState } from "react";

export default function SalesChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const result = await getCategoryDistribution();
            if (result.success) {
                setData(result.data);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                <div className="h-64 bg-gray-200 rounded" />
            </div>
        );
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Products by Category</h2>

            <div className="space-y-4">
                {data.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No category data available</p>
                ) : (
                    data.slice(0, 8).map((item) => (
                        <div key={item.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{item.name}</span>
                                <span className="text-gray-500">{item.count} products</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}