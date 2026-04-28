'use client'
import { useState, useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { LUCIDE_ICON_NAMES } from '@/lib/constant';

const IconPicker = ({ defaultValue }: { defaultValue?: string }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState(defaultValue || "");

    useEffect(() => {
        if (defaultValue) setSelected(defaultValue);
    }, [defaultValue]);

    const filteredIcons = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return LUCIDE_ICON_NAMES.filter(name =>
            name.toLowerCase().includes(query)
        ).slice(0, 50);
    }, [searchTerm]);

    return (
        <div className="p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            {/* Hidden field for Form Submission */}
            <input type="hidden" name="icon" value={selected} />

            <div className="relative mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    placeholder="Search icons (e.g. Laptop, Cloud)..."
                    className="w-full p-2.5 pl-10 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Icons.Search className="absolute left-3 top-3 w-4 h-4 text-emerald-500/70" />
            </div>

            <div className="grid grid-cols-5 gap-3 max-h-60 overflow-y-auto p-2 no-scrollbar bg-white/50 dark:bg-slate-950/50 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                {filteredIcons.length > 0 ? (
                    filteredIcons.map((name) => {
                        const IconComponent = (Icons as any)[name];

                        if (!IconComponent) return null;

                        const isSelected = selected === name;

                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setSelected(name)}
                                title={name}
                                className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${isSelected
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none scale-105'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600'
                                    }`}
                            >
                                <IconComponent size={22} strokeWidth={isSelected ? 2.5 : 2} />
                            </button>
                        );
                    })
                ) : (
                    <div className="col-span-5 py-8 text-center text-sm text-emerald-600/60 italic">
                        No icons found matching "{searchTerm}"
                    </div>
                )}
            </div>

            {selected && (
                <div className="mt-4 flex items-center justify-between px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                            {(() => {
                                const SelectedIcon = (Icons as any)[selected];
                                return SelectedIcon ? <SelectedIcon size={16} /> : null;
                            })()}
                        </div>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            {selected}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelected("")}
                        className="text-xs font-semibold text-emerald-600 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 shadow-sm"
                    >
                        Change
                    </button>
                </div>
            )}
        </div>
    );
};

export default IconPicker;