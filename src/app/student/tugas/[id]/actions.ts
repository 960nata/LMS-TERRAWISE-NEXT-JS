"use server";
import { db } from "@/lib/db";
import { tugas, tugasSoal, tugasSubmissions, enrollments } from "@/lib/db/schema";
import { requireUser } from "@/lib/access";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitTugasQuestions(tugasId: string, formData: FormData) {
  const { id: studentId } = await requireUser(["STUDENT"]);
  const [task] = await db
    .select({
      id: tugas.id,
      dueDate: tugas.dueDate,
      maxScore: tugas.maxScore,
      tipe: tugas.tipe,
    })
    .from(tugas)
    .innerJoin(enrollments, and(eq(enrollments.kelasId, tugas.kelasId), eq(enrollments.studentId, studentId)))
    .where(eq(tugas.id, tugasId))
    .limit(1);

  if (!task) throw new Error("Tugas tidak ditemukan atau Anda tidak terdaftar di kelas ini");
  if (new Date() > task.dueDate) throw new Error("Batas waktu pengumpulan tugas sudah berakhir");

  const soalList = await db.select().from(tugasSoal).where(eq(tugasSoal.tugasId, tugasId));
  const answers: Record<string, string> = {};
  let rawScore = 0;
  let totalPoints = 0;

  for (const s of soalList) {
    totalPoints += s.points;
    const ans = (formData.get(`soal_${s.id}`) as string)?.trim() ?? "";
    answers[s.id] = ans;

    if (s.type === "MULTIPLE_CHOICE" && ans.toUpperCase() === s.correctAnswer?.toUpperCase()) {
      rawScore += s.points;
    }
  }

  // If purely MULTIPLE_CHOICE, auto-calculate scaled score based on maxScore
  let finalScore: number | null = null;
  if (task.tipe === "MULTIPLE_CHOICE") {
    finalScore = totalPoints > 0 ? Math.round((rawScore / totalPoints) * task.maxScore) : 100;
  }

  await db.insert(tugasSubmissions).values({
    tugasId,
    studentId,
    answers,
    score: finalScore,
    answerText:
      task.tipe === "MULTIPLE_CHOICE"
        ? `Kuis Pilihan Ganda: Skor otomatis ${finalScore}/${task.maxScore}`
        : "Jawaban essay telah dikumpulkan dan menunggu koreksi guru.",
    submittedAt: new Date(),
    gradedAt: task.tipe === "MULTIPLE_CHOICE" ? new Date() : null,
  });

  revalidatePath(`/student/tugas/${tugasId}`);
  revalidatePath("/student/tugas");
  revalidatePath("/teacher/tugas");
  revalidatePath(`/teacher/tugas/${tugasId}`);
}
