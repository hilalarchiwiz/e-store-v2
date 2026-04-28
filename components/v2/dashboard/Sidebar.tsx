"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import LogoutModal from "./LogoutModal";

const menuItems = [
  { label: "Dashboard", icon: "grid_view", href: "/v2/dashboard" },
  { label: "My Orders", icon: "shopping_bag", href: "/v2/dashboard/orders" },
  { label: "Addresses", icon: "location_on", href: "/v2/dashboard/addresses" },
  { label: "Account Details", icon: "person", href: "/v2/dashboard/profile" },
  { label: "Security", icon: "security", href: "/v2/dashboard/security" },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = session?.user;
  const name = user?.name ?? "User";
  const email = user?.email ?? "";
  const avatar = user?.image;
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white dark:bg-[#1a251d] rounded-3xl border border-primary/5 shadow-xl overflow-hidden sticky top-24">
        {/* User Info */}
        <div className="p-8 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-black text-lg">{initials}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-[#121714] dark:text-white truncate">{name}</h3>
              <p className="text-xs text-gray-400 font-medium truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-[#648770] hover:bg-primary/5 hover:text-primary"
                      }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            disabled={loggingOut}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
          >
            {loggingOut ? (
              <span className="size-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined">logout</span>
            )}
            <span className="text-sm">{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
};

export default DashboardSidebar;
