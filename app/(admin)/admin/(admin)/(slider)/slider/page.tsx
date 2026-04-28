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
import { deleteSlider, getSliders } from '../(action)/slider.action';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Slider Management - list',
    };
}

export default async function SliderPage({
    searchParams,
}: {
    searchParams: { search?: string; page?: string; limit?: string };
}) {
    // 1. Extract search and page from URL params
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    const {
        sliders,
        totalCount,
        totalPages,
    } = await getSliders(params);

    const canEdit = await hasPermission('slider_update');
    const canDelete = await hasPermission('slider_delete');
    const canCreate = await hasPermission('slider_create');
    const sliderColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Image",
            accessor: (slider: any) => {
                return (
                    <div className="relative w-10 h-10 border rounded">
                        <Image unoptimized src={slider.img} alt={slider.title} fill className="object-contain p-1" />
                    </div>
                )
            },
        },
        { header: "Name", accessor: "title" },
        {
            header: "Description", accessor: (slider: any) => {
                const text = slider.description || "";
                const words = text.split(" ");

                return words.length > 10
                    ? words.slice(0, 10).join(" ") + "..."
                    : text;
            }
        },
        {
            header: "Created",
            accessor: (slider: any) => new Date(slider.createdAt).toLocaleDateString()
        },
        {
            header: "Status",
            accessor: (slider: any) => (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {slider.status}
                </span>
            ),
        },
        ...((canEdit || canDelete) ? [
            (
                {
                    header: "Action",
                    accessor: (slider: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/slider/edit-slider/${slider.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {canDelete && <DeleteButton id={slider.id} action={deleteSlider} />}
                        </div>
                    ),
                }
            )
        ] : [])
    ];
    return (
        <RoleGuard permission='slider_view'>
            <Title title="Slider Management"
                breadcrumbs={
                    [
                        {
                            label: "Dashboard", href: "/admin"
                        },
                        {
                            label: "Slider"
                        }
                    ]
                } />
            {/* Categories Table */}
            <div className="px-4 py-6">
                {canCreate && <AddButton title='Add Slider' url='/admin/slider/add-slider' />}
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />
                    {sliders?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={sliders} columns={sliderColumns} />
                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * PAGE_SIZE + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * PAGE_SIZE, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Sliders
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