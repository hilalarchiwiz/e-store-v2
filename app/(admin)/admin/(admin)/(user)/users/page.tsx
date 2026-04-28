import { Pencil } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import Title from '@/components/Admin/Typography/Title';
import Pagination from '@/components/Admin/Pagination';
import TableControls from '@/components/Admin/Common/TableControls';
import AddButton from '@/components/Admin/Buttons/AddButton';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import DataTable from '@/components/Admin/Common/DataTable';
import { PAGE_SIZE } from '@/lib/constant';
import { deleteUser, getUsers } from '../actions/user.action';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Brand Management - list',
    };
}

export default async function UserPage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        page?: string;
        limit?: string
    }>;
}) {
    const params = await searchParams;
    const { users, totalPages, totalCount } = await getUsers(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    const canEdit = await hasPermission('user_update');
    const canDelete = await hasPermission('user_delete');
    const canCreate = await hasPermission('user_create');

    const userColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        { header: "Name", accessor: "name" },
        { header: "Email", accessor: "email" },
        { header: "Role", accessor: "roleName" },
        ...((canEdit || canDelete) ? [
            (
                {
                    header: "Action",
                    accessor: (user: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/users/edit/${user.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {
                                canDelete && <DeleteButton id={user.id} action={deleteUser} />
                            }
                        </div>
                    ),
                }
            )
        ] : [])
    ];
    return (
        <RoleGuard permission='user_view'>
            {/* Page Title */}
            <Title
                title="Manage your User"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'User' }
                ]}
            />

            {/* Content */}
            <div className="px-4 py-6">
                {canCreate && <AddButton title='Add User' url='/admin/users/add' />}
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {users?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={users} columns={userColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Users
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