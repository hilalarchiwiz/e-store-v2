import { hasPermission } from "@/lib/auth-utils";
import { getOrderRecipients } from "@/lib/order-notifications";
import OrderNotificationRecipients from "@/components/Admin/Order/OrderNotificationRecipients";
import OrderDetails from "@/components/Admin/Order/OrderDetails";
import { getOrders } from "./actions/order.action";
import { PAGE_SIZE } from "@/lib/constant";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

export default async function OrdersPage({ searchParams }: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { orders, totalPages, totalCount } = await getOrders(params);
    const canManageRecipients = await hasPermission("settings_update");
    const recipients = canManageRecipients ? await getOrderRecipients() : [];
    const canDelete = await hasPermission("order_delete");
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    return (
        <RoleGuard permission="order_view">
            {canManageRecipients && <OrderNotificationRecipients initialRecipients={recipients} />}
            <OrderDetails
                canDelete={canDelete}
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