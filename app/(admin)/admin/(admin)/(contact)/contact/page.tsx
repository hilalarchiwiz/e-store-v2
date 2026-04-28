import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import DataTable from '@/components/Admin/Common/DataTable';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import Pagination from '@/components/Admin/Pagination';
import Title from '@/components/Admin/Typography/Title';
import { PAGE_SIZE } from '@/lib/constant';
import { deleteContact, getContacts } from '../actions/contact.action';
import ReplyModal from '@/components/Admin/ReplayModal';
import { hasPermission } from '@/lib/auth-utils';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';

export async function generateMetadata() {
    return {
        title: 'Brand Management - list',
    };
}

export default async function SubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { contacts, totalPages, totalCount } = await getContacts(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    const canReplay = await hasPermission('contact_replay');
    const canDelete = await hasPermission('contact_delete');
    const subscribeColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        { header: "Name", accessor: "name" },
        { header: "Email", accessor: "email" },
        { header: "Phone", accessor: "phone" },
        { header: "subject", accessor: "subject" },
        ...((canReplay || canDelete) ? [
            (
                {
                    header: "Action",
                    accessor: (contact: any) => (
                        <div className="flex gap-2">
                            {canReplay && <ReplyModal contact={contact} />}
                            {
                                canDelete && <DeleteButton id={contact.id} action={deleteContact} />
                            }
                        </div>
                    ),
                }
            )
        ] : [])
    ];
    return (
        <RoleGuard permission='contact_view'>
            {/* Page Title */}
            <Title
                title="Manage your contacts"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'contacts' }
                ]}
            />

            {/* Content */}
            <div className="px-4 py-6">
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {contacts?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={contacts} columns={subscribeColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Contacts
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