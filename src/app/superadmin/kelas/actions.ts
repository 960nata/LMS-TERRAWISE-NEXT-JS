"use server";
import { db } from "@/lib/db";
import { enrollments, kelas, users, materi, tugas, tugasSoal, tugasSubmissions, ujian, soal, ujianAttempts } from "@/lib/db/schema";
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

  // 1. Delete ujian and its children
  const classUjianList = await db.select({ id: ujian.id }).from(ujian).where(eq(ujian.kelasId, id));
  for (const u of classUjianList) {
    await db.delete(ujianAttempts).where(eq(ujianAttempts.ujianId, u.id));
    await db.delete(soal).where(eq(soal.ujianId, u.id));
  }
  await db.delete(ujian).where(eq(ujian.kelasId, id));

  // 2. Delete tugas and its children
  const classTugasList = await db.select({ id: tugas.id }).from(tugas).where(eq(tugas.kelasId, id));
  for (const t of classTugasList) {
    await db.delete(tugasSubmissions).where(eq(tugasSubmissions.tugasId, t.id));
    await db.delete(tugasSoal).where(eq(tugasSoal.tugasId, t.id));
  }
  await db.delete(tugas).where(eq(tugas.kelasId, id));

  // 3. Delete materi
  await db.delete(materi).where(eq(materi.kelasId, id));

  // 4. Delete enrollments
  await db.delete(enrollments).where(eq(enrollments.kelasId, id));

  // 5. Delete class
  await db.delete(kelas).where(eq(kelas.id, id));

  revalidatePath("/superadmin/kelas");
  revalidatePath("/admin/kelas");
  revalidatePath("/superadmin");
  revalidatePath("/admin");
  revalidatePath("/teacher");
  revalidatePath("/student");
}
