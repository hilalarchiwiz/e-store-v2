import { Plus, Pencil, Package2, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { deleteProduct, getAllProducts } from './(actions)/product.action';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import SearchInput from '@/components/Admin/SearchInput';
import Pagination from '@/components/Admin/Pagination';
import { PAGE_SIZE } from '@/lib/constant';
import Title from '@/components/Admin/Typography/Title';
import DataTable from '@/components/Admin/Common/DataTable';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import AddButton from '@/components/Admin/Buttons/AddButton';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Product Management - list',
    };
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { products, totalPages, totalCount } = await getAllProducts(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const canEdit = await hasPermission('product_update');
    const canDelete = await hasPermission('product_delete');
    const canCreate = await hasPermission('product_create');
    const canView = await hasPermission('product_view');

    const productColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Image",
            accessor: (product: any) => {
                return (
                    <div className="relative w-10 h-10 border rounded overflow-hidden bg-gray-50" >
                        <Image
                            unoptimized
                            src={
                                // Check if images exist AND the first image isn't an empty string
                                product.images && product.images.length > 0 && product.images[0] !== ''
                                    ? product.images[0]
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(product.title)}&background=94849&color=fff&bold=true`
                            }
                            alt={product.title}
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                )
            },
        },
        { header: "Name", accessor: "title" },
        { header: "Brand", accessor: (product: any) => product.brand?.title },
        { header: "Category", accessor: (product: any) => product.category?.title },
        { header: "Price", accessor: (product: any) => `Rs. ${product.price}` },
        { header: "Quantity", accessor: "quantity" },
        {
            header: "Status",
            accessor: (product: any) => (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {product.status}
                </span>
            ),
        },
        ...((canDelete || canView || canEdit) ? [
            (
                {
                    header: "Action",
                    accessor: (product: any) => (
                        <div className="flex gap-2">
                            {
                                canView && <Link href={`/admin/products/view/${product.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Eye size={14} />
                                </Link>
                            }
                            {
                                canEdit && <Link href={`/admin/products/edit/${product.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {
                                canDelete && <DeleteButton id={product.id} action={deleteProduct} />
                            }
                        </div>
                    ),
                }
            )
        ] : [])

    ];
    return (
        <RoleGuard permission='product_view'>
            <Title
                title='Product Management'
                breadcrumbs={
                    [
                        { label: 'Dashboard', href: '/admin' },
                        { label: 'Product' },
                    ]
                }
            />
            <div className="px-4 py-6">
                {canCreate && <AddButton title='Add Product' url='/admin/products/create' />}
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {products?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={products} columns={productColumns} />
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
