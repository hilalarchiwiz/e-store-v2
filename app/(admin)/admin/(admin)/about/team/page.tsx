import FormWrapper from "@/components/Admin/Form/FormWrapper"
import { getSetting, updateSettings } from "../../setting/actions/setting.action"
import FormInput from "@/components/Admin/Form/Input";
import FormTextarea from "@/components/Admin/Form/Textarea";
import Title from "@/components/Admin/Typography/Title";
import AddButton from "@/components/Admin/Buttons/AddButton";
import TableControls from "@/components/Admin/Common/TableControls";
import { PAGE_SIZE } from "@/lib/constant";
import * as Icons from 'lucide-react'
import React from "react";
import Link from "next/link";
import DeleteButton from "@/components/Admin/Buttons/DeleteButton";
import RecordNotFound from "@/components/Admin/Common/RecordNotFound";
import DataTable from "@/components/Admin/Common/DataTable";
import Pagination from "@/components/Admin/Pagination";
import { deleteTeam, getTeams } from "./actions/team.action";
import Image from "next/image";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";
const WhatWeDoPage = async (
    {
        searchParams,
    }: {
        searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
    }) => {
    const { setting } = await getSetting('team');

    const params = await searchParams;
    const { teams, totalPages, totalCount } = await getTeams(params);
    const currentPage = Number(params.page) || 1;
    const limit = Number(params.limit) || PAGE_SIZE;
    const teamColumns = [
        {
            header: "SN",
            accessor: (_: any, index: number) => (currentPage - 1) * limit + (index + 1),
        },
        {
            header: "Image",
            accessor: (team: any) => (
                <div className="relative w-10 h-10 border rounded">
                    <Image unoptimized src={team.image} alt="" fill className="object-contain p-1" />
                </div>
            ),
        },
        { header: "Name", accessor: "name" },
        { header: "Designation", accessor: "designation" },
        {
            header: "Action",
            accessor: (team: any) => (
                <div className="flex gap-2">
                    <Link href={`/admin/about/team/edit/${team.id}`} className="p-2 bg-blue-50 text-blue-600 rounded">
                        <Icons.Pencil size={14} />
                    </Link>
                    <DeleteButton id={team.id} action={deleteTeam} />
                </div>
            ),
        },
    ];
    return (
        <RoleGuard permission="about_view">
            <div className="w-full">
                <div className='md:-mt-4 mt-1'>
                    <FormWrapper
                        action={updateSettings.bind(null, 'team', '/admin/about/team')}
                        buttonTitle="Update Team"
                        successMessage="About Team Update successfully"
                        href="/admin/about/team"
                    >
                        <FormInput
                            label="Enter title"
                            required
                            name="title"
                            placeholder="Enter title"
                            defaultValue={setting?.title}

                        />
                        <FormTextarea
                            label="Enter Banner Short Description"
                            required
                            placeholder="Enter Banner Short Description"
                            defaultValue={setting?.description}
                        />
                    </FormWrapper>
                </div>

                <Title
                    title="Manage Team "
                    breadcrumbs={
                        [
                            { label: "Dashboard", href: '/dashboard' },
                            { label: "Team " },
                        ]
                    }
                />
                <div className="px-4 py-6">
                    <AddButton title='Add Team' url='/admin/about/team/add' />
                    <div className="bg-white rounded-lg overflow-hidden">
                        <TableControls />

                        {teams?.length === 0 ? (
                            <RecordNotFound />
                        ) : (
                            <>
                                <DataTable data={teams} columns={teamColumns} />

                                <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <p className="text-sm text-gray-500">
                                        Showing <span className="font-medium">{(Number(params.page || 1) - 1) * 10 + 1}</span> to <span className="font-medium">
                                            {
                                                totalCount ? Math.min(Number(params.page || 1) * 10, totalCount) : 0
                                            }
                                        </span> of <span className="font-medium">{totalCount}</span> team
                                    </p>
                                    <Pagination totalPages={totalPages} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </RoleGuard>
    )
}

export default WhatWeDoPage