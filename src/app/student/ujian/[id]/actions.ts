"use server";
import { db } from "@/lib/db";
import { soal, ujianAttempts, ujian, enrollments } from "@/lib/db/schema";
import { requireUser } from "@/lib/access";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitAttempt(ujianId: string, formData: FormData) {
  const { id: studentId } = await requireUser(["STUDENT"]);
  const [exam] = await db
    .select({ startTime: ujian.startTime, endTime: ujian.endTime, tipe: ujian.tipe })
    .from(ujian)
    .innerJoin(enrollments, and(eq(enrollments.kelasId, ujian.kelasId), eq(enrollments.studentId, studentId)))
    .where(eq(ujian.id, ujianId))
    .limit(1);

  const now = new Date();
  if (!exam || now < exam.startTime || now > exam.endTime)
    throw new Error("Ujian tidak tersedia saat ini atau telah berakhir");

  const soalList = await db.select().from(soal).where(eq(soal.ujianId, ujianId));

  let score = 0;
  const answers: Record<string, string> = {};

  for (const s of soalList) {
    const answer = (formData.get(`soal_${s.id}`) as string)?.trim() ?? "";
    answers[s.id] = answer;

    if (s.type === "MULTIPLE_CHOICE" && answer.toUpperCase() === s.correctAnswer?.toUpperCase()) {
      score += s.points;
    }
  }

  await db.insert(ujianAttempts).values({
    ujianId,
    studentId,
    answers,
    score,
    submittedAt: new Date(),
  });

  revalidatePath(`/student/ujian/${ujianId}`);
  revalidatePath("/student/ujian");
  revalidatePath("/teacher/ujian");
  revalidatePath(`/teacher/ujian/${ujianId}`);
}
