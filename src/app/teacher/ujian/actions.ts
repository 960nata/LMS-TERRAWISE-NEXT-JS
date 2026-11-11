"use server";
import { db } from "@/lib/db";
import { ujian, soal, notifications, enrollments } from "@/lib/db/schema";
import { requireClassManager } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createUjian(formData: FormData) {
  const kelasId = String(formData.get("kelasId") ?? "");
  const { id: authorId } = await requireClassManager(kelasId);
  const title = formData.get("title") as string;

  await db.insert(ujian).values({
    title,
    startTime: new Date(formData.get("startTime") as string),
    endTime: new Date(formData.get("endTime") as string),
    durationMinutes: Number(formData.get("durationMinutes")),
    kelasId,
    authorId,
  });

  const students = await db.select({ studentId: enrollments.studentId }).from(enrollments).where(eq(enrollments.kelasId, kelasId));
  if (students.length > 0) {
    await db.insert(notifications).values(
      students.map((s) => ({ userId: s.studentId, title: "Ujian Baru", message: `Ada ujian baru: ${title}` }))
    );
  }
  revalidatePath("/teacher/ujian");
  revalidatePath("/admin/ujian");
  revalidatePath("/superadmin/ujian");
  revalidatePath("/student/ujian");
}

export async function addSoal(ujianId: string, formData: FormData) {
  const [exam] = await db.select({ kelasId: ujian.kelasId }).from(ujian).where(eq(ujian.id, ujianId)).limit(1);
  if (!exam) throw new Error("Ujian tidak ditemukan");
  await requireClassManager(exam.kelasId);
  const options = [
    formData.get("optionA") as string,
    formData.get("optionB") as string,
    formData.get("optionC") as string,
    formData.get("optionD") as string,
  ];
  await db.insert(soal).values({
    ujianId,
    question: formData.get("question") as string,
    options,
    correctAnswer: formData.get("correctAnswer") as string,
    points: Number(formData.get("points")) || 1,
  });
  revalidatePath(`/teacher/ujian/${ujianId}`);
}

export async function deleteUjian(formData: FormData) {
  const ujianId = formData.get("ujianId") as string;
  const [exam] = await db.select({ kelasId: ujian.kelasId }).from(ujian).where(eq(ujian.id, ujianId)).limit(1);
  if (!exam) throw new Error("Ujian tidak ditemukan");
  await requireClassManager(exam.kelasId);
  await db.delete(soal).where(eq(soal.ujianId, ujianId));
  await db.delete(ujian).where(eq(ujian.id, ujianId));
  revalidatePath("/teacher/ujian");
  revalidatePath("/admin/ujian");
  revalidatePath("/superadmin/ujian");
  revalidatePath("/student/ujian");
  revalidatePath("/student/ujian");
}

export async function deleteSoal(ujianId: string, soalId: string) {
  const [exam] = await db.select({ kelasId: ujian.kelasId }).from(ujian).where(eq(ujian.id, ujianId)).limit(1);
  if (!exam) throw new Error("Ujian tidak ditemukan");
  await requireClassManager(exam.kelasId);
  await db.delete(soal).where(eq(soal.id, soalId));
  revalidatePath(`/teacher/ujian/${ujianId}`);
}

