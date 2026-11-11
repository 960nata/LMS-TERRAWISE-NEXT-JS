import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ujian, soal, ujianAttempts, enrollments } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitAttempt } from "./actions";
import { Badge, Icon, PageHeader, formatDate, inputClass, primaryButtonClass } from "@/components/ui";

export const instant = false;

export default async function StudentUjianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const [u] = await db
    .select({
      id: ujian.id,
      title: ujian.title,
      tipe: ujian.tipe,
      durationMinutes: ujian.durationMinutes,
      startTime: ujian.startTime,
      endTime: ujian.endTime,
    })
    .from(ujian)
    .innerJoin(
      enrollments,
      and(eq(enrollments.kelasId, ujian.kelasId), eq(enrollments.studentId, studentId))
    )
    .where(eq(ujian.id, id))
    .limit(1);

  if (!u) notFound();

  const soalList = await db
    .select()
    .from(soal)
    .where(eq(soal.ujianId, id))
    .orderBy(asc(soal.order), asc(soal.id));

  const [existing] = await db
    .select()
    .from(ujianAttempts)
    .where(and(eq(ujianAttempts.ujianId, id), eq(ujianAttempts.studentId, studentId)));

  const submitBound = submitAttempt.bind(null, id);
  const totalPoin = soalList.reduce((a, s) => a + s.points, 0);

  const tipeLabel =
    u.tipe === "MULTIPLE_CHOICE"
      ? "Pilihan Ganda"
      : u.tipe === "ESSAY"
      ? "Essay"
      : "Campuran (PG & Essay)";

  const back = (
    <Link
      href="/student/ujian"
      className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
    >
      <Icon name="arrow_back" size={16} /> Kembali ke Ujian Saya
    </Link>
  );

  if (existing?.submittedAt) {
    const studentAnswers = (existing.answers as Record<string, string>) || {};
    return (
      <>
        {back}
        <PageHeader
          title={u.title}
          description={`Tipe: ${tipeLabel} · Selesai dikerjakan ${formatDate(existing.submittedAt, true)}`}
        />
        <div className="max-w-md rounded-2xl border border-black p-6 md:p-8 bg-white mb-8">
          <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Nilai Akhir Kamu</p>
          <p className="text-5xl font-extrabold tracking-tight text-black">
            {existing.score ?? "-"}
            <span className="text-xl text-gray-400"> / {totalPoin}</span>
          </p>
          <p className="mt-4 text-xs text-gray-500">
            {u.tipe === "MULTIPLE_CHOICE"
              ? "Ujian Pilihan Ganda telah dinilai otomatis."
              : "Nilai telah dikoreksi oleh guru pengampu."}
          </p>
          {existing.feedback && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700">
              <span className="font-bold text-black block mb-1">Catatan Guru:</span>
              <p>{existing.feedback}</p>
            </div>
          )}
        </div>

        {/* Review Jawaban */}
        <section className="space-y-4 max-w-3xl">
          <h3 className="font-bold text-sm tracking-widest uppercase text-gray-400">Lembar Jawaban Kamu:</h3>
          {soalList.map((s, idx) => {
            const options = (s.options as string[]) ?? [];
            const ans = studentAnswers[s.id];
            const isMC = s.type === "MULTIPLE_CHOICE";
            const isCorrect = isMC && ans === s.correctAnswer;
            return (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-bold text-black">
                    <span className="mr-2 text-gray-400">{idx + 1}.</span>
                    {s.question}
                  </p>
                  {isMC && (
                    <Badge tone={isCorrect ? "green" : "red"}>{isCorrect ? "Benar" : "Salah"}</Badge>
                  )}
                </div>

                {isMC ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {options.map((opt, i) => {
                      const letter = ["A", "B", "C", "D"][i];
                      const isChosen = ans === letter;
                      return (
                        <div
                          key={letter}
                          className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs ${
                            isChosen
                              ? isCorrect
                                ? "border-green-600 bg-green-50 text-green-900 font-bold"
                                : "border-red-600 bg-red-50 text-red-900 font-bold"
                              : "border-gray-100 bg-gray-50 text-gray-600"
                          }`}
                        >
                          <span className="font-bold">{letter}.</span>
                          <span>{opt}</span>
                          {isChosen && <span className="ml-auto text-[10px] font-bold uppercase">(Pilihanmu)</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs border border-gray-100">
                    <span className="font-bold text-gray-500 block mb-1">Jawaban Essay yang kamu tulis:</span>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{ans || "-"}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </>
    );
  }

  if (new Date() < u.startTime || new Date() > u.endTime) {
    return (
      <>
        {back}
        <PageHeader title={u.title} description="Ujian belum dibuka atau sudah melewati batas waktu berakhir." />
      </>
    );
  }

  return (
    <>
      {back}
      <PageHeader
        title={u.title}
        description={`Tipe: ${tipeLabel} · ${soalList.length} Soal · Durasi: ${u.durationMinutes} Menit · Berakhir: ${formatDate(u.endTime)}`}
      />

      <form action={submitBound} className="max-w-3xl space-y-6">
        {soalList.map((s, idx) => {
          const options = (s.options as string[]) ?? [];
          const isMC = s.type === "MULTIPLE_CHOICE";
          return (
            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:rounded-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <p className="text-sm font-bold text-black">
                  <span className="mr-2 text-gray-400 font-black">{String(idx + 1).padStart(2, "0")}.</span>
                  {s.question}
                </p>
                <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 whitespace-nowrap">
                  {s.points} POIN · {isMC ? "PG" : "ESSAY"}
                </span>
              </div>

              {isMC ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {["A", "B", "C", "D"].map((label, i) => (
                    <label
                      key={label}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-xs transition-colors hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
                    >
                      <input type="radio" name={`soal_${s.id}`} value={label} required className="sr-only" />
                      <span className="font-bold text-xs">{label}</span>
                      <span>{options?.[i]}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <textarea
                    name={`soal_${s.id}`}
                    placeholder="Tuliskan uraian jawaban essay Anda di sini..."
                    required
                    rows={4}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          );
        })}

        {soalList.length > 0 && (
          <div className="pt-2">
            <button type="submit" className={primaryButtonClass}>
              <Icon name="send" size={16} /> Kumpulkan Jawaban Ujian
            </button>
          </div>
        )}
      </form>
    </>
  );
}
