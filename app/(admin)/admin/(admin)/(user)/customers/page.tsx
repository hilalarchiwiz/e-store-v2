import { Pencil, Users } from "lucide-react";
import Link from "next/link";
import DeleteButton from "@/components/Admin/Buttons/DeleteButton";
import Title from "@/components/Admin/Typography/Title";
import Pagination from "@/components/Admin/Pagination";
import TableControls from "@/components/Admin/Common/TableControls";
import RecordNotFound from "@/components/Admin/Common/RecordNotFound";
import DataTable from "@/components/Admin/Common/DataTable";
import { PAGE_SIZE } from "@/lib/constant";
import { deleteUser, getCustomers } from "../actions/user.action";
import { hasPermission } from "@/lib/auth-utils";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

export async function generateMetadata() {
  return {
    title: "Customer Management - list",
  };
}

export default async function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;
  const { customers, totalPages, totalCount } = await getCustomers(params);
  const currentPage = Number(params.page) || 1;
  const limit = Number(params.limit) || PAGE_SIZE;

  const canEdit = await hasPermission("user_update");
  const canDelete = await hasPermission("user_delete");

  const customerColumns = [
    {
      header: "SN",
      accessor: (_: any, index: number) =>
        (currentPage - 1) * limit + (index + 1),
    },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    {
      header: "Role",
      accessor: () => (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium uppercase">
          Customer
        </span>
      ),
    },
    ...(canEdit || canDelete
      ? [
          {
            header: "Action",
            accessor: (customer: any) => (
              <div className="flex gap-2">
                {canDelete && (
                  <DeleteButton id={customer.id} action={deleteUser} />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <RoleGuard permission="user_view">
      {/* Page Title */}
      <Title
        title="Manage Customers"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Customers" },
        ]}
      />

      {/* Content */}
      <div className="px-4 py-6">
        <div className="mb-4 flex items-center gap-2 text-gray-600">
          <Users size={20} />
          <span className="text-sm font-medium">
            Viewing all registered store customers
          </span>
        </div>

        {/* White Table Container */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm">
          <TableControls />

          {/* Table */}
          {!customers || customers.length === 0 ? (
            <RecordNotFound />
          ) : (
            <>
              <DataTable data={customers} columns={customerColumns} />

              <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">
                    {(Number(params.page || 1) - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {totalCount
                      ? Math.min(Number(params.page || 1) * limit, totalCount)
                      : 0}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> Customers
                </p>
                <Pagination totalPages={totalPages} />
              </div>
            </>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
