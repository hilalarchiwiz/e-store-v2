import { hasPermission } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

interface RoleGuardProps {
    permission: string;
    children: React.ReactNode;
}

export async function RoleGuard({ permission, children }: RoleGuardProps) {
    const allowed = await hasPermission(permission);

    if (!allowed) {
        // toast.error("You do not have permission to access this page.");
        redirect("/admin");
    }

    return <>{children}</>;
}