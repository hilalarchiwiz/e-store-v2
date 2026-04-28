import Card from "@/components/Admin/Common/Card";
import AboutSidebar from "@/components/Admin/Setting/AboutSidebar";

export default async function AdminAboutLayout({ children }) {
    return (
        <Card>
            <div className="md:flex block gap-6 p-6">
                <AboutSidebar />
                {children}
            </div>
        </Card>
    );
}