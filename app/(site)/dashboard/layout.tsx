import React from "react";
import { redirect } from "next/navigation";
import generateSession from "@/lib/generate-session";
import DashboardSidebar from "@/components/v2/dashboard/Sidebar";
import Breadcrumbs from "@/components/v2/Breadcrumbs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await generateSession();

  if (!session?.user) {
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="max-w-400 mx-auto w-full md:px-10 px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "My Dashboard" }]}
      />

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <DashboardSidebar />
        <div className="flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}
