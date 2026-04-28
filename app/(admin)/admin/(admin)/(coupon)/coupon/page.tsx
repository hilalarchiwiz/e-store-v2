import { deleteCoupon, getCoupons } from '../actions/coupon.actions';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import { PAGE_SIZE } from '@/lib/constant';
import Title from '@/components/Admin/Typography/Title';
import AddButton from '@/components/Admin/Buttons/AddButton';
import TableControls from '@/components/Admin/Common/TableControls';
import DataTable from '@/components/Admin/Common/DataTable';
import Pagination from '@/components/Admin/Pagination';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Coupon Management - list',
    };
}

export default async function CouponPage({
    searchParams,
}: {
    searchParams: { search?: string; page?: string; limit?: string };
}) {
    const params = await searchParams;
    const { coupons, totalPages, totalCount } = await getCoupons(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const canEdit = await hasPermission('coupon_update');
    const canCreate = await hasPermission('coupon_create');
    const canDelete = await hasPermission('coupon_delete');

    const couponColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Title",
            accessor: (coupon: any) => <div className='font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 inline-block'>{coupon.code}</div>,
        },
        {
            header: "Description",
            accessor: (coupon: any) => {
                return (
                    <>
                        <div className="text-sm font-medium text-gray-800">
                            {coupon.discount}
                            {coupon.discountType === 'PERCENTAGE' ? '%' : ' Flat'} OFF
                        </div>
                        {
                            coupon.minPurchase && (
                                <div className="text-xs text-gray-500">Min: Rs. {coupon.minPurchase}</div>
                            )
                        }
                    </>
                )
            },
        },
        {
            header: "Status",
            accessor: (coupon: any) => {
                return (
                    <div className="text-sm text-gray-600">
                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                    </div>
                )
            },
        },
        {
            header: "Updated",
            accessor: (coupon: any) => {
                const expiryDate = coupon.expiresAt
                    ? new Date(coupon.expiresAt).toLocaleDateString('en-US')
                    : 'No Expiry';
                return (
                    <>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                        </span >
                        <div className="text-[10px] text-gray-400 mt-1">Exp: {expiryDate}</div>
                    </>
                )
            },
        },
        ...((canEdit || canDelete) ? [
            (
                {
                    header: "Action",
                    accessor: (coupon: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/coupon/edit/${coupon.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {
                                canDelete && <DeleteButton id={coupon.id} action={deleteCoupon} />
                            }
                        </div>
                    ),
                }
            )
        ] : [])
    ]

    return (
        <RoleGuard permission='coupon_view'>
            {/* Page Title */}
            <Title
                title="Manage your Coupons"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Coupons' }
                ]}
            />
            {/* Categories Table */}
            <div className="px-4 py-6">
                <AddButton title='Add Coupons' url='/admin/coupon/create' />
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />
                    {coupons?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={coupons} columns={couponColumns} />
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