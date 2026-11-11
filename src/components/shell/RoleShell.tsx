import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";
import type { Role } from "./nav";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function RoleShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { id?: string; name?: string | null; email?: string | null; role?: Role } | undefined;
  if (!user?.id || !user.role) redirect("/login");

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(10);

  return (
    <DashboardShell
      user={{ name: user.name ?? "User", email: user.email ?? "", role: user.role }}
      notifications={items.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }))}
      logoutAction={logout}
    >
      {children}
    </DashboardShell>
  );
}
