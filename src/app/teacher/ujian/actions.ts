"use server";
import { db } from "@/lib/db";
import { ujian, soal, ujianAttempts, notifications, enrollments } from "@/lib/db/schema";
import { requireClassManager } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function createUjian(formData: FormData) {
  const kelasId = String(formData.get("kelasId") ?? "");
  const { id: authorId, role } = await requireClassManager(kelasId);
  const title = formData.get("title") as string;
  const rawTipe = (formData.get("tipe") as string) || "MULTIPLE_CHOICE";
  const tipe = (["MULTIPLE_CHOICE", "ESSAY", "MIXED"].includes(rawTipe)
    ? rawTipe
    : "MULTIPLE_CHOICE") as "MULTIPLE_CHOICE" | "ESSAY" | "MIXED";

  const [newExam] = await db
    .insert(ujian)
    .values({
      title,
      tipe,
      startTime: new Date(formData.get("startTime") as string),
      endTime: new Date(formData.get("endTime") as string),
      durationMinutes: Number(formData.get("durationMinutes")),
      kelasId,
      authorId,
    })
    .returning();

  // If questionsData is provided directly from the interactive creation wizard
  const questionsDataRaw = formData.get("questionsData") as string | null;
  if (questionsDataRaw) {
    try {
      const questionsList = JSON.parse(questionsDataRaw);
      if (Array.isArray(questionsList) && questionsList.length > 0) {
        for (let i = 0; i < questionsList.length; i++) {
          const q = questionsList[i];
          if (q.question && q.question.trim().length > 0) {
            const itemType = q.type === "ESSAY" || tipe === "ESSAY" ? "ESSAY" : "MULTIPLE_CHOICE";
            if (itemType === "MULTIPLE_CHOICE") {
              await db.insert(soal).values({
                ujianId: newExam.id,
                type: "MULTIPLE_CHOICE",
                question: q.question,
                options: [q.optionA || "", q.optionB || "", q.optionC || "", q.optionD || ""],
                correctAnswer: (q.correctAnswer || "A").toUpperCase(),
                points: Number(q.points) || 10,
                order: i + 1,
              });
            } else {
              await db.insert(soal).values({
                ujianId: newExam.id,
                type: "ESSAY",
                question: q.question,
                points: Number(q.points) || 10,
                rubric: q.rubric || null,
                order: i + 1,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse questionsData for exam:", err);
    }
  }

  const students = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(eq(enrollments.kelasId, kelasId));

  if (students.length > 0) {
    const tipeLabel =
      tipe === "MULTIPLE_CHOICE"
        ? "Pilihan Ganda"
        : tipe === "ESSAY"
        ? "Essay"
        : "Campuran (PG & Essay)";
    await db.insert(notifications).values(
      students.map((s) => ({
        userId: s.studentId,
        title: `Ujian Baru [${tipeLabel}]`,
        message: `Ujian "${title}" telah dijadwalkan untuk kelas Anda.`,
      }))
    );
  }

  revalidatePath("/teacher/ujian");
  revalidatePath("/admin/ujian");
  revalidatePath("/superadmin/ujian");
  revalidatePath("/student/ujian");

  const basePath = role === "SUPERADMIN" ? "/superadmin" : role === "ADMIN" ? "/admin" : "/teacher";
  redirect(`${basePath}/ujian/${newExam.id}`);
}

export async function addSoal(ujianId: string, formData: FormData) {
  const [exam] = await db
    .select({ kelasId: ujian.kelasId, tipe: ujian.tipe })
    .from(ujian)
    .where(eq(ujian.id, ujianId))
    .limit(1);

  if (!exam) throw new Error("Ujian tidak ditemukan");
  await requireClassManager(exam.kelasId);

  const rawType = (formData.get("type") as string) || (exam.tipe === "ESSAY" ? "ESSAY" : "MULTIPLE_CHOICE");
  const type = (rawType === "ESSAY" ? "ESSAY" : "MULTIPLE_CHOICE") as "MULTIPLE_CHOICE" | "ESSAY";
  const question = formData.get("question") as string;
  const points = Number(formData.get("points")) || 10;

  if (type === "MULTIPLE_CHOICE") {
    const options = [
      formData.get("optionA") as string,
      formData.get("optionB") as string,
      formData.get("optionC") as string,
      formData.get("optionD") as string,
    ];
    const correctAnswer = (formData.get("correctAnswer") as string)?.toUpperCase();
    await db.insert(soal).values({
      ujianId,
      type: "MULTIPLE_CHOICE",
      question,
      options,
      correctAnswer,
      points,
    });
  } else {
    const rubric = (formData.get("rubric") as string) ?? null;
    await db.insert(soal).values({
      ujianId,
      type: "ESSAY",
      question,
      points,
      rubric,
    });
  }

  revalidatePath(`/teacher/ujian/${ujianId}`);
  revalidatePath(`/admin/ujian/${ujianId}`);
  revalidatePath(`/superadmin/ujian/${ujianId}`);
  revalidatePath("/teacher/ujian");
}

export async function deleteUjian(formData: FormData) {
  const ujianId = formData.get("ujianId") as string;
  const [exam] = await db
    .select({ kelasId: ujian.kelasId })
    .from(ujian)
    .where(eq(ujian.id, ujianId))
    .limit(1);

  if (!exam) throw new Error("Ujian tidak ditemukan");
  await requireClassManager(exam.kelasId);

  await db.delete(ujianAttempts).where(eq(ujianAttempts.ujianId, ujianId));
  await db.delete(soal).where(eq(soal.ujianId, ujianId));
  await db.delete(ujian).where(eq(ujian.id, ujianId));

  revalidatePath("/teacher/ujian");
  revalidatePath("/admin/ujian");
  revalidatePath("/superadmin/ujian");
  revalidatePath("/student/ujian");
}

export async function deleteSoal(ujianId: string, soalId: string) {
  const [exam] = await db
    .select({ kelasId: ujian.kelasId })
    .from(ujian)
    .where(eq(ujian.id, ujianId))
    .limit(1);

  if (!exam) throw new Error("Ujian tidak ditemukan");
  await requireClassManager(exam.kelasId);

  await db.delete(soal).where(eq(soal.id, soalId));
  revalidatePath(`/teacher/ujian/${ujianId}`);
  revalidatePath(`/admin/ujian/${ujianId}`);
  revalidatePath(`/superadmin/ujian/${ujianId}`);
  revalidatePath("/teacher/ujian");
}

export async function gradeExamAttempt(formData: FormData) {
  const attemptId = formData.get("attemptId") as string;
  const score = Number(formData.get("score"));
  const feedback = (formData.get("feedback") as string) ?? "";

  const [attempt] = await db
    .select({ ujianId: ujianAttempts.ujianId })
    .from(ujianAttempts)
    .where(eq(ujianAttempts.id, attemptId))
    .limit(1);

  if (!attempt) throw new Error("Percobaan ujian tidak ditemukan");
  const [exam] = await db
    .select({ kelasId: ujian.kelasId })
    .from(ujian)
    .where(eq(ujian.id, attempt.ujianId))
    .limit(1);

  if (!exam) throw new Error("Ujian tidak ditemukan");
  await requireClassManager(exam.kelasId);

  await db
    .update(ujianAttempts)
    .set({ score, feedback })
    .where(eq(ujianAttempts.id, attemptId));

  revalidatePath(`/teacher/ujian/${attempt.ujianId}`);
  revalidatePath(`/admin/ujian/${attempt.ujianId}`);
  revalidatePath(`/superadmin/ujian/${attempt.ujianId}`);
}
