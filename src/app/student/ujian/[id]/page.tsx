import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ujian, soal, ujianAttempts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { submitAttempt } from "./actions";

export const instant = false;

export default async function StudentUjianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const [u] = await db.select().from(ujian).where(eq(ujian.id, id));
  const soalList = await db.select().from(soal).where(eq(soal.ujianId, id));
  const [existing] = await db.select().from(ujianAttempts).where(and(eq(ujianAttempts.ujianId, id), eq(ujianAttempts.studentId, studentId)));
  const submitBound = submitAttempt.bind(null, id);

  if (existing?.submittedAt) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-2 text-2xl font-semibold">{u?.title}</h1>
        <p>Kamu sudah mengerjakan ujian ini. Nilai: {existing.score ?? "belum dinilai"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">{u?.title}</h1>
      <form action={submitBound} className="space-y-6">
        {soalList.map((s, idx) => {
          const options = s.options as string[];
          return (
            <div key={s.id} className="rounded-lg border p-4">
              <p className="mb-2 font-medium">{idx + 1}. {s.question}</p>
              {["A", "B", "C", "D"].map((label, i) => (
                <label key={label} className="mb-1 flex items-center gap-2 text-sm">
                  <input type="radio" name={`soal_${s.id}`} value={label} required />
                  {label}. {options[i]}
                </label>
              ))}
            </div>
          );
        })}
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Submit Ujian</button>
      </form>
    </div>
  );
}
