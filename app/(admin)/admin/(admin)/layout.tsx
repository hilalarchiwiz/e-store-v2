import Sidebar from "@/components/Admin/Sidebar";
import '../../../css/style.css'
import '../../../css/euclid-circular-a-font.css'
import Header from "@/components/Admin/Header";
import generateSession from "@/lib/generate-session";
import { redirect } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/redux/provider";
import SyncUser from "@/components/Common/SyncUser";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getSetting } from "./setting/actions/setting.action";


export async function generateMetadata(): Promise<Metadata> {
    const { setting } = await getSetting('logo');

    return {
        title: 'Qaam | E-commerce',
        description: "Best e-commerce site",
        icons: {
            icon: setting?.favicon, // This sets the dynamic favicon
            shortcut: setting?.favicon,
            apple: setting?.favicon, // Optional: for apple touch icon
        },
    };
}

export default async function AdminLayout({ children }) {
    const session = await generateSession();
    const role = session?.user?.roleName;
    if (session && session.user) {
        if (session.user.roleName === 'user') {
            redirect('/')
        }
    } else {
        redirect('/register')
    }
    const user = await prisma.user.findUnique({
        where: { id: session?.user.id },
        include: { role: true }
    });

    const userPermissions = user?.role?.permissions || [];

    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body>
                <NextTopLoader
                    color="#10b981"
                    height={3}
                    zIndex={999999999}
                    showSpinner={false}
                />
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#ffffff',
                            color: '#1f2937',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <ReduxProvider>
                    <SyncUser session={session} />
                    <div className="relative bg-gradient-to-br bg-emerald-50 min-h-screen">
                        <div className="flex items-start">
                            <Sidebar permissions={userPermissions} />
                            <section className="w-full lg:ml-72">
                                <Header />
                                <main className="mt-6">
                                    {children}
                                </main>
                            </section>
                        </div>
                    </div>
                </ReduxProvider>
            </body>
        </html>
    );
}