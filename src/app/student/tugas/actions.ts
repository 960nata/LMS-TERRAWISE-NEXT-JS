"use server";
import { db } from "@/lib/db";
import { tugasSubmissions, tugas, enrollments } from "@/lib/db/schema";
import { requireUser } from "@/lib/access";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitTugas(formData: FormData) {
  const { id: studentId } = await requireUser(["STUDENT"]);
  const tugasId = String(formData.get("tugasId") ?? "");
  const [assignment] = await db
    .select({ dueDate: tugas.dueDate })
    .from(tugas)
    .innerJoin(enrollments, and(eq(enrollments.kelasId, tugas.kelasId), eq(enrollments.studentId, studentId)))
    .where(eq(tugas.id, tugasId))
    .limit(1);

  if (!assignment || new Date() > assignment.dueDate)
    throw new Error("Tugas tidak tersedia atau sudah melewati batas waktu");

  const answerText = String(formData.get("answerText") ?? "").trim();
  const fileUrl = String(formData.get("fileUrl") ?? "").trim() || null;
  const groupName = String(formData.get("groupName") ?? "").trim() || null;
  const groupMembers = String(formData.get("groupMembers") ?? "").trim() || null;

  if (!answerText || answerText.length > 20000) throw new Error("Jawaban tidak valid");

  await db.insert(tugasSubmissions).values({
    tugasId,
    studentId,
    answerText,
    fileUrl,
    groupName,
    groupMembers,
  });

  revalidatePath("/student/tugas");
  revalidatePath(`/student/tugas/${tugasId}`);
  revalidatePath("/teacher/tugas");
  revalidatePath(`/teacher/tugas/${tugasId}`);
  revalidatePath("/admin/tugas");
  revalidatePath(`/admin/tugas/${tugasId}`);
  revalidatePath("/superadmin/tugas");
  revalidatePath(`/superadmin/tugas/${tugasId}`);
}
