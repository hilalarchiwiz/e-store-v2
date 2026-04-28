
import '../../../../css/style.css'
import '../../../../css/euclid-circular-a-font.css'
import generateSession from '@/lib/generate-session';
import { redirect } from 'next/navigation';
export default async function AdminLayout({ children }) {
    const session = await generateSession();
    const role = session?.user?.role;
    if (session && role === "admin") {
        redirect('/admin')
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