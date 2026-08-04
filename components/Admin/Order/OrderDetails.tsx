'use client'
import { useState } from 'react';
import { Eye, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, Printer, Save, Loader2, Banknote } from 'lucide-react';
import { recordOrderPayment, saveInvoice } from '@/app/(admin)/admin/(admin)/orders/actions/order.action';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Title from '../Typography/Title';
import Pagination from '../Pagination';
import { PAGE_SIZE } from '@/lib/constant';
import DataTable from '../Common/DataTable';
import TableControls from '../Common/TableControls';
import RecordNotFound from '../Common/RecordNotFound';
import type { Prisma } from '@prisma/client';

type AdminOrder = Prisma.OrderGetPayload<{
    include: {
        orderItems: { include: { product: true } };
        user: true;
        billingAddress: true;
        shippingAddress: true;
    };
}>;

interface OrderDetailsProps {
    orders?: AdminOrder[];
    totalPages?: number;
    currentPage: number;
    limit: number;
    totalCount?: number;
    params: { search?: string; page?: string; limit?: string };
}
const OrderStatus = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Package },
    CONFIRMED: { label: "Confirmed", color: "bg-indigo-100 text-indigo-800", icon: CheckCircle },
    SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800", icon: Truck },
    DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
    RETURNED: { label: "Returned", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
};

const PaymentStatus = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    PAID: { label: "Paid", color: "bg-green-100 text-green-800" },
    FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
    REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-800" }
};

const parseDiscountInput = (value: string, amountBeforeDiscount: number) => {
    const rawValue = value.trim();

    if (!rawValue) {
        return { amount: 0, normalized: "0", isPercentage: false };
    }

    const isPercentage = rawValue.endsWith("%");
    const numericText = (isPercentage ? rawValue.slice(0, -1) : rawValue)
        .replace(/,/g, "")
        .trim();
    const numericValue = Number(numericText);

    if (!Number.isFinite(numericValue) || numericValue < 0) return null;
    if (isPercentage && numericValue > 100) return null;

    const amount = isPercentage
        ? (amountBeforeDiscount * numericValue) / 100
        : numericValue;

    if (amount > amountBeforeDiscount) return null;

    return {
        amount: Math.round(amount * 100) / 100,
        normalized: isPercentage ? `${numericValue}%` : String(numericValue),
        isPercentage,
    };
};

const OrderDetails = ({ orders, totalPages, currentPage, limit, totalCount, params }: OrderDetailsProps) => {
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [draftStatus, setDraftStatus] = useState("");
    const [draftPaymentStatus, setDraftPaymentStatus] = useState("");
    const [draftDiscount, setDraftDiscount] = useState("0");
    const [isSaving, setIsSaving] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const router = useRouter();

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return Number(amount || 0).toLocaleString('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const openOrder = (order: AdminOrder) => {
        setSelectedOrder(order);
        setDraftStatus(order.status);
        setDraftPaymentStatus(order.paymentStatus);
        setDraftDiscount(order.discountInput || String(order.discount || 0));
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowPaymentModal(false);
        setSelectedOrder(null);
    };

    const discountBase = selectedOrder ? Number(selectedOrder.subtotal) : 0;
    const amountBeforeDiscount = selectedOrder
        ? discountBase + Number(selectedOrder.shippingFee)
        : 0;
    const parsedDiscount = parseDiscountInput(draftDiscount, discountBase);
    const draftDiscountAmount = parsedDiscount?.amount ?? 0;
    const draftTotal = Math.max(0, amountBeforeDiscount - draftDiscountAmount);
    const amountPaid = Number(selectedOrder?.amountPaid || 0);
    const draftAmountDue = Math.max(0, draftTotal - amountPaid);
    const savedAmountDue = selectedOrder
        ? Math.max(0, Number(selectedOrder.total) - amountPaid)
        : 0;
    const savedDiscountInput = selectedOrder?.discountInput || String(selectedOrder?.discount || 0);
    const hasUnsavedChanges = selectedOrder !== null && (
        draftStatus !== selectedOrder.status
        || draftPaymentStatus !== selectedOrder.paymentStatus
        || parsedDiscount?.normalized !== savedDiscountInput
    );

    const handleSaveInvoice = async () => {
        if (!selectedOrder) return;

        if (!parsedDiscount) {
            toast.error("Enter a valid discount such as 5000 or 5%.");
            return;
        }

        setIsSaving(true);

        try {
            const result = await saveInvoice({
                orderId: selectedOrder.id,
                status: draftStatus,
                paymentStatus: draftPaymentStatus,
                discountInput: parsedDiscount.normalized,
            });

            if (!result?.success || !result.invoice) {
                toast.error(result?.message || "Unable to save the invoice.");
                return;
            }

            setSelectedOrder({ ...selectedOrder, ...result.invoice });
            setDraftPaymentStatus(result.invoice.paymentStatus);
            setDraftDiscount(result.invoice.discountInput || String(result.invoice.discount));
            toast.success(result.message || "Invoice saved successfully.");
            router.refresh();
        } catch {
            toast.error("Unable to save the invoice. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrintInvoice = () => {
        if (!selectedOrder) return;

        if (hasUnsavedChanges) {
            toast.error("Save the invoice before printing your changes.");
            return;
        }

        window.open(`/admin/orders/${selectedOrder.id}/invoice`, '_blank', 'noopener,noreferrer');
    };

    const openPaymentModal = () => {
        if (!selectedOrder) return;

        if (hasUnsavedChanges) {
            toast.error("Save the invoice before recording a payment.");
            return;
        }

        if (savedAmountDue <= 0) {
            toast.success("This invoice is already fully paid.");
            return;
        }

        setPaymentAmount("");
        setShowPaymentModal(true);
    };

    const handleRecordPayment = async (fullAmount?: number) => {
        if (!selectedOrder) return;

        const amount = fullAmount ?? Number(paymentAmount.replace(/,/g, ""));

        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error("Enter a valid payment amount.");
            return;
        }

        if (amount > savedAmountDue) {
            toast.error("Payment cannot be greater than the amount due.");
            return;
        }

        setIsSavingPayment(true);

        try {
            const result = await recordOrderPayment({
                orderId: selectedOrder.id,
                amount,
            });

            if (!result?.success || !result.payment) {
                toast.error(result?.message || "Unable to record the payment.");
                return;
            }

            setSelectedOrder({ ...selectedOrder, ...result.payment });
            setDraftPaymentStatus(result.payment.paymentStatus);
            setShowPaymentModal(false);
            setPaymentAmount("");
            toast.success(result.message || "Payment recorded successfully.");
            router.refresh();
        } catch {
            toast.error("Unable to record the payment. Please try again.");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const StatusBadge = ({ status, type = "order" }: { status: string; type?: "order" | "payment" }) => {
        if (type === "order") {
            const config = OrderStatus[status as keyof typeof OrderStatus];
            const Icon = config.icon;

            return (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <Icon size={14} />
                    {config.label}
                </span>
            );
        }

        const config = PaymentStatus[status as keyof typeof PaymentStatus];

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const orderColumns = [
        {
            header: "SN",
            accessor: (_order: AdminOrder, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Order",
            accessor: (order: AdminOrder) => {
                return (
                    <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{order.orderItems?.length || 0} items</div>
                    </div>
                )
            }
        },
        {
            header: "Customer",
            accessor: (order: AdminOrder) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{order.billingAddress.email}</div>
                </div>
            ),
        },
        {
            header: "Date",
            accessor: (order: AdminOrder) => formatDate(order.createdAt)
        },
        {
            header: "Status",
            accessor: (order: AdminOrder) => (
                <StatusBadge status={order.status} type="order" />
            ),
        },
        {
            header: "Payment",
            accessor: (order: AdminOrder) => (
                <div>
                    <StatusBadge status={order.paymentStatus} type="payment" />
                    <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
                        {order.paymentMethod?.replace(/_/g, ' ')}
                    </div>
                </div>
            ),
        },
        {
            header: "Total",
            accessor: (order: AdminOrder) => (
                <span className="font-bold text-gray-900">
                    Rs. {formatCurrency(order.total)}
                </span>
            ),
        },
        {
            header: "Action",
            accessor: (order: AdminOrder) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openOrder(order)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                        <Eye size={16} />
                        View
                    </button>
                    <Link
                        href={`/admin/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-sm font-medium bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                        <Printer size={16} />
                        Print
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="">
            <div className="">
                <Title
                    title='Order management'
                    breadcrumbs={
                        [
                            {
                                label: 'Dashboard', href: '/admin'
                            },
                            {
                                label: 'Order'
                            },
                        ]
                    }
                />
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6 px-4">
                    {Object.entries(OrderStatus).map(([key, value]) => {
                        const count = orders?.filter(o => o.status === key).length;
                        const Icon = value.icon;
                        return (
                            <div key={key} className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{value.label}</p>
                                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                                    </div>
                                    <Icon className="text-gray-400" size={32} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="px-4 py-2">
                    {/* White Table Container */}
                    <div className="bg-white rounded-lg overflow-hidden">
                        <TableControls />
                        {orders?.length === 0 ? (
                            <RecordNotFound />
                        ) : (
                            <>
                                {/* Orders Table */}
                                <DataTable data={orders || []} columns={orderColumns} />

                                {/* Order Details Modal */}
                                {showModal && selectedOrder && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ">
                                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
                                            <div className="p-6 border-b border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                                    <button
                                                        onClick={closeModal}
                                                        className="text-gray-400 hover:text-gray-600"
                                                        aria-label="Close order details"
                                                    >
                                                        <XCircle size={24} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-6">
                                                {/* Order Info */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
                                                        <p className="text-gray-600">{selectedOrder.orderNumber}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Date</h3>
                                                        <p className="text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                                                    </div>
                                                </div>

                                                {/* Status Management */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Order Status</h3>
                                                        <select
                                                            value={draftStatus}
                                                            onChange={(e) => setDraftStatus(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            {Object.entries(OrderStatus).map(([key, value]) => (
                                                                <option key={key} value={key}>{value.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Payment Status</h3>
                                                        <select
                                                            value={draftPaymentStatus}
                                                            onChange={(e) => setDraftPaymentStatus(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            {Object.entries(PaymentStatus).map(([key, value]) => (
                                                                <option key={key} value={key}>{value.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Invoice Discount (PKR)</h3>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={draftDiscount}
                                                            onChange={(e) => setDraftDiscount(e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${parsedDiscount ? 'border-gray-300' : 'border-red-400'}`}
                                                            placeholder="5000 or 5%"
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Enter 5000 for PKR 5,000 or 5% for five percent. Saved with Save Invoice.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Customer Info */}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                        <p><span className="font-medium">Name:</span> {selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}</p>
                                                        <p><span className="font-medium">Email:</span> {selectedOrder.billingAddress.email}</p>
                                                        <p><span className="font-medium">Phone:</span> {selectedOrder.billingAddress.phone}</p>
                                                        <p><span className="font-medium">Address:</span> {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.country}</p>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#Product ID</th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {selectedOrder.orderItems.map((item) => (
                                                                    <tr key={item.id}>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.product.id}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.product.title}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-600">Rs. {formatCurrency(item.price)}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Rs. {formatCurrency(item.subtotal)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Order Summary */}
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Subtotal:</span>
                                                        <span className="font-medium">Rs. {formatCurrency(selectedOrder.subtotal)}</span>
                                                    </div>
                                                    {draftDiscountAmount > 0 && (
                                                        <div className="flex justify-between text-green-600">
                                                            <span>
                                                                Discount{parsedDiscount?.isPercentage ? ` (${parsedDiscount.normalized})` : selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : ''}:
                                                            </span>
                                                            <span className="font-medium">-Rs. {formatCurrency(draftDiscountAmount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Shipping:</span>
                                                        <span className="font-medium">{selectedOrder.shippingFee === 0 ? 'FREE' : `Rs. ${formatCurrency(selectedOrder.shippingFee)}`}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                                        <span>Invoice Total:</span>
                                                        <span>Rs. {formatCurrency(draftTotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-blue-700">
                                                        <span>Amount Paid:</span>
                                                        <span className="font-semibold">Rs. {formatCurrency(amountPaid)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold text-rose-700">
                                                        <span>Amount Due:</span>
                                                        <span>Rs. {formatCurrency(draftAmountDue)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-200 pt-5">
                                                    <p className={`text-sm ${hasUnsavedChanges ? 'text-amber-600' : 'text-gray-500'}`}>
                                                        {hasUnsavedChanges
                                                            ? 'You have unsaved invoice changes.'
                                                            : 'Invoice values are saved and ready to print.'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={openPaymentModal}
                                                            disabled={isSaving || savedAmountDue <= 0}
                                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-200 bg-blue-50 rounded-lg font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                                                        >
                                                            <Banknote size={18} />
                                                            Record Payment
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handlePrintInvoice}
                                                            disabled={isSaving}
                                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            <Printer size={18} />
                                                            Print Invoice
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveInvoice}
                                                            disabled={isSaving}
                                                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                            {isSaving ? 'Saving...' : 'Save Invoice'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showPaymentModal && selectedOrder && (
                                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
                                        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
                                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
                                                    <p className="mt-1 text-sm text-gray-500">Invoice {selectedOrder.orderNumber}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPaymentModal(false)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    aria-label="Close payment modal"
                                                >
                                                    <XCircle size={22} />
                                                </button>
                                            </div>

                                            <div className="space-y-5 p-6">
                                                <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Invoice Total</span>
                                                        <span className="font-semibold">Rs. {formatCurrency(selectedOrder.total)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Already Paid</span>
                                                        <span className="font-semibold text-blue-700">Rs. {formatCurrency(amountPaid)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold text-rose-700">
                                                        <span>Amount Due</span>
                                                        <span>Rs. {formatCurrency(savedAmountDue)}</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="payment-amount" className="mb-2 block text-sm font-semibold text-gray-900">
                                                        Payment Amount (PKR)
                                                    </label>
                                                    <input
                                                        id="payment-amount"
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={paymentAmount}
                                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                                        placeholder="e.g. 30000"
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        This payment reduces the Amount Due, not the invoice subtotal.
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRecordPayment()}
                                                        disabled={isSavingPayment}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        {isSavingPayment ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                        Save Payment
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRecordPayment(savedAmountDue)}
                                                        disabled={isSavingPayment || savedAmountDue <= 0}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        {isSavingPayment ? <Loader2 size={18} className="animate-spin" /> : <Banknote size={18} />}
                                                        Pay Full Due
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <p className="text-sm text-gray-500">
                                        Showing <span className="font-medium">{(Number(params.page || 1) - 1) * PAGE_SIZE + 1}</span> to <span className="font-medium">
                                            {
                                                totalCount ? Math.min(Number(params.page || 1) * PAGE_SIZE, totalCount) : 0
                                            }
                                        </span> of <span className="font-medium">{totalCount}</span> orders
                                    </p>
                                    <Pagination totalPages={totalPages || 0} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
