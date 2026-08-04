import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSiteSettings } from "@/lib/action/settings.action";
import { hasPermission } from "@/lib/auth-utils";
import PrintInvoiceButton from "@/components/Admin/Order/PrintInvoiceButton";

export const dynamic = "force-dynamic";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const humanize = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const allowed = await hasPermission("order_view");

  if (!allowed) {
    redirect("/admin");
  }

  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        billingAddress: true,
        shippingAddress: true,
        orderItems: {
          include: {
            product: {
              select: { id: true, title: true },
            },
          },
        },
      },
    }),
    getSiteSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const customerName = `${order.billingAddress.firstName} ${order.billingAddress.lastName}`.trim();
  const sellerName = settings.contactInfo.name || "Qaam.pk";
  const sellerAddress =
    settings.contactInfo.address || settings.generalSetting.home_address_location;
  const sellerPhone =
    settings.contactInfo.phone_number || settings.generalSetting.support_number;
  const sellerEmail = settings.generalSetting.support_email;
  const invoiceDate = formatDate(order.updatedAt);
  const dueDate = formatDate(order.updatedAt);
  const amountDue = order.paymentStatus === "PAID" ? 0 : order.total;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body {
            width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: #fff !important;
          }
          main {
            width: 210mm !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-screen-only { display: none !important; }
          #printable-invoice {
            width: 210mm !important;
            height: 296mm !important;
            min-height: 296mm !important;
            max-height: 296mm !important;
            margin: 0 !important;
            padding: 11mm 13mm !important;
            overflow: hidden !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            font-size: 10px !important;
            line-height: 1.25 !important;
            break-after: avoid-page !important;
            page-break-after: avoid !important;
          }
          #payment-advice {
            margin-top: auto !important;
          }
        }
        #printable-invoice {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      <div className="invoice-screen-only mx-auto mb-5 flex max-w-[210mm] items-center justify-between gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>
        <PrintInvoiceButton />
      </div>

      <article
        id="printable-invoice"
        className="mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col bg-white p-8 text-[11px] text-slate-700 shadow-xl sm:p-[13mm]"
      >
        <header className="grid grid-cols-1 gap-6 sm:grid-cols-[1.5fr_1fr_1fr] sm:gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-[0.08em] text-slate-800">INVOICE</h1>
            <p className="mt-2 text-sm font-medium text-slate-600">{customerName}</p>
            {order.billingAddress.company && (
              <p className="mt-1 text-slate-500">{order.billingAddress.company}</p>
            )}
          </div>

          <dl className="space-y-2.5">
            <div>
              <dt className="font-semibold text-slate-700">Invoice Date</dt>
              <dd>{invoiceDate}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Invoice Number</dt>
              <dd>{order.orderNumber}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Reference</dt>
              <dd>{customerName}</dd>
            </div>
          </dl>

          <div className="leading-5">
            <p className="font-semibold text-slate-800">{sellerName}</p>
            {sellerAddress && <p>{sellerAddress}</p>}
            {sellerPhone && <p>{sellerPhone}</p>}
            {sellerEmail && <p>{sellerEmail}</p>}
          </div>
        </header>

        <section className="mt-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-500 text-left">
                <th className="pb-2 font-semibold">Description</th>
                <th className="w-24 pb-2 text-right font-semibold">Quantity</th>
                <th className="w-32 pb-2 text-right font-semibold">Unit Price</th>
                <th className="w-36 pb-2 text-right font-semibold">Amount PKR</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-200 align-top">
                  <td className="py-2.5 pr-4">
                    <p className="font-medium text-slate-800">{item.product.title}</p>
                    <p className="mt-1 text-[10px] text-slate-400">Product #{item.product.id}</p>
                  </td>
                  <td className="py-2.5 text-right">{formatCurrency(item.quantity)}</td>
                  <td className="py-2.5 text-right">{formatCurrency(item.price)}</td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto mt-2 w-full max-w-sm space-y-1.5">
            <div className="flex justify-between px-2">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between px-2">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between px-2 text-emerald-700">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-600 px-2 pt-3 text-sm font-semibold text-slate-900">
              <span>TOTAL PKR</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <p className="text-sm"><span className="font-semibold">Due Date:</span> {dueDate}</p>
          <p className="mt-1 text-[10px] text-slate-500">
            Payment: {humanize(order.paymentMethod)} · Status: {humanize(order.paymentStatus)}
          </p>
        </section>

        <section id="payment-advice" className="mt-10 break-inside-avoid border-t border-dashed border-slate-500 pt-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-2xl font-light tracking-[0.08em] text-slate-800">PAYMENT ADVICE</h2>
              <p className="mt-2 text-xs">To: {sellerName}</p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
              <dt className="font-medium">Customer</dt>
              <dd>{customerName}</dd>
              <dt className="font-medium">Invoice Number</dt>
              <dd>{order.orderNumber}</dd>
              <dt className="font-medium">Amount Due</dt>
              <dd>PKR {formatCurrency(amountDue)}</dd>
              <dt className="font-medium">Due Date</dt>
              <dd>{dueDate}</dd>
              <dt className="font-medium">Amount Enclosed</dt>
              <dd className="border-b border-slate-500">&nbsp;</dd>
            </dl>
          </div>
        </section>

        <footer className="mt-7 border-t border-slate-200 pt-3 text-center text-[9px] text-slate-400">
          {sellerName}
          {sellerAddress ? ` · ${sellerAddress}` : ""}
          {sellerPhone ? ` · ${sellerPhone}` : ""}
        </footer>
      </article>
    </main>
  );
}
