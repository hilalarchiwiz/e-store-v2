'use client'
import { useState } from 'react';
import { Eye, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle, Printer, Save, Loader2 } from 'lucide-react';
import { saveInvoice } from '@/app/(admin)/admin/(admin)/orders/actions/order.action';
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

const OrderDetails = ({ orders, totalPages, currentPage, limit, totalCount, params }: OrderDetailsProps) => {
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [draftStatus, setDraftStatus] = useState("");
    const [draftPaymentStatus, setDraftPaymentStatus] = useState("");
    const [draftDiscount, setDraftDiscount] = useState("0");
    const [isSaving, setIsSaving] = useState(false);
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
        setDraftDiscount(String(order.discount || 0));
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    const amountBeforeDiscount = selectedOrder
        ? Number(selectedOrder.subtotal) + Number(selectedOrder.shippingFee)
        : 0;
    const parsedDiscount = Number(draftDiscount);
    const draftDiscountAmount = Number.isFinite(parsedDiscount) && parsedDiscount >= 0
        ? parsedDiscount
        : 0;
    const draftTotal = Math.max(0, amountBeforeDiscount - draftDiscountAmount);
    const hasUnsavedChanges = selectedOrder !== null && (
        draftStatus !== selectedOrder.status
        || draftPaymentStatus !== selectedOrder.paymentStatus
        || draftDiscountAmount !== Number(selectedOrder.discount)
    );

    const handleSaveInvoice = async () => {
        if (!selectedOrder) return;

        if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
            toast.error("Enter a valid discount amount.");
            return;
        }

        if (parsedDiscount > amountBeforeDiscount) {
            toast.error("Discount cannot be greater than the invoice amount.");
            return;
        }

        setIsSaving(true);

        try {
            const result = await saveInvoice({
                orderId: selectedOrder.id,
                status: draftStatus,
                paymentStatus: draftPaymentStatus,
                discount: parsedDiscount,
            });

            if (!result?.success || !result.invoice) {
                toast.error(result?.message || "Unable to save the invoice.");
                return;
            }

            setSelectedOrder({ ...selectedOrder, ...result.invoice });
            setDraftDiscount(String(result.invoice.discount));
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
                                                            type="number"
                                                            min="0"
                                                            max={amountBeforeDiscount}
                                                            step="0.01"
                                                            value={draftDiscount}
                                                            onChange={(e) => setDraftDiscount(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                        />
                                                        <p className="mt-1 text-xs text-gray-500">Saved only when you click Save Invoice.</p>
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
                                                            <span>Discount{selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : ''}:</span>
                                                            <span className="font-medium">-Rs. {formatCurrency(draftDiscountAmount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Shipping:</span>
                                                        <span className="font-medium">{selectedOrder.shippingFee === 0 ? 'FREE' : `Rs. ${formatCurrency(selectedOrder.shippingFee)}`}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                                        <span>Total:</span>
                                                        <span>Rs. {formatCurrency(draftTotal)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-200 pt-5">
                                                    <p className={`text-sm ${hasUnsavedChanges ? 'text-amber-600' : 'text-gray-500'}`}>
                                                        {hasUnsavedChanges
                                                            ? 'You have unsaved invoice changes.'
                                                            : 'Invoice values are saved and ready to print.'}
                                                    </p>
                                                    <div className="flex items-center gap-3">
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
