import { Pencil } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import Title from '@/components/Admin/Typography/Title';
import Pagination from '@/components/Admin/Pagination';
import TableControls from '@/components/Admin/Common/TableControls';
import AddButton from '@/components/Admin/Buttons/AddButton';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import DataTable from '@/components/Admin/Common/DataTable';
import { PAGE_SIZE } from '@/lib/constant';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { hasPermission } from '@/lib/auth-utils';
import { getAuditLogs } from '../actions/log.action';
import { getDiff } from '@/lib/helper';

export async function generateMetadata() {
    return {
        title: 'Brand Management - list',
    };
}

export default async function RolePage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        page?: string;
        limit?: string
    }>;
}) {
    const params = await searchParams;
    const { logs, totalPages, totalCount } = await getAuditLogs(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const logColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: 'User Info',
            accessor: (log: any) => {
                const userName = log.user?.name || "System";
                const userEmail = log.user?.email || "N/A";
                const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                return (
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                                {initials}
                            </span>
                        </div>
                        <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{userName}</div>
                            <div className="text-xs text-gray-500">{userEmail}</div>
                        </div>
                    </div>
                )

            }
        },
        {
            header: 'Entity Name',
            accessor: 'entityName'
        },
        {
            header: 'Action Status',
            accessor: (log: any) => {
                return (
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize 
                        ${log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'}`}>
                        {log.action.toLowerCase()}
                    </span>
                )

            }
        },
        {
            header: 'Old Data',
            accessor: (log: any) => {
                const changedKeys = getDiff(log.oldData, log.newData);
                return (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100 max-w-xs overflow-x-auto">
                        <ul className="space-y-1.5">
                            {changedKeys.length > 0 ? changedKeys.map(key => (
                                <li key={key} className="text-xs text-gray-700">
                                    <span className="font-semibold text-gray-900">{key}:</span>{" "}
                                    <span className="text-red-700">{String((log.oldData as any)?.[key] ?? 'null')}</span>
                                </li>
                            )) : <li className="text-xs text-gray-400 italic">No previous values</li>}
                        </ul>
                    </div>
                )

            }
        },
        {
            header: 'New Data',
            accessor: (log: any) => {
                const changedKeys = getDiff(log.oldData, log.newData);
                return (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100 max-w-xs overflow-x-auto">
                        <ul className="space-y-1.5">
                            {changedKeys.length > 0 ? changedKeys.map(key => (
                                <li key={key} className="text-xs text-gray-700">
                                    <span className="font-semibold text-gray-900">{key}:</span>{" "}
                                    <span className="text-green-700">{String((log.newData as any)?.[key] ?? 'null')}</span>
                                </li>
                            )) : <li className="text-xs text-gray-400 italic">No new data</li>}
                        </ul>
                    </div>
                )

            }
        },
        {
            header: 'Created At',
            accessor: (log: any) => {
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                )

            }
        },

    ];
    return (
        <RoleGuard permission='audit_view'>
            {/* Page Title */}
            <Title
                title="Manage Audit Logs"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Audit Logs' }
                ]}
            />

            {/* Content */}
            <div className="px-4 py-6">
                <div className='flex items-center space-x-2.5 pb-4'>
                    <Link href={'/admin/logs'} className={`bg-emerald-600 hover:bg-emerald-700  text-white cursor-pointer  px-6 py-2.5 rounded-md flex items-center gap-2 font-medium transition-colors`}>Audit Logs</Link>
                    <Link href={'/admin/login-logs'} className='border border-emerald-600 cursor-pointer hover:bg-emerald-700 hover:text-white text-emerald-600 px-6 py-2.5 rounded-md flex items-center gap-2 font-medium transition-colors'>Login Logs</Link>
                </div>
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />

                    {/* Table */}
                    {logs?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={logs} columns={logColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> Roles
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