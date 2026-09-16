"use client";


import SiteIcon from '@/components/v2/SiteIcon';
import React from "react";

interface DynamicIconProps {
  name?: string | null;
  className?: string;
  fallback?: string;
  size?: number;
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

  return (
    <SiteIcon
      name={rawName}
      className={className}
      style={{ fontSize: size }}
    />
  );
}
