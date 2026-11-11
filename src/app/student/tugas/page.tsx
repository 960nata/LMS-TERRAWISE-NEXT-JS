import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, kelas, enrollments, tugasSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { submitTugas } from "./actions";

export const instant = false;

export default async function StudentTugasPage() {
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const rows = await db
    .select({ id: tugas.id, title: tugas.title, description: tugas.description, dueDate: tugas.dueDate, kelasName: kelas.name })
    .from(enrollments)
    .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
    .innerJoin(tugas, eq(tugas.kelasId, kelas.id))
    .where(eq(enrollments.studentId, studentId));

  const mySubmissions = await db.select().from(tugasSubmissions).where(eq(tugasSubmissions.studentId, studentId));
  const submissionMap = new Map(mySubmissions.map((s) => [s.tugasId, s]));

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Tugas</h1>
      <div className="grid gap-4">
        {rows.map((t) => {
          const sub = submissionMap.get(t.id);
          return (
            <div key={t.id} className="rounded-lg border p-4">
              <p className="text-xs text-gray-400">{t.kelasName}</p>
              <p className="font-medium">{t.title}</p>
              <p className="mb-2 text-sm text-gray-500">{t.description}</p>
              <p className="mb-3 text-xs text-gray-400">Deadline: {new Date(t.dueDate).toLocaleString("id-ID")}</p>
              {sub ? (
                <div className="rounded-md bg-gray-50 p-3 text-sm">
                  <p>Status: {sub.score != null ? `Dinilai: ${sub.score}` : "Menunggu penilaian"}</p>
                  {sub.feedback && <p className="text-gray-500">Feedback: {sub.feedback}</p>}
                </div>
              ) : (
                <form action={submitTugas} className="space-y-2">
                  <input type="hidden" name="tugasId" value={t.id} />
                  <textarea name="answerText" placeholder="Jawaban kamu" required rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
                  <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Submit Tugas</button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
