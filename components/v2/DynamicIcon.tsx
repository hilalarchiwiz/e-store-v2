"use client";

import React from "react";
import * as LucideIcons from "lucide-react";

interface DynamicIconProps {
  name?: string | null;
  className?: string;
  fallback?: string;
  size?: number;
}

function toPascalCase(str: string) {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase())
    .replace(/\s+/g, "");
}

export default function DynamicIcon({
  name,
  className = "",
  fallback = "Sparkles",
  size = 24,
}: DynamicIconProps) {
  const rawName = (name || fallback || "").trim();

  if (!rawName) return null;

  // 1. Image URL or file path
  if (
    rawName.startsWith("/") ||
    rawName.startsWith("http://") ||
    rawName.startsWith("https://") ||
    /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(rawName)
  ) {
    return (
      <img
        src={rawName}
        alt="icon"
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // 2. Lookup in Lucide Icons (exact match or PascalCase match or case-insensitive search)
  const pascalName = toPascalCase(rawName);
  const lucideKeys = Object.keys(LucideIcons);

  const matchedKey =
    lucideKeys.find((key) => key === rawName) ||
    lucideKeys.find((key) => key === pascalName) ||
    lucideKeys.find((key) => key.toLowerCase() === rawName.toLowerCase());

  if (matchedKey) {
    const IconComponent = (LucideIcons as any)[matchedKey];
    if (IconComponent) {
      return <IconComponent className={className} size={size} />;
    }
  }

  // 3. Fallback to Material Symbols for material icon names
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size }}
    >
      {rawName.toLowerCase()}
    </span>
  );
}
