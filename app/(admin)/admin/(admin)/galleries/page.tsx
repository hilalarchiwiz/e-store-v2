import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import Pagination from '@/components/Admin/Pagination';
import Title from '@/components/Admin/Typography/Title';
import { hasPermission } from '@/lib/auth-utils';
import {
    getGalleryProducts,
    type GallerySearchParams,
} from './(actions)/gallery.action';
import ProductGalleryManager from './_components/ProductGalleryManager';

export async function generateMetadata() {
    return { title: 'Product Galleries' };
}

export default async function GalleriesPage({
    searchParams,
}: {
    searchParams: Promise<GallerySearchParams>;
}) {
    const params = await searchParams;
    const [galleryData, canUpdate] = await Promise.all([
        getGalleryProducts(params),
        hasPermission('product_update'),
    ]);

    const {
        products = [],
        totalCount = 0,
        totalPages = 0,
        currentPage = 1,
        itemsPerPage = 10,
    } = galleryData || {};
    const showingFrom = totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const showingTo = totalCount > 0 ? Math.min(currentPage * itemsPerPage, totalCount) : 0;

    return (
        <RoleGuard permission="product_view">
            <Title
                title="Product Galleries"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Galleries' },
                ]}
            />

            <div className="px-4 py-6">
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-4">
                        <p className="text-sm text-emerald-900">
                            Click a product title to view its images. Clear BG replaces only the
                            selected Azure blob and keeps its current name and product URL.
                        </p>
                    </div>

                    <TableControls />

                    {products.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <ProductGalleryManager products={products} canUpdate={canUpdate} />
                            <div className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
                                <p className="text-sm text-slate-500">
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
