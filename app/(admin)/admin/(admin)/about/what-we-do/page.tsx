import FormWrapper from "@/components/Admin/Form/FormWrapper";
import {
  getSetting,
  updateSettings,
} from "../../setting/actions/setting.action";
import FormInput from "@/components/Admin/Form/Input";
import FormTextarea from "@/components/Admin/Form/Textarea";
import Title from "@/components/Admin/Typography/Title";
import AddButton from "@/components/Admin/Buttons/AddButton";
import TableControls from "@/components/Admin/Common/TableControls";
import { deleteWhatWeDo, getWhatWeDo } from "./actions/whatwedo.action";
import { PAGE_SIZE } from "@/lib/constant";
import * as Icons from "lucide-react";
import React from "react";
import Link from "next/link";
import DeleteButton from "@/components/Admin/Buttons/DeleteButton";
import RecordNotFound from "@/components/Admin/Common/RecordNotFound";
import DataTable from "@/components/Admin/Common/DataTable";
import Pagination from "@/components/Admin/Pagination";
import { RoleGuard } from "@/components/Admin/Common/RoleGuard";
import DynamicIcon from "@/components/v2/DynamicIcon";
const WhatWeDoPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; limit?: string }>;
}) => {
  const { setting } = await getSetting("about_what_we_do");

  const params = await searchParams;
  const { whatwedoes, totalPages, totalCount } = await getWhatWeDo(
    params,
    "what_we_do",
  );
  const currentPage = Number(params.page) || 1;
  const limit = Number(params.limit) || PAGE_SIZE;
  const whatWeDoColumns: any[] = [
    {
      header: "SN",
      accessor: (_: any, index: number) =>
        (currentPage - 1) * limit + (index + 1),
    },
    { header: "Name", accessor: (item: any) => item.title },
    { header: "Description", accessor: (item: any) => item.description },
    {
      header: "Image",
      accessor: (whatwedo: any) => {
        return (
          <div className="w-16 h-12 overflow-hidden flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <DynamicIcon name={whatwedo?.icon} fallback="Image" size={36} className="text-emerald-500" />
          </div>
        );
      },
    },
    {
      header: "Action",
      accessor: (whatwedo: any) => (
        <div className="flex gap-2">
          <Link
            href={`/admin/about/what-we-do/edit/${whatwedo.id}`}
            className="p-2 bg-blue-50 text-blue-600 rounded"
          >
            <Icons.Pencil size={14} />
          </Link>
          <DeleteButton id={whatwedo.id} action={deleteWhatWeDo} />
        </div>
      ),
    },
  ];
  return (
    <RoleGuard permission="about_view">
      <div className="w-full">
        <div className="md:-mt-4 mt-1">
          <FormWrapper
            action={updateSettings.bind(
              null,
              "about_what_we_do",
              "/admin/about/what-we-do",
            )}
            buttonTitle="Update What We Do"
            successMessage="About What We Do Update successfully"
            href="/admin/about/what-we-do"
          >
            <FormInput
              label="Section label"
              required
              name="eyebrow"
              placeholder="WHAT WE DO"
              defaultValue={setting?.eyebrow}
            />
            <FormInput
              label="Section title"
              required
              name="title"
              placeholder="Quality Tech, Smart Choices. Everything You Need, All in One Place."
              defaultValue={setting?.title}
            />
            <FormTextarea
              label="Section description (optional)"
              name="description"
              placeholder="Introduce the product categories available from QAAM"
              defaultValue={setting?.description}
            />
          </FormWrapper>
        </div>

        <Title
          title="Manage What we do "
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "What we do " },
          ]}
        />
        <div className="px-4 py-6">
          <AddButton title="Add What we do" url="/admin/about/what-we-do/add" />
          <div className="bg-white rounded-lg overflow-hidden">
            <TableControls />

            {whatwedoes?.length === 0 ? (
              <RecordNotFound />
            ) : (
              <>
                <DataTable data={whatwedoes || []} columns={whatWeDoColumns} />

                <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">
                      {(Number(params.page || 1) - 1) * 10 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {totalCount
                        ? Math.min(Number(params.page || 1) * 10, totalCount)
                        : 0}
                    </span>{" "}
                    of <span className="font-medium">{totalCount}</span>{" "}
                    whatwedos
                  </p>
                  <Pagination totalPages={totalPages} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default WhatWeDoPage;
