"use server";
import { db } from "@/lib/db";
import { enrollments, kelas, users } from "@/lib/db/schema";
import { requireUser } from "@/lib/access";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createClass(form: FormData) {
  await requireUser(["SUPERADMIN", "ADMIN"]);
  const data = z
    .object({
      name: z.string().trim().min(1).max(120),
      description: z.string().trim().max(1000),
      teacherId: z.string().min(1),
    })
    .parse(Object.fromEntries(form));
  const [teacher] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, data.teacherId), eq(users.role, "TEACHER"), eq(users.isActive, true)))
    .limit(1);
  if (!teacher) throw new Error("Guru tidak ditemukan");
  await db.insert(kelas).values(data);
  revalidatePath("/superadmin/kelas");
  revalidatePath("/admin/kelas");
  revalidatePath("/superadmin");
  revalidatePath("/admin");
}

export async function addStudent(form: FormData) {
  await requireUser(["SUPERADMIN", "ADMIN"]);
  const data = z
    .object({ kelasId: z.string().min(1), studentId: z.string().min(1) })
    .parse(Object.fromEntries(form));
  const [student] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, data.studentId), eq(users.role, "STUDENT"), eq(users.isActive, true)))
    .limit(1);
  const [classroom] = await db.select({ id: kelas.id }).from(kelas).where(eq(kelas.id, data.kelasId)).limit(1);
  if (!student || !classroom) throw new Error("Siswa atau kelas tidak ditemukan");
  await db.insert(enrollments).values(data).onConflictDoNothing();
  revalidatePath("/superadmin/kelas");
  revalidatePath("/admin/kelas");
}

export async function removeStudent(form: FormData) {
  await requireUser(["SUPERADMIN", "ADMIN"]);
  const id = z.string().min(1).parse(form.get("id"));
  await db.delete(enrollments).where(eq(enrollments.id, id));
  revalidatePath("/superadmin/kelas");
  revalidatePath("/admin/kelas");
}

export async function updateClass(form: FormData) {
  await requireUser(["SUPERADMIN", "ADMIN"]);
  const data = z
    .object({
      id: z.string().min(1),
      name: z.string().trim().min(1).max(120),
      description: z.string().trim().max(1000),
      teacherId: z.string().min(1),
    })
    .parse(Object.fromEntries(form));
  const [teacher] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, data.teacherId), eq(users.role, "TEACHER"), eq(users.isActive, true)))
    .limit(1);
  if (!teacher) throw new Error("Guru tidak ditemukan");
  await db
    .update(kelas)
    .set({
      name: data.name,
      description: data.description,
      teacherId: data.teacherId,
      updatedAt: new Date(),
    })
    .where(eq(kelas.id, data.id));
  revalidatePath("/superadmin/kelas");
  revalidatePath("/admin/kelas");
}

export async function deleteClass(form: FormData) {
  await requireUser(["SUPERADMIN", "ADMIN"]);
  const id = z.string().min(1).parse(form.get("id"));
  await db.delete(enrollments).where(eq(enrollments.kelasId, id));
  await db.delete(kelas).where(eq(kelas.id, id));
  revalidatePath("/superadmin/kelas");
  revalidatePath("/admin/kelas");
  revalidatePath("/superadmin");
  revalidatePath("/admin");
}
