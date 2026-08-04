import "../../../css/style.css";
import "../../../css/euclid-circular-a-font.css";
import generateSession from "@/lib/generate-session";
import { redirect } from "next/navigation";

export default async function InvoiceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await generateSession();

  if (!session?.user || session.user.roleName === "user") {
    redirect("/register");
  }

  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
