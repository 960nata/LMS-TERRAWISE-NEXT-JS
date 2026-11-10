import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = (session.user as any)?.role as string;
  if (role === "SUPERADMIN") redirect("/superadmin");
  if (role === "ADMIN") redirect("/admin");
  if (role === "TEACHER") redirect("/teacher");
  redirect("/student");
}
