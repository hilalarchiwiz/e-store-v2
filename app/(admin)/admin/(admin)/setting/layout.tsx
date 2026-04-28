import Card from "@/components/Admin/Common/Card";
import SettingSidebar from "@/components/Admin/Setting/SettingSidebar";

export default async function AdminSettingLayout({ children }) {
    return (
        <Card>
            <div className="md:flex block gap-6 p-6">
                <SettingSidebar />
                {children}
            </div>
        </Card>
    );
}