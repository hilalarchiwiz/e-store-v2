import DashboardStats from "@/components/Admin/Dashboard/DashboardStats";
import RecentActivity from "@/components/Admin/Dashboard/RecentActivity";
import SalesChart from "@/components/Admin/Dashboard/SalesChart";
import TopProducts from "@/components/Admin/Dashboard/TopProducts";
import Link from "next/link";
import { Package } from "lucide-react";
import { Suspense } from "react";
import AddButton from "@/components/Admin/Buttons/AddButton";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Monitor your store's performance and key metrics
            </p>
          </div>
          <div className="flex gap-4">
            <AddButton title="Add Product" url="/admin/products/create" />
          </div>
        </div>

        {/* Stats Cards */}
        <Suspense fallback={<StatsLoading />}>
          <DashboardStats />
        </Suspense>

        {/* Charts and Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <Suspense fallback={<ChartLoading />}>
            <SalesChart />
          </Suspense>
          <Suspense fallback={<ActivityLoading />}>
            <RecentActivity />
          </Suspense>
        </div>

        {/* Top Products */}
        <Suspense fallback={<ProductsLoading />}>
          <TopProducts />
        </Suspense>
      </div>
    </div>
  );
}

// Loading Components
function StatsLoading() {
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
        >
          <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-32" />
        </div>
      ))}
    </div>
  );
}

function ChartLoading() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  );
}

function ActivityLoading() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
