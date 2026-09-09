interface ProductSpecificationsProps {
  specifications: Record<string, unknown> | null | undefined;
}

export function formatSpecificationLabel(label: string): string {
  return label
    .replace(/[_-]+/g, " ")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/:\s*$/, "")
    .trim();
}

export default function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  const entries = Object.entries(specifications ?? {});

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-[#f1f4f2] px-6 py-12 text-gray-500 dark:border-white/10 dark:bg-[#262626] dark:text-gray-400">
        <span aria-hidden="true" className="material-symbols-outlined text-4xl">inventory_2</span>
        <p className="text-sm font-medium">No specifications available.</p>
      </div>
    );
  }

  return (
    <section aria-label="Product specifications" className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#171717]">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-white/10">
        <span aria-hidden="true" className="material-symbols-outlined flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">tune</span>
        <div>
          <h3 className="text-base font-bold text-[#121714] dark:text-white">Technical specifications</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Product features and details</p>
        </div>
      </div>
      <dl className="grid grid-cols-1 lg:grid-cols-2">
        {entries.map(([key, value], index) => (
          <div
            key={key}
            className={`grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-4 border-gray-200 px-4 py-4 sm:gap-6 sm:px-6 dark:border-white/10 ${index > 0 ? "border-t" : ""} ${index === 1 ? "lg:border-t-0" : ""} ${index % 2 === 1 ? "lg:border-l" : ""} ${Math.floor(index / 2) % 2 === 0 ? "lg:bg-[#f1f4f2]/60 dark:lg:bg-white/[0.025]" : ""}`}
          >
            <dt className="text-sm font-medium leading-6 text-gray-500 [overflow-wrap:anywhere] dark:text-gray-400">
              {formatSpecificationLabel(key)}
            </dt>
            <dd className="min-w-0 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#121714] [overflow-wrap:anywhere] dark:text-white">
              {String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
