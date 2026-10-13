import Link from "next/link";
import { notFound } from "next/navigation";
import SiteIcon from "@/components/v2/SiteIcon";

const RESULTS = {
  success: {
    icon: "check_circle",
    title: "Payment response received",
    description:
      "Your payment provider has returned you to Qaam.pk. Check your orders for the latest payment and delivery status.",
    tone: "text-primary bg-primary/10",
  },
  cancel: {
    icon: "cancel",
    title: "Payment cancelled",
    description:
      "The payment was cancelled and no online payment was completed. You can return to checkout and try again.",
    tone: "text-amber-600 bg-amber-500/10",
  },
  failed: {
    icon: "error",
    title: "Payment could not be confirmed",
    description:
      "We could not confirm this payment. Please retry from checkout or contact support before submitting another payment.",
    tone: "text-red-600 bg-red-500/10",
  },
} as const;

export default async function CheckoutResultPage({
  params,
}: {
  params: Promise<{ result: string }>;
}) {
  const { result } = await params;
  const content = RESULTS[result as keyof typeof RESULTS];

  if (!content) notFound();

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-outline bg-surface p-8 text-center shadow-xl sm:p-12">
        <div className={`mx-auto mb-6 flex size-20 items-center justify-center rounded-full ${content.tone}`}>
          <SiteIcon className="text-5xl">{content.icon}</SiteIcon>
        </div>
        <h1 className="text-3xl font-medium text-foreground sm:text-4xl">
          {content.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">
          {content.description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {result !== "success" && (
            <Link
              href="/checkout"
              className="rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary/90"
            >
              Return to checkout
            </Link>
          )}
          <Link
            href="/dashboard/orders"
            className="rounded-xl border border-outline px-6 py-3 font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View your orders
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-outline px-6 py-3 font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}
