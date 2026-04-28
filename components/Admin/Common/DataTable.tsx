import React from "react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T, index: number) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
}

export default function DataTable<T extends { id: string | number }>({
    data,
    columns,
    emptyMessage = "No records found.",
}: DataTableProps<T>) {
    return (
        <div className="w-full  overflow-x-hidden">
            <table className="w-full  overflow-x-scroll">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${col.className}`}
                            >
                                <div className="flex items-center gap-1">
                                    {col.header}
                                    <span className="text-gray-400 select-none">↕</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                    {data?.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col, i) => (
                                    <td key={i} className={`px-6 py-4 text-sm text-gray-700 ${col.className}`}>
                                        {typeof col.accessor === "function"
                                            ? col.accessor(item, index)
                                            : (item[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}