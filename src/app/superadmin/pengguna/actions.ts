"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  kelas,
  enrollments,
  tugasSubmissions,
  ujianAttempts,
  notifications,
  complaints,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function requireAdminOrSuper() {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) throw new Error("Tidak diizinkan");
  const [user] = await db
    .select({ role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user?.isActive || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    throw new Error("Tidak diizinkan");
  }
  return id;
}

const newUser = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(72),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
});

export async function createUser(form: FormData) {
  await requireAdminOrSuper();
  const data = newUser.parse(Object.fromEntries(form));
  await db.insert(users).values({ ...data, password: await bcrypt.hash(data.password, 10) });
  revalidatePath("/superadmin/pengguna");
  revalidatePath("/admin/pengguna");
  revalidatePath("/superadmin");
  revalidatePath("/admin");
}

export async function toggleUser(form: FormData) {
  const selfId = await requireAdminOrSuper();
  const id = z.string().min(1).parse(form.get("id"));
  if (id === selfId) throw new Error("Akun sendiri tidak dapat dinonaktifkan");
  const [target] = await db
    .select({ role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!target || target.role === "SUPERADMIN") throw new Error("Pengguna tidak dapat diubah");
  await db
    .update(users)
    .set({ isActive: !target.isActive, updatedAt: new Date() })
    .where(eq(users.id, id));
  revalidatePath("/superadmin/pengguna");
  revalidatePath("/admin/pengguna");
}

export async function deleteUser(form: FormData) {
  const selfId = await requireAdminOrSuper();
  const id = z.string().min(1).parse(form.get("id"));
  if (id === selfId) throw new Error("Akun sendiri tidak dapat dihapus");
  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!target || target.role === "SUPERADMIN") throw new Error("Superadmin tidak dapat dihapus");

  if (target.role === "TEACHER") {
    const [ownedClass] = await db.select({ id: kelas.id }).from(kelas).where(eq(kelas.teacherId, id)).limit(1);
    if (ownedClass) {
      throw new Error("Guru masih memiliki kelas yang diampu. Hapus atau pindahkan pengampu kelas terlebih dahulu.");
    }
  }

  // Cleanup dependent records safely
  await db.delete(enrollments).where(eq(enrollments.studentId, id));
  await db.delete(tugasSubmissions).where(eq(tugasSubmissions.studentId, id));
  await db.delete(ujianAttempts).where(eq(ujianAttempts.studentId, id));
  await db.delete(notifications).where(eq(notifications.userId, id));
  await db.delete(complaints).where(eq(complaints.userId, id));

  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/superadmin/pengguna");
  revalidatePath("/admin/pengguna");
  revalidatePath("/superadmin");
  revalidatePath("/admin");
}
