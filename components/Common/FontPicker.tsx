"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Check, Type, Eye } from "lucide-react";
import { GOOGLE_FONTS } from "@/lib/constant";

const FontPicker = ({ defaultValue = "Inter" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFont, setSelectedFont] = useState(defaultValue);

    // 1. Dynamic Font Loader: This injects the Google Font CSS into the head 
    const fontUrl = useMemo(() => {
        return `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/\s+/g, "+")}&display=swap`;
    }, [selectedFont]);

    const filteredFonts = useMemo(() => {
        return GOOGLE_FONTS.filter((font) =>
            font.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="md:col-span-2 relative">
            {/* Dynamic Link Tag for Live Preview */}
            <link rel="stylesheet" href={fontUrl} />

            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Title Font Style
            </label>

            <div className="flex flex-col gap-4">
                {/* Custom Select Trigger */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex items-center justify-between w-full px-4 py-3 
                        border rounded-xl cursor-pointer transition-all bg-white
                        ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-gray-200 hover:border-gray-300'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Type size={18} />
                        </div>
                        <span className="font-medium text-gray-900" style={{ fontFamily: selectedFont }}>
                            {selectedFont || "Select a font..."}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* --- LIVE PREVIEW BOX --- */}
                <div className="p-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">
                        <Eye size={12} /> Live Title Preview
                    </div>
                    <h2
                        className="text-2xl font-bold text-gray-800 transition-all duration-300"
                        style={{ fontFamily: selectedFont }}
                    >
                        Your Product Title in {selectedFont}
                    </h2>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search through 100+ fonts..."
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <ul className="max-h-64 overflow-y-auto no-scrollbar py-2">
                        {filteredFonts.length > 0 ? (
                            filteredFonts.map((font) => (
                                <li
                                    key={font}
                                    onClick={() => {
                                        setSelectedFont(font);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={`
                                        flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors
                                        ${selectedFont === font ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    {/* Each option shows a tiny preview of the font name */}
                                    <span className="text-base" style={{ fontFamily: font }}>{font}</span>
                                    {selectedFont === font && <Check size={16} className="text-emerald-600" />}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-10 text-center text-sm text-gray-400 italic">
                                No matching fonts found.
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <input type="hidden" name="titleFont" value={selectedFont} />

            {isOpen && (
                <div className="fixed inset-0 z-[90] bg-transparent" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
};

export default FontPicker;