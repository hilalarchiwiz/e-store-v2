import AddButton from '@/components/Admin/Buttons/AddButton';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import DataTable from '@/components/Admin/Common/DataTable';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import Pagination from '@/components/Admin/Pagination';
import Title from '@/components/Admin/Typography/Title';
import { PAGE_SIZE } from '@/lib/constant';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { deleteSubCategory, getSubCategories } from '../(actions)/subcategory.action';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return { title: 'Sub-Category Management' };
}

export default async function SubCategoryPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { subCategories, totalPages, totalCount } = await getSubCategories(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    const canEdit = await hasPermission('category_update');
    const canDelete = await hasPermission('category_delete');
    const canCreate = await hasPermission('category_create');

    const columns = [
        {
            header: 'SN',
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: 'Image',
            accessor: (sub: any) => (
                sub.img ? (
                    <div className="relative w-10 h-10 border rounded">
                        <Image unoptimized={false} src={sub.img} alt="" fill className="object-contain p-1" />
                    </div>
                ) : <span className="text-gray-400 text-xs">No image</span>
            ),
        },
        { header: 'Name', accessor: 'title' },
        {
            header: 'Parent Category',
            accessor: (sub: any) => sub.category?.title || '—',
        },
        {
            header: 'Status',
            accessor: () => (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Active
                </span>
            ),
        },
        ...((canEdit || canDelete)
            ? [{
                header: 'Action',
                accessor: (sub: any) => (
                    <div className="flex gap-2">
                        {canEdit && (
                            <Link href={`/admin/subcategory/edit-subcategory/${sub.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                <Pencil size={14} />
                            </Link>
                        )}
                        {canDelete && <DeleteButton id={sub.id} action={deleteSubCategory} />}
                    </div>
                ),
            }]
            : []),
    ];

    return (
        <RoleGuard permission="category_view">
            <Title
                title="Sub-Category Management"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Category', href: '/admin/category' },
                    { label: 'Sub-Category' },
                ]}
            />
            <div className="px-4 py-6">
                {canCreate && <AddButton title="Add Sub-Category" url="/admin/subcategory/add-subcategory" />}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />
                    {subCategories?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={subCategories} columns={columns} />
                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing{' '}
                                    <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {totalCount ? Math.min(currentPage * limit, totalCount) : 0}
                                    </span>{' '}
                                    of <span className="font-medium">{totalCount}</span> sub-categories
                                </p>
                                <Pagination totalPages={totalPages || 0} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
