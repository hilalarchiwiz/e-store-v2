import { PAGE_SIZE } from "@/lib/constant";
import { deleteBanner, getBanners } from "../actions/banner.action";
import Link from "next/link";
import { Pencil } from "lucide-react";
import DeleteButton from "@/components/Admin/Buttons/DeleteButton";
import Image from "next/image";
import Pagination from "@/components/Admin/Pagination";
import DataTable from "@/components/Admin/Common/DataTable";
import AddButton from "@/components/Admin/Buttons/AddButton";
import TableControls from "@/components/Admin/Common/TableControls";
import RecordNotFound from "@/components/Admin/Common/RecordNotFound";
import Title from "@/components/Admin/Typography/Title";
import { hasPermission } from "@/lib/auth-utils";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";

export async function generateMetadata() {
    return {
        title: 'Banner Management - list',
    };
}



const BannerPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) => {
    const params = await searchParams;
    const { banners, totalPages, totalCount } = await getBanners(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const canDelete = await hasPermission('banner_delete');
    const canEdit = await hasPermission('banner_update');
    const canCreate = await hasPermission('banner_create');

    const bannerColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Image",
            accessor: (banner: any) => (
                <div className="relative w-10 h-10 border rounded">
                    <Image unoptimized src={banner.imageUrl} alt="" fill className="object-contain p-1" />
                </div>
            ),
        },
        { header: "Name", accessor: "title" },
        { header: "Type", accessor: "type" },
        { header: "Button Text", accessor: "buttonText" },
        {
            header: "Status",
            accessor: (banner: any) => (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {banner.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        ...((canEdit || canDelete) ? [{
            header: "Action",
            accessor: (banner: any) => (
                <div className="flex gap-2">
                    {canEdit && (
                        <Link href={`/admin/banner/edit-banner/${banner.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                            <Pencil size={14} />
                        </Link>
                    )}
                    {canDelete && <DeleteButton id={banner.id} action={deleteBanner} />}
                </div>
            ),
        }] : []),
    ];
    return (
        <RoleGuard permission="banner_view">
            {/* Page Title */}
            <Title
                title="Manage your Banner"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Banner' }
                ]}
            />

            {/* Content */}
            <div className="px-4 py-6">
                {
                    canCreate && <AddButton title='Add Banner' url='/admin/banner/add-banner' />
                }

                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {banners?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={banners} columns={bannerColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Banners
                                </p>
                                <Pagination totalPages={totalPages} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </RoleGuard>
    )
}

export default BannerPage