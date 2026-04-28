import AddButton from '@/components/Admin/Buttons/AddButton';
import Title from '@/components/Admin/Typography/Title';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import { PAGE_SIZE } from '@/lib/constant';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import TableControls from '@/components/Admin/Common/TableControls';
import DataTable from '@/components/Admin/Common/DataTable';
import Pagination from '@/components/Admin/Pagination';
import { deletePage, getPages } from './action/page.action';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Page Management - list',
    };
}

export default async function FaqPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const { pages, totalPages, totalCount } = await getPages(params);

    const canEdit = await hasPermission('page_update');
    const canDelete = await hasPermission('page_delete');
    const canCreate = await hasPermission('page_create');
    const pageColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        { header: "Title", accessor: "title" },
        { header: "Slug", accessor: "slug" },
        ...((canEdit || canDelete) ? [
            (
                {
                    header: "Action",
                    accessor: (page: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/page/edit-page/${page.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {canDelete && <DeleteButton id={page.id} action={deletePage} />}
                        </div>
                    ),
                }
            )
        ] : [])
    ];
    return (
        <RoleGuard permission='page_view'>
            {/* Page Title */}
            <Title
                title="Manage your Page"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Page' }
                ]}
            />
            {/* Categories Table */}
            <div className="px-4 py-6">
                {canCreate && <AddButton title='Add Page' url='/admin/page/add-page' />}
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {pages?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={pages} columns={pageColumns} />
                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Pages
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