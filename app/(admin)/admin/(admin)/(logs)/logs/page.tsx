import Link from 'next/link';
import Title from '@/components/Admin/Typography/Title';
import Pagination from '@/components/Admin/Pagination';
import TableControls from '@/components/Admin/Common/TableControls';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import { PAGE_SIZE } from '@/lib/constant';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { getAuditLogs } from '../actions/log.action';
import { entityLabel, getChanges, recordName } from '@/lib/audit-format';

export async function generateMetadata() {
    return {
        title: 'Activity Logs',
    };
}

const ACTIONS = {
    CREATE: { verb: 'created', badge: 'Created', color: 'bg-green-100 text-green-800', bar: 'border-l-green-500', detailsTitle: 'Details saved' },
    UPDATE: { verb: 'updated', badge: 'Updated', color: 'bg-blue-100 text-blue-800', bar: 'border-l-blue-500', detailsTitle: 'What changed' },
    DELETE: { verb: 'deleted', badge: 'Deleted', color: 'bg-red-100 text-red-800', bar: 'border-l-red-500', detailsTitle: 'Details that were removed' },
} as const;

const VISIBLE_CHANGES = 5;

export default async function AuditLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string; action?: string }>;
}) {
    const params = await searchParams;
    const { logs = [], totalPages = 0, totalCount = 0, refs } = await getAuditLogs(params) || {};
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const activeAction = ['CREATE', 'UPDATE', 'DELETE'].includes(params.action || '') ? params.action : '';

    const filterHref = (action: string) => {
        const q = new URLSearchParams();
        if (params.search) q.set('search', params.search);
        if (params.limit) q.set('limit', params.limit);
        if (action) q.set('action', action);
        const qs = q.toString();
        return qs ? `/admin/logs?${qs}` : '/admin/logs';
    };
    const filters = [
        { label: 'All activity', value: '' },
        { label: 'Created', value: 'CREATE' },
        { label: 'Updated', value: 'UPDATE' },
        { label: 'Deleted', value: 'DELETE' },
    ];

    return (
        <RoleGuard permission='audit_view'>
            <Title
                title="Activity Logs"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Activity Logs' }
                ]}
            />

            <div className="px-4 py-6">
                <div className='flex items-center space-x-2.5 pb-4'>
                    <Link href={'/admin/logs'} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-md font-medium transition-colors">Activity Logs</Link>
                    <Link href={'/admin/login-logs'} className='border border-emerald-600 hover:bg-emerald-700 hover:text-white text-emerald-600 px-6 py-2.5 rounded-md font-medium transition-colors'>Login Logs</Link>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                    A record of who changed what in the admin panel. Each entry shows the person, what they did, and exactly which values changed (old value → new value).
                </p>

                <div className="bg-white rounded-lg overflow-hidden">
                    <div className="flex flex-wrap gap-2 border-b border-gray-200 px-6 pt-4">
                        {filters.map((f) => (
                            <Link
                                key={f.value}
                                href={filterHref(f.value)}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${activeAction === f.value ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {f.label}
                            </Link>
                        ))}
                    </div>
                    <TableControls />

                    {logs.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <ul className="divide-y divide-gray-100">
                                {logs.map((log: any) => {
                                    const meta = ACTIONS[log.action as keyof typeof ACTIONS] ?? ACTIONS.UPDATE;
                                    const who = log.user?.name || 'System';
                                    const initials = who.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                                    const what = entityLabel(log.entityName);
                                    const name = recordName(log.oldData, log.newData);
                                    const changes = getChanges(log.action, log.oldData, log.newData, refs);
                                    const shown = changes.slice(0, VISIBLE_CHANGES);
                                    const more = changes.slice(VISIBLE_CHANGES);
                                    const date = new Date(log.createdAt);

                                    const renderRow = (c: (typeof changes)[number]) => (
                                        <li key={c.key} className="grid gap-1 px-3 py-2 text-sm sm:grid-cols-[160px_1fr] sm:gap-4">
                                            <span className="font-medium text-gray-700">{c.label}</span>
                                            {log.action === 'UPDATE' ? (
                                                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                                                    <span className={`rounded bg-red-50 px-2 py-0.5 break-words ${c.before.empty ? 'italic text-gray-400' : 'text-red-700 line-through decoration-red-300'}`}>{c.before.text}</span>
                                                    <span aria-label="changed to" className="text-gray-400">→</span>
                                                    <span className={`rounded bg-green-50 px-2 py-0.5 break-words ${c.after.empty ? 'italic text-gray-400' : 'font-medium text-green-700'}`}>{c.after.text}</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-800 break-words min-w-0">
                                                    {log.action === 'DELETE' ? c.before.text : c.after.text}
                                                </span>
                                            )}
                                        </li>
                                    );

                                    return (
                                        <li key={log.id} className={`border-l-4 ${meta.bar} px-6 py-5`}>
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">{initials}</div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-gray-900">
                                                            <span className="font-semibold">{who}</span>{' '}
                                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>{meta.verb}</span>{' '}
                                                            {log.action === 'CREATE' ? 'a new' : 'a'} <span className="font-semibold">{what}</span>
                                                            {name && <> — <span className="font-medium">“{name}”</span></>}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-gray-500">
                                                            {log.user?.email && log.user.email !== 'auto@system.com' ? `${log.user.email} · ` : ''}
                                                            {what} ID: {log.entityId}
                                                            {log.action === 'UPDATE' && changes.length > 0 && <> · {changes.length} field{changes.length === 1 ? '' : 's'} changed</>}
                                                        </p>

                                                        {changes.length > 0 ? (
                                                            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50/60">
                                                                <p className="border-b border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{meta.detailsTitle}</p>
                                                                <ul className="divide-y divide-gray-100">{shown.map(renderRow)}</ul>
                                                                {more.length > 0 && (
                                                                    <details className="border-t border-gray-200">
                                                                        <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">Show {more.length} more field{more.length === 1 ? '' : 's'}</summary>
                                                                        <ul className="divide-y divide-gray-100">{more.map(renderRow)}</ul>
                                                                    </details>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="mt-2 text-xs italic text-gray-400">No visible field changes were recorded for this action.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="shrink-0 pl-13 text-sm lg:pl-0 lg:text-right">
                                                    <p className="font-medium text-gray-800">{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-xs text-gray-500">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">
                                        {totalCount ? Math.min(currentPage * limit, totalCount) : 0}
                                    </span> of <span className="font-medium">{totalCount}</span> activities
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
