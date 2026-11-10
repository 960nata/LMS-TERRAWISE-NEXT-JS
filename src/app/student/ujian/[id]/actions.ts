"use server";
import { db } from "@/lib/db";
import { soal, ujianAttempts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitAttempt(ujianId: string, formData: FormData) {
  const session = await auth();
  const studentId = (session?.user as any)?.id as string;
  const soalList = await db.select().from(soal).where(eq(soal.ujianId, ujianId));

  let score = 0;
  const answers: Record<string, string> = {};
  for (const s of soalList) {
    const answer = formData.get(`soal_${s.id}`) as string;
    answers[s.id] = answer;
    if (answer === s.correctAnswer) score += s.points;
  }

  await db.insert(ujianAttempts).values({ ujianId, studentId, answers, score, submittedAt: new Date() });
  revalidatePath(`/student/ujian/${ujianId}`);
}
