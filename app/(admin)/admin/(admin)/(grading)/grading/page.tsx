import { PAGE_SIZE } from "@/lib/constant";
import { deleteGrading, getGradings } from "../actions/grade.action";
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

export async function generateMetadata() {
    return {
        title: 'Grading Management - list',
    };
}



const GradingPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) => {
    const params = await searchParams;
    const { gradings, totalPages, totalCount } = await getGradings(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const canEdit = await hasPermission('banner_update');
    const canCreate = await hasPermission('banner_create');

    const gradingColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        { header: "Name", accessor: "title" },
        { header: "Description", accessor: "description" },
        {
            header: "Action",
            accessor: (grade: any) => (
                <div className="flex gap-2">
                    <Link href={`/admin/grading/edit-grading/${grade.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                        <Pencil size={14} />
                    </Link>
                    <DeleteButton id={grade.id} action={deleteGrading} />
                </div>
            ),
        }
    ];
    return (
        <>
            {/* Page Title */}
            <Title
                title="Manage your Grade"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Grade' }
                ]}
            />

            {/* Content */}
            <div className="px-4 py-6">
                {
                    canCreate && <AddButton title='Add Grade' url='/admin/grading/add-grading' />
                }

                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {gradings?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={gradings} columns={gradingColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Gradings
                                </p>
                                <Pagination totalPages={totalPages} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default GradingPage