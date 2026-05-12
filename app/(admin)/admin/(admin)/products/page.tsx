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
import ProductTable from './_components/ProductTable';

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
                            <ProductTable 
                                products={products} 
                                currentPage={currentPage} 
                                limit={limit} 
                                canEdit={canEdit} 
                                canDelete={canDelete} 
                                canView={canView} 
                            />
                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> products
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
