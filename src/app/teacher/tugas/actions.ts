"use server";
import { db } from "@/lib/db";
import { tugas, tugasSoal, tugasSubmissions, notifications, enrollments } from "@/lib/db/schema";
import { requireClassManager } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function createTugas(formData: FormData) {
  const kelasId = String(formData.get("kelasId") ?? "");
  const { id: authorId, role } = await requireClassManager(kelasId);
  const title = formData.get("title") as string;
  const rawTipe = (formData.get("tipe") as string) || "MANDIRI";
  const tipe = (["MULTIPLE_CHOICE", "ESSAY", "MANDIRI", "KELOMPOK"].includes(rawTipe)
    ? rawTipe
    : "MANDIRI") as "MULTIPLE_CHOICE" | "ESSAY" | "MANDIRI" | "KELOMPOK";

  const [newTask] = await db
    .insert(tugas)
    .values({
      title,
      description: formData.get("description") as string,
      tipe,
      dueDate: new Date(formData.get("dueDate") as string),
      maxScore: Number(formData.get("maxScore")) || 100,
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
            if (tipe === "MULTIPLE_CHOICE") {
              await db.insert(tugasSoal).values({
                tugasId: newTask.id,
                type: "MULTIPLE_CHOICE",
                question: q.question,
                options: [q.optionA || "", q.optionB || "", q.optionC || "", q.optionD || ""],
                correctAnswer: (q.correctAnswer || "A").toUpperCase(),
                points: Number(q.points) || 10,
                order: i + 1,
              });
            } else if (tipe === "ESSAY") {
              await db.insert(tugasSoal).values({
                tugasId: newTask.id,
                type: "ESSAY",
                question: q.question,
                points: Number(q.points) || 10,
                order: i + 1,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to insert initial questionsData:", err);
    }
  }

  // If groupConfig is provided for KELOMPOK
  const groupConfigRaw = formData.get("groupConfig") as string | null;
  if (groupConfigRaw) {
    try {
      const groupConfig = JSON.parse(groupConfigRaw);
      await db.insert(tugasSoal).values({
        tugasId: newTask.id,
        type: "ESSAY",
        question: "__GROUP_CONFIG__",
        options: groupConfig,
        points: 0,
        order: 0,
      });
    } catch (err) {
      console.error("Failed to insert groupConfig:", err);
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
        ? "Soal Essay"
        : tipe === "KELOMPOK"
        ? "Proyek Kelompok"
        : "Tugas Mandiri";
    await db.insert(notifications).values(
      students.map((s) => ({
        userId: s.studentId,
        title: `Tugas Baru [${tipeLabel}]`,
        message: `Tugas "${title}" telah diterbitkan untuk kelas Anda.`,
      }))
    );
  }

  revalidatePath("/teacher/tugas");
  revalidatePath("/admin/tugas");
  revalidatePath("/superadmin/tugas");
  revalidatePath("/student/tugas");

  const basePath = role === "SUPERADMIN" ? "/superadmin" : role === "ADMIN" ? "/admin" : "/teacher";
  redirect(`${basePath}/tugas/${newTask.id}`);
}

export async function addTugasSoal(tugasId: string, formData: FormData) {
  const [task] = await db
    .select({ kelasId: tugas.kelasId, tipe: tugas.tipe })
    .from(tugas)
    .where(eq(tugas.id, tugasId))
    .limit(1);

  if (!task) throw new Error("Tugas tidak ditemukan");
  await requireClassManager(task.kelasId);

  const type = ((formData.get("type") as string) || task.tipe === "ESSAY" ? "ESSAY" : "MULTIPLE_CHOICE") as
    | "MULTIPLE_CHOICE"
    | "ESSAY";
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
    await db.insert(tugasSoal).values({
      tugasId,
      type: "MULTIPLE_CHOICE",
      question,
      options,
      correctAnswer,
      points,
    });
  } else {
    await db.insert(tugasSoal).values({
      tugasId,
      type: "ESSAY",
      question,
      points,
    });
  }

  revalidatePath(`/teacher/tugas/${tugasId}`);
  revalidatePath(`/admin/tugas/${tugasId}`);
  revalidatePath(`/superadmin/tugas/${tugasId}`);
  revalidatePath("/teacher/tugas");
}

export async function deleteTugasSoal(tugasId: string, soalId: string) {
  const [task] = await db
    .select({ kelasId: tugas.kelasId })
    .from(tugas)
    .where(eq(tugas.id, tugasId))
    .limit(1);

  if (!task) throw new Error("Tugas tidak ditemukan");
  await requireClassManager(task.kelasId);

  await db.delete(tugasSoal).where(eq(tugasSoal.id, soalId));
  revalidatePath(`/teacher/tugas/${tugasId}`);
  revalidatePath(`/admin/tugas/${tugasId}`);
  revalidatePath(`/superadmin/tugas/${tugasId}`);
  revalidatePath("/teacher/tugas");
}

export async function gradeSubmission(submissionId: string, score: number, feedback: string) {
  const [entry] = await db
    .select({ kelasId: tugas.kelasId, maxScore: tugas.maxScore })
    .from(tugasSubmissions)
    .innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id))
    .where(eq(tugasSubmissions.id, submissionId))
    .limit(1);

  if (!entry) throw new Error("Pengumpulan tidak ditemukan");
  await requireClassManager(entry.kelasId);
  if (!Number.isFinite(score) || score < 0 || score > entry.maxScore || feedback.length > 5000)
    throw new Error("Nilai atau feedback tidak valid");

  await db
    .update(tugasSubmissions)
    .set({ score, feedback, gradedAt: new Date() })
    .where(eq(tugasSubmissions.id, submissionId));

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
  const [entry] = await db
    .select({ kelasId: tugas.kelasId })
    .from(tugas)
    .where(eq(tugas.id, tugasId))
    .limit(1);

  if (!entry) throw new Error("Tugas tidak ditemukan");
  await requireClassManager(entry.kelasId);

  await db.delete(tugasSoal).where(eq(tugasSoal.tugasId, tugasId));
  await db.delete(tugasSubmissions).where(eq(tugasSubmissions.tugasId, tugasId));
  await db.delete(tugas).where(eq(tugas.id, tugasId));

  revalidatePath("/teacher/tugas");
  revalidatePath("/admin/tugas");
  revalidatePath("/superadmin/tugas");
  revalidatePath("/student/tugas");
}
