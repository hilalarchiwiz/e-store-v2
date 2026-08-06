"use client";

import { useState, useRef, TouchEvent } from "react";
import { toast, Toast, ToastIcon } from "react-hot-toast";

export default function SwipeableToast({ t }: { t: Toast }) {
  const [offset, setOffset] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - touchStart.current.x;
    const deltaY = e.touches[0].clientY - touchStart.current.y;

    setOffset(deltaX);
    if (deltaY < 0) {
      setOffsetY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (Math.abs(offset) > 40 || offsetY < -30) {
      toast.dismiss(t.id);
    } else {
      setOffset(0);
      setOffsetY(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => toast.dismiss(t.id)}
      style={{
        transform: `translate3d(${offset}px, ${offsetY}px, 0)`,
        opacity: t.visible ? Math.max(0, 1 - Math.abs(offset) / 120) : 0,
        transition: isSwiping
          ? "none"
          : "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out",
      }}
      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1a251d] text-[#121714] dark:text-white rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 select-none cursor-pointer touch-pan-x"
    >
      <ToastIcon toast={t} />
      <span className="text-sm font-bold flex-1">
        {typeof t.message === "function" ? t.message(t) : t.message}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toast.dismiss(t.id);
        }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full transition-colors"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}
