import { Pencil } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import { deleteBrand, getBrands } from '../(actions)/brand.action';
import Title from '@/components/Admin/Typography/Title';
import Pagination from '@/components/Admin/Pagination';
import TableControls from '@/components/Admin/Common/TableControls';
import AddButton from '@/components/Admin/Buttons/AddButton';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import DataTable from '@/components/Admin/Common/DataTable';
import { PAGE_SIZE } from '@/lib/constant';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Brand Management - list',
    };
}

export default async function BrandPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { brands, totalPages, totalCount } = await getBrands(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    const canEdit = await hasPermission('brand_update');
    const canDelete = await hasPermission('brand_delete');
    const canCreate = await hasPermission('brand_create');
    const brandColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
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
        ...((canEdit || canDelete) ?
            ([
                {
                    header: "Action",
                    accessor: (brand: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/brand/edit-brand/${brand.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {
                                canDelete && <DeleteButton id={brand.id} action={deleteBrand} />
                            }
                        </div>
                    ),
                },
            ]) : []
        )

    ];
    return (
        <RoleGuard permission='brand_view'>
            {/* Page Title */}
            <Title
                title="Manage your product brands"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Brand' }
                ]}
            />

            {/* Content */}
            <div className="px-4 py-6">
                {canCreate && <AddButton title='Add Brand' url='/admin/brand/add-brand' />}
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {brands?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={brands} columns={brandColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> brands
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