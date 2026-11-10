"use server";
import { db } from "@/lib/db";
import { tugas, tugasSubmissions, notifications, enrollments } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createTugas(formData: FormData) {
  const session = await auth();
  const authorId = (session?.user as any)?.id as string;
  const kelasId = formData.get("kelasId") as string;
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
}

export async function gradeSubmission(submissionId: string, score: number, feedback: string) {
  await db.update(tugasSubmissions).set({ score, feedback, gradedAt: new Date() }).where(eq(tugasSubmissions.id, submissionId));
  revalidatePath("/teacher/tugas");
}
