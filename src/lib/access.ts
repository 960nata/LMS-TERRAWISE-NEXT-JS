import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function requireUser(roles: readonly string[]) {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) throw new Error("Silakan masuk kembali");
  const [user] = await db.select({ id: users.id, role: users.role, isActive: users.isActive }).from(users).where(eq(users.id, id)).limit(1);
  if (!user?.isActive || !roles.includes(user.role)) throw new Error("Tidak diizinkan");
  return user;
}

export async function requireClassManager(classId: string) {
  const user = await requireUser(["SUPERADMIN", "ADMIN", "TEACHER"]);
  const [classroom] = await db.select().from(kelas).where(eq(kelas.id, classId)).limit(1);
  if (!classroom || (user.role === "TEACHER" && classroom.teacherId !== user.id)) throw new Error("Kelas tidak ditemukan atau akses ditolak");
  return user;
}
