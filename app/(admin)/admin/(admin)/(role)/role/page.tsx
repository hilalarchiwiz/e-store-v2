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
import { deleteRole, getRoles } from '../actions/role.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { hasPermission } from '@/lib/auth-utils';

export async function generateMetadata() {
    return {
        title: 'Brand Management - list',
    };
}

export default async function RolePage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        page?: string;
        limit?: string
    }>;
}) {
    const params = await searchParams;
    const { roles, totalPages, totalCount } = await getRoles(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const canEdit = await hasPermission('role_update');
    const canDelete = await hasPermission('role_delete');
    const canCreate = await hasPermission('role_create');
    const roleColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        { header: "Name", accessor: "name" },
        {
            header: 'Modules',
            accessor: (role: any) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {role.modules?.map((mod: string) => (
                        <span key={mod} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-md border border-blue-100 font-medium capitalize">
                            {mod}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: 'Permissions',
            accessor: (role: any) => (
                <div className="flex flex-wrap gap-1 max-w-[300px]">
                    {role.permissions?.map((perm: string) => (
                        <span key={perm} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-md border border-gray-200 font-medium">
                            {perm.replace('_', ' ')}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: "Status",
            accessor: () => (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Active
                </span>
            ),
        },
        ...((canEdit || canDelete) ? [
            (
                {
                    header: "Action",
                    accessor: (role: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/role/edit/${role.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {
                                canDelete && <DeleteButton id={role.id} action={deleteRole} />
                            }
                        </div>
                    ),
                }
            )
        ] : [])
    ];
    return (
        <RoleGuard permission='role_view'>
            {/* Page Title */}
            <Title
                title="Manage your Role and permissions"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Role and Permission' }
                ]}
            />

            {/* Content */}
            <div className="px-4 py-6">
                {canCreate && <AddButton title='Add Role' url='/admin/role/add' />}
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {roles?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={roles} columns={roleColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Roles
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