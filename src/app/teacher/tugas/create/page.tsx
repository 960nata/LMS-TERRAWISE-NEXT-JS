import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createTugas } from "../actions";
import { TaskCreateWizard } from "@/components/tugas/TaskCreateWizard";

export const instant = false;

export default async function CreateTugasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipe?: string }>;
}) {
  const session = await auth();
  const user = session?.user as { id: string; role: string };
  const teacherId = user.id;
  const classFilter = user.role === "TEACHER" ? eq(kelas.teacherId, teacherId) : undefined;
  const basePath =
    user.role === "SUPERADMIN"
      ? "/superadmin"
      : user.role === "ADMIN"
      ? "/admin"
      : "/teacher";

  const myKelas = await db
    .select({ id: kelas.id, name: kelas.name })
    .from(kelas)
    .where(classFilter);
  const resolvedSearchParams = await searchParams;

  return (
    <TaskCreateWizard
      kelas={myKelas}
      basePath={basePath}
      initialTipe={resolvedSearchParams.tipe}
      formAction={createTugas}
    />
  );
}
