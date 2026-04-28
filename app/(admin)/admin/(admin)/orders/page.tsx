import OrderDetails from "@/components/Admin/Order/OrderDetails";
import { getOrders } from "./actions/order.action";
import { PAGE_SIZE } from "@/lib/constant";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

export default async function OrdersPage({ searchParams }: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { orders, totalPages, totalCount } = await getOrders(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    return (
        <RoleGuard permission="order_view">
            <OrderDetails
                orders={orders}
                totalPages={totalPages}
                currentPage={currentPage}
                limit={limit}
                totalCount={totalCount}
                params={params}
            />
        </RoleGuard>
    );
}