"use server";
import { db } from "@/lib/db";
import { ujian, soal, notifications, enrollments } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createUjian(formData: FormData) {
  const session = await auth();
  const authorId = (session?.user as any)?.id as string;
  const kelasId = formData.get("kelasId") as string;
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
}

export async function addSoal(ujianId: string, formData: FormData) {
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
