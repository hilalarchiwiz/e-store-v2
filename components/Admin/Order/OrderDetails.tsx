'use client'
import { useState } from 'react';
import { Search, Filter, Download, Eye, Edit2, Package, Truck, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { discountPrice } from '@/lib/helper';
import { updateOrderStatus, updatePaymentStatus } from '@/app/(admin)/admin/(admin)/orders/actions/order.action';
import { useRouter, useSearchParams } from 'next/navigation';
import Title from '../Typography/Title';
import Pagination from '../Pagination';
import { PAGE_SIZE } from '@/lib/constant';
import DataTable from '../Common/DataTable';
import TableControls from '../Common/TableControls';
import RecordNotFound from '../Common/RecordNotFound';
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

const OrderDetails = ({ orders, totalPages, currentPage, limit, totalCount, params }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Helper to change page via URL
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleStatusChange = async (orderId, newStatus) => {
        await updateOrderStatus(orderId, newStatus);

        if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        setShowModal(false)
    };

    const handlePaymentStatusChange = async (orderId, newStatus) => {
        await updatePaymentStatus(orderId, newStatus);
        if (selectedOrder?.id === orderId) {
            setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
        }
        setShowModal(false)

    };

    // const filteredOrders = orders.filter(order => {
    //     const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         order.billingAddress.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         `${order.billingAddress.firstName} ${order.billingAddress.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    //     const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    //     return matchesSearch && matchesStatus;
    // });

    const StatusBadge = ({ status, type = "order" }) => {
        const config = type === "order" ? OrderStatus[status] : PaymentStatus[status];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {Icon && <Icon size={14} />}
                {config.label}
            </span>
        );
    };

    const orderColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Order",
            accessor: (order: any) => {
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
            accessor: (order: any) => (
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
            accessor: (order: any) => formatDate(order.createdAt)
        },
        {
            header: "Status",
            accessor: (order: any) => (
                <StatusBadge status={order.status} type="order" />
            ),
        },
        {
            header: "Payment",
            accessor: (order: any) => (
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
            accessor: (order: any) => (
                <span className="font-bold text-gray-900">
                    Rs. {order.total}
                </span>
            ),
        },
        {
            header: "Action",
            accessor: (order: any) => (
                <button
                    onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm font-medium bg-blue-50 px-3 py-1 rounded-md transition-colors"
                >
                    <Eye size={16} />
                    View
                </button>
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
                                <DataTable data={orders} columns={orderColumns} />

                                {/* Order Details Modal */}
                                {showModal && selectedOrder && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ">
                                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
                                            <div className="p-6 border-b border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                                    <button
                                                        onClick={() => setShowModal(false)}
                                                        className="text-gray-400 hover:text-gray-600"
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
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 mb-2">Order Status</h3>
                                                        <select
                                                            value={selectedOrder.status}
                                                            onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
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
                                                            value={selectedOrder.paymentStatus}
                                                            onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            {Object.entries(PaymentStatus).map(([key, value]) => (
                                                                <option key={key} value={key}>{value.label}</option>
                                                            ))}
                                                        </select>
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
                                                                        <td className="px-4 py-3 text-sm text-gray-600">Rs. {discountPrice({ price: item.product.price, discount: item.product.discountedPrice })}</td>
                                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.quantity}</td>
                                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Rs. {item.subtotal}</td>
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
                                                        <span className="font-medium">Rs. {selectedOrder.subtotal}</span>
                                                    </div>
                                                    {selectedOrder.discount > 0 && (
                                                        <div className="flex justify-between text-green-600">
                                                            <span>Discount ({selectedOrder.couponCode}):</span>
                                                            <span className="font-medium">-Rs. {selectedOrder.discount}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Shipping:</span>
                                                        <span className="font-medium">{selectedOrder.shippingFee === 0 ? 'FREE' : selectedOrder.shippingFee}</span>
                                                    </div>
                                                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                                        <span>Total:</span>
                                                        <span>Rs. {selectedOrder.total}</span>
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
                                        </span> of <span className="font-medium">{totalCount}</span> categories
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