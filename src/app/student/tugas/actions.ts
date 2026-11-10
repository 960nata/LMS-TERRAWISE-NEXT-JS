"use server";
import { db } from "@/lib/db";
import { tugasSubmissions } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitTugas(formData: FormData) {
  const session = await auth();
  const studentId = (session?.user as any)?.id as string;
  await db.insert(tugasSubmissions).values({
    tugasId: formData.get("tugasId") as string,
    studentId,
    answerText: formData.get("answerText") as string,
  });
  revalidatePath("/student/tugas");
}
