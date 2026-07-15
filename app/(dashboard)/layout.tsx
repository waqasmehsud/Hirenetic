import { redirect } from "next/navigation";
import { getCurrentUser, getUserRole } from "@/lib/auth/session";
import DashboardLayoutClient from "@/components/dashboard-layout";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const role = await getUserRole();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient userEmail={user.email || ""} role={role}>
      {children}
    </DashboardLayoutClient>
  );
}
