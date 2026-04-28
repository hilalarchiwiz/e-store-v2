"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isNavigatingRef = useRef(false);

  const startProgress = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setVisible(true);
    setWidth(15);

    let w = 15;
    intervalRef.current = setInterval(() => {
      // Slow down as it approaches 85%
      const increment = Math.random() * 8 * (1 - w / 85);
      w = Math.min(w + increment, 85);
      setWidth(w);
    }, 300);
  };

  const completeProgress = () => {
    if (!isNavigatingRef.current) return;
    isNavigatingRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setWidth(100);
    setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 350);
  };

  // Intercept all internal link clicks to start the bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // If the click originates from a button or interactive element, skip —
      // it might just open a modal or trigger an action inside a <Link> card.
      const interactive = (e.target as HTMLElement).closest(
        "button, input, textarea, select, [role='button'], [data-no-progress]"
      );
      if (interactive) return;

      const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("javascript") || anchor.target === "_blank") return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Skip if same page (hash change only)
        if (url.pathname === pathname && url.search === window.location.search) return;
      } catch {
        return;
      }

      startProgress();
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Complete bar when route finishes loading
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-primary"
      style={{
        width: `${width}%`,
        transition: width === 100 ? "width 200ms ease-out" : "width 300ms ease-in-out",
        boxShadow: "0 0 8px var(--color-primary)",
      }}
    />
  );
}

// Suspense boundary required because useSearchParams() suspends
export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
