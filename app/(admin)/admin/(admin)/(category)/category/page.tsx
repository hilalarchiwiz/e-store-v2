import AddButton from '@/components/Admin/Buttons/AddButton';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import DataTable from '@/components/Admin/Common/DataTable';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import Pagination from '@/components/Admin/Pagination';
import Title from '@/components/Admin/Typography/Title';
import { PAGE_SIZE } from '@/lib/constant';
import { Layers, Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { deleteCategory, getCategories } from '../(actions)/category.action';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Category Management - list',
    };
}

export default async function CategoryPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { categories, totalPages, totalCount } = await getCategories(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    const canEdit = await hasPermission('category_update');
    const canDelete = await hasPermission('category_delete');
    const canCreate = await hasPermission('category_create');
    const categoryColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Image",
            accessor: (category: any) => (
                <div className="relative w-10 h-10 border rounded">
                    <Image unoptimized={false} src={category.img} alt="" fill className="object-contain p-1" />
                </div>
            ),
        },
        { header: "Name", accessor: "title" },
        {
            header: "Status",
            accessor: () => (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    Active
                </span>
            ),
        },
        ...((canEdit || canDelete)
            ?
            ([
                {
                    header: "Action",
                    accessor: (category: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/category/edit-category/${category.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {
                                canDelete && <DeleteButton id={category.id} action={deleteCategory} />
                            }
                        </div>
                    ),
                }
            ]) : []),
    ];


    return (
        <RoleGuard permission='category_view'>
            <Title title="Category Management"
                breadcrumbs={
                    [
                        {
                            label: "Dashboard", href: "/admin"
                        },
                        {
                            label: "Category"
                        }
                    ]
                } />


            {/* Categories Table */}
            <div className="px-4 py-6">
                <div className="flex items-center gap-3 mb-4">
                    {canCreate && <AddButton title='Add Category' url='/admin/category/add-category' />}
                    <Link
                        href="/admin/subcategory"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
                    >
                        <Layers size={16} />
                        Manage Sub-Categories
                    </Link>
                </div>
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />
                    {categories?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={categories} columns={categoryColumns} />

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
        </RoleGuard>
    );
}