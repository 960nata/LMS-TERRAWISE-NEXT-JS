import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const instant = false;

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = (session.user as { role?: string } | null)?.role;
  if (role === "SUPERADMIN") redirect("/superadmin");
  if (role === "ADMIN") redirect("/admin");
  if (role === "TEACHER") redirect("/teacher");
  redirect("/student");
}
