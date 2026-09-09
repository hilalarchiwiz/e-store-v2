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
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline bg-surface px-6 py-12 text-muted dark:border-white/10 dark:bg-surface dark:text-muted">
        <span aria-hidden="true" className="material-symbols-outlined text-4xl">inventory_2</span>
        <p className="text-sm font-medium">No specifications available.</p>
      </div>
    );
  }

  return (
    <section aria-label="Product specifications" className="overflow-hidden rounded-2xl border border-outline bg-surface dark:border-white/10 dark:bg-surface">
      <div className="flex items-center gap-3 border-b border-outline px-4 py-4 sm:px-6 dark:border-white/10">
        <span aria-hidden="true" className="material-symbols-outlined flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">tune</span>
        <div>
          <h3 className="text-base font-bold text-foreground dark:text-foreground">Technical specifications</h3>
          <p className="mt-0.5 text-xs text-muted dark:text-muted">Product features and details</p>
        </div>
      </div>
      <dl className="grid grid-cols-1 lg:grid-cols-2">
        {entries.map(([key, value], index) => (
          <div
            key={key}
            className={`grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-4 border-outline px-4 py-4 sm:gap-6 sm:px-6 dark:border-white/10 ${index > 0 ? "border-t" : ""} ${index === 1 ? "lg:border-t-0" : ""} ${index % 2 === 1 ? "lg:border-l" : ""} ${Math.floor(index / 2) % 2 === 0 ? "lg:bg-surface/60 dark:lg:bg-white/[0.025]" : ""}`}
          >
            <dt className="text-sm font-medium leading-6 text-muted [overflow-wrap:anywhere] dark:text-muted">
              {formatSpecificationLabel(key)}
            </dt>
            <dd className="min-w-0 whitespace-pre-wrap text-sm font-semibold leading-6 text-foreground [overflow-wrap:anywhere] dark:text-foreground">
              {String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
