import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import LoginPage from "./login/page";

export const instant = false;

export default async function Home() {
  await connection();
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: string } | null)?.role;
    if (role === "SUPERADMIN") redirect("/superadmin");
    if (role === "ADMIN") redirect("/admin");
    if (role === "TEACHER") redirect("/teacher");
    redirect("/student");
  }

  return <LoginPage />;
}

