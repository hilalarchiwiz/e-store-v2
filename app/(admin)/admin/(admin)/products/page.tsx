import {
    getAllProducts,
    getProductFilterOptions,
    type ProductListSearchParams,
} from './(actions)/product-list.action';
import Pagination from '@/components/Admin/Pagination';
import Title from '@/components/Admin/Typography/Title';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import AddButton from '@/components/Admin/Buttons/AddButton';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import ProductTable from './_components/ProductTable';
import ProductFilters from './_components/ProductFilters';

export async function generateMetadata() {
    return {
        title: 'Product Management - list',
    };
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<ProductListSearchParams>;
}) {
    const params = await searchParams;
    const [productData, filterData, canEdit, canDelete, canCreate, canView] = await Promise.all([
        getAllProducts(params),
        getProductFilterOptions(),
        hasPermission('product_update'),
        hasPermission('product_delete'),
        hasPermission('product_create'),
        hasPermission('product_view'),
    ]);

    const {
        products = [],
        totalPages = 0,
        totalCount = 0,
        currentPage = 1,
        itemsPerPage: limit = 10,
    } = productData || {};
    const {
        brands = [],
        categories = [],
        gradings = [],
        priceBounds = { min: 0, max: 0 },
    } = filterData || {};

    const showingFrom = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0;
    const showingTo = totalCount > 0 ? Math.min(currentPage * limit, totalCount) : 0;
    const productFilterKey = JSON.stringify({
        brand: params.brand,
        category: params.category,
        grading: params.grading,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        status: params.status,
    });

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
                    <ProductFilters
                        key={productFilterKey}
                        brands={brands}
                        categories={categories}
                        gradings={gradings}
                        priceBounds={priceBounds}
                    />

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
                                    Showing <span className="font-medium">{showingFrom}</span> to{' '}
                                    <span className="font-medium">{showingTo}</span> of{' '}
                                    <span className="font-medium">{totalCount}</span> products
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
