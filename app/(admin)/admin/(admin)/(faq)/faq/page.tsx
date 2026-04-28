import AddButton from '@/components/Admin/Buttons/AddButton';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import DataTable from '@/components/Admin/Common/DataTable';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import Pagination from '@/components/Admin/Pagination';
import Title from '@/components/Admin/Typography/Title';
import { PAGE_SIZE } from '@/lib/constant';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { deleteFaq, getFaqs } from './action/faq.action';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Faq Management - list',
    };
}

export default async function FaqPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const { faqs, totalPages, totalCount } = await getFaqs(params);

    const canEdit = await hasPermission('faq_update');
    const canDelete = await hasPermission('faq_delete');
    const canCreate = await hasPermission('faq_create');

    const faqColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        { header: "Question", accessor: "question" },
        { header: "Answer", accessor: "answer" },
        ...((canEdit || canDelete) ? [
            (
                {
                    header: "Action",
                    accessor: (faq: any) => (
                        <div className="flex gap-2">
                            {
                                canEdit && <Link href={`/admin/faq/edit-faq/${faq.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                                    <Pencil size={14} />
                                </Link>
                            }
                            {
                                canDelete && <DeleteButton id={faq.id} action={deleteFaq} />
                            }
                        </div>
                    ),
                }
            )
        ] : [])
    ];
    return (
        <RoleGuard permission='faq_view'>
            {/* Page Title */}
            <Title
                title="Manage your faq"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Faq' }
                ]}
            />
            {/* Categories Table */}
            <div className="px-4 py-6">
                {
                    canDelete && <AddButton title='Add Faq' url='/admin/faq/add-faq' />
                }
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {faqs?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={faqs} columns={faqColumns} />
                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Faqs
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