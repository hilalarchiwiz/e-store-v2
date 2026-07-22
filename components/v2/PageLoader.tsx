import { Laptop } from "lucide-react";

interface PageLoaderProps {
  progress?: number;
  message?: string;
}

export default function PageLoader({
  progress,
  message = "Preparing products and the latest updates for you.",
}: PageLoaderProps) {
  const hasProgress = typeof progress === "number";
  const safeProgress = hasProgress ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <div
      className="fixed inset-0 z-[100000] flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 text-[#121714] dark:bg-[#101713] dark:text-white"
      role="status"
      aria-live="polite"
      aria-label="Page is loading"
    >
      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/20" />
      <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-teal-200/25 blur-3xl dark:bg-teal-900/20" />

      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-7 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100 border-t-primary motion-safe:animate-spin dark:border-emerald-950 dark:border-t-primary" />
          <div className="absolute inset-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/70" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-emerald-600/25">
            <Laptop className="h-8 w-8" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <span className="absolute right-0 top-2 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-white motion-safe:animate-pulse dark:ring-[#101713]" />
        </div>

        <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-primary">
          Qaam.pk
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
          Loading your experience
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
          {message}
        </p>

        <div className="mt-7 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
          {hasProgress ? (
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-teal-400 transition-[width] duration-300 ease-out"
              style={{ width: `${safeProgress}%` }}
            />
          ) : (
            <div className="qaam-indeterminate-loader h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 via-primary to-teal-400" />
          )}
        </div>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes qaam-loader-slide {
          0% { transform: translateX(-130%); }
          50% { transform: translateX(130%); }
          100% { transform: translateX(300%); }
        }
        .qaam-indeterminate-loader {
          animation: qaam-loader-slide 1.35s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .qaam-indeterminate-loader { animation: none; width: 100%; opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}
