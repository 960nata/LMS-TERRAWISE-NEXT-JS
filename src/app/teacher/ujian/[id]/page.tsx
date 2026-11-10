import { db } from "@/lib/db";
import { ujian, soal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addSoal } from "../actions";

export default async function UjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [u] = await db.select().from(ujian).where(eq(ujian.id, id));
  const soalList = await db.select().from(soal).where(eq(soal.ujianId, id));
  const addSoalBound = addSoal.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">{u?.title}</h1>
      <p className="mb-6 text-sm text-gray-500">{soalList.length} soal</p>
      <form action={addSoalBound} className="mb-8 space-y-3 rounded-lg border p-4">
        <textarea name="question" placeholder="Pertanyaan" required rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="optionA" placeholder="Pilihan A" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="optionB" placeholder="Pilihan B" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="optionC" placeholder="Pilihan C" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="optionD" placeholder="Pilihan D" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="correctAnswer" placeholder="Jawaban benar (A/B/C/D)" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="points" type="number" placeholder="Poin" defaultValue={1} className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Tambah Soal</button>
      </form>
      <div className="grid gap-2">
        {soalList.map((s, idx) => (
          <div key={s.id} className="rounded-lg border p-3 text-sm">
            <p className="font-medium">{idx + 1}. {s.question}</p>
            <p className="text-gray-500">Jawaban benar: {s.correctAnswer} ({s.points} poin)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
