
import '../../../../css/style.css'
import '../../../../css/euclid-circular-a-font.css'
import generateSession from '@/lib/generate-session';
import { redirect } from 'next/navigation';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await generateSession();
    // const role = (session?.user as any)?.role || (session?.user as any)?.roleName;
    // if (session && role === "admin") {
    //     redirect('/admin')
    // }

    const role = (session?.user as any)?.role || (session?.user as any)?.roleName;
    const allowedRoles = ["admin", "Super Admin", "superadmin"];
    if (session && role && allowedRoles.includes(role)) {
        redirect('/admin');
    }

    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body>
                <div>
                    {children}
                </div>
            </body>
        </html>
    );
}