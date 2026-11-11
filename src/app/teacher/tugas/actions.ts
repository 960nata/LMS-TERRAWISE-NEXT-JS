"use server";
import { db } from "@/lib/db";
import { tugas, tugasSubmissions, notifications, enrollments } from "@/lib/db/schema";
import { requireClassManager } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createTugas(formData: FormData) {
  const kelasId = String(formData.get("kelasId") ?? "");
  const { id: authorId } = await requireClassManager(kelasId);
  const title = formData.get("title") as string;

  await db.insert(tugas).values({
    title,
    description: formData.get("description") as string,
    dueDate: new Date(formData.get("dueDate") as string),
    maxScore: Number(formData.get("maxScore")) || 100,
    kelasId,
    authorId,
  });

  const students = await db.select({ studentId: enrollments.studentId }).from(enrollments).where(eq(enrollments.kelasId, kelasId));
  if (students.length > 0) {
    await db.insert(notifications).values(
      students.map((s) => ({ userId: s.studentId, title: "Tugas Baru", message: `Ada tugas baru: ${title}` }))
    );
  }
  revalidatePath("/teacher/tugas");
  revalidatePath("/admin/tugas");
  revalidatePath("/superadmin/tugas");
  revalidatePath("/student/tugas");
}

export async function gradeSubmission(submissionId: string, score: number, feedback: string) {
  const [entry] = await db.select({ kelasId: tugas.kelasId, maxScore: tugas.maxScore }).from(tugasSubmissions).innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id)).where(eq(tugasSubmissions.id, submissionId)).limit(1);
  if (!entry) throw new Error("Pengumpulan tidak ditemukan");
  await requireClassManager(entry.kelasId);
  if (!Number.isFinite(score) || score < 0 || score > entry.maxScore || feedback.length > 5000) throw new Error("Nilai atau feedback tidak valid");
  await db.update(tugasSubmissions).set({ score, feedback, gradedAt: new Date() }).where(eq(tugasSubmissions.id, submissionId));
  revalidatePath("/teacher/tugas");
  revalidatePath("/admin/tugas");
  revalidatePath("/superadmin/tugas");
  revalidatePath("/student/tugas");
}

export async function gradeSubmissionAction(formData: FormData) {
  const submissionId = formData.get("submissionId") as string;
  const score = Number(formData.get("score"));
  const feedback = (formData.get("feedback") as string) ?? "";
  await gradeSubmission(submissionId, score, feedback);
}

export async function deleteTugas(formData: FormData) {
  const tugasId = formData.get("tugasId") as string;
  const [entry] = await db.select({ kelasId: tugas.kelasId }).from(tugas).where(eq(tugas.id, tugasId)).limit(1);
  if (!entry) throw new Error("Tugas tidak ditemukan");
  await requireClassManager(entry.kelasId);
  await db.delete(tugasSubmissions).where(eq(tugasSubmissions.tugasId, tugasId));
  await db.delete(tugas).where(eq(tugas.id, tugasId));
  revalidatePath("/teacher/tugas");
  revalidatePath("/admin/tugas");
  revalidatePath("/superadmin/tugas");
  revalidatePath("/student/tugas");
}

