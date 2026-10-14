import DashboardShell from "@/components/DashboardShell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUINotifications } from "@/lib/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const notifications = getUINotifications();

  if (!session?.user) {
    redirect("/");
  }

  const role = (session.user as any)?.role || "RECEPTIONIST";
  const userName = session.user.name || "Usuario";
  const userRoleLabel = (role || "Usuario").toLowerCase();

  return (
    <DashboardShell
      role={role}
      userName={userName}
      userRoleLabel={userRoleLabel}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
