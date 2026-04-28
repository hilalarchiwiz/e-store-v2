"use client";

import React, { useRef } from "react";

const FormColorPicker = ({ label, name, defaultValue }: { label: string, name: string, defaultValue?: string }) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (textInputRef.current) {
            textInputRef.current.value = e.target.value.toUpperCase();
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="flex items-center gap-2">
                {/* Text Input for Typing/Pasting Hex */}
                <input
                    ref={textInputRef}
                    type="text"
                    name={name}
                    defaultValue={defaultValue || "#FFFFFF"}
                    placeholder="#000000"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onChange={(e) => {
                        if (colorInputRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                            colorInputRef.current.value = e.target.value;
                        }
                    }}
                />

                {/* Visual Picker Button */}
                <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-md border border-gray-300">
                    <input
                        ref={colorInputRef}
                        type="color"
                        defaultValue={defaultValue || "#FFFFFF"}
                        className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                        onChange={handleColorChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default FormColorPicker;