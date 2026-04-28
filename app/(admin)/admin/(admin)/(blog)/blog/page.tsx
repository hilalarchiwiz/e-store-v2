import DeleteButton from '@/components/Admin/Buttons/DeleteButton';
import Image from 'next/image';
import AddButton from '@/components/Admin/Buttons/AddButton';
import EditButton from '@/components/Admin/Buttons/EditButton';
import Title from '@/components/Admin/Typography/Title';
import SubTitle from '@/components/Admin/Typography/SubTitle';
import SearchMessage from '@/components/Admin/Common/SearchMessage';
import RecordNotFound from '@/components/Admin/Common/RecordNotFound';
import TableControls from '@/components/Admin/Common/TableControls';
import DataTable from '@/components/Admin/Common/DataTable';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { PAGE_SIZE } from '@/lib/constant';
import Pagination from '@/components/Admin/Pagination';
import { deleteBlog, getBlogs } from './actions/blog.action';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { hasPermission } from '@/lib/auth-utils';

export async function generateMetadata() {
    return {
        title: 'Blog Management - list',
    };
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) {
    const params = await searchParams;
    const { blogs, totalPages, totalCount } = await getBlogs(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;

    const canEdit = await hasPermission('blog_update');
    const canDelete = await hasPermission('blog_delete');
    const canCreate = await hasPermission('blog_create');
    const blogColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Image",
            accessor: (blog: any) => (
                <div className="relative w-10 h-10 border rounded">
                    <Image unoptimized src={blog.image} alt="" fill className="object-contain p-1" />
                </div>
            ),
        },
        { header: "Name", accessor: "title" },
        { header: "Tag", accessor: "tag" },
        ...((canEdit || canDelete) ? [{
            header: "Action",
            accessor: (blog: any) => (
                <div className="flex gap-2">
                    {canEdit && (
                        <Link href={`/admin/blog/edit/${blog.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                            <Pencil size={14} />
                        </Link>
                    )}
                    {canDelete && <DeleteButton id={blog.id} action={deleteBlog} />}
                </div>
            ),
        }] : []),
    ];


    return (
        <RoleGuard permission='blog_view'>
            <Title title="Blog Management"
                breadcrumbs={
                    [
                        {
                            label: "Dashboard", href: "/admin"
                        },
                        {
                            label: "Blog"
                        }
                    ]
                } />


            {/* blogs Table */}
            <div className="px-4 py-6">
                {
                    canCreate && <AddButton title='Add Blog' url='/admin/blog/add' />
                }
                {/* White Table Container */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <TableControls />
                    {blogs?.length === 0 ? (
                        <RecordNotFound />
                    ) : (
                        <>
                            <DataTable data={blogs} columns={blogColumns} />

                            <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium">{(Number(params.page || 1) - 1) * PAGE_SIZE + 1}</span> to <span className="font-medium">
                                        {
                                            totalCount ? Math.min(Number(params.page || 1) * PAGE_SIZE, totalCount) : 0
                                        }
                                    </span> of <span className="font-medium">{totalCount}</span> blogs
                                </p>
                                <Pagination totalPages={totalPages || 0} />
                            </div>
                        </>
                    )}
                </div>
            </div >
        </RoleGuard>
    );
}