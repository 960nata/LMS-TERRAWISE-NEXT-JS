import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, kelas, tugasSoal, tugasSubmissions, enrollments } from "@/lib/db/schema";
import { asc, eq, and } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitTugasQuestions } from "./actions";
import { Badge, Icon, PageHeader, formatDate, inputClass, primaryButtonClass } from "@/components/ui";

export const instant = false;

export default async function StudentTugasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const [t] = await db
    .select({
      id: tugas.id,
      title: tugas.title,
      description: tugas.description,
      tipe: tugas.tipe,
      dueDate: tugas.dueDate,
      maxScore: tugas.maxScore,
      kelasName: kelas.name,
    })
    .from(tugas)
    .innerJoin(enrollments, and(eq(enrollments.kelasId, tugas.kelasId), eq(enrollments.studentId, studentId)))
    .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
    .where(eq(tugas.id, id))
    .limit(1);

  if (!t) notFound();

  const soalList = await db
    .select()
    .from(tugasSoal)
    .where(eq(tugasSoal.tugasId, id))
    .orderBy(asc(tugasSoal.order), asc(tugasSoal.id));

  const [existing] = await db
    .select()
    .from(tugasSubmissions)
    .where(and(eq(tugasSubmissions.tugasId, id), eq(tugasSubmissions.studentId, studentId)))
    .limit(1);

  const submitBound = submitTugasQuestions.bind(null, id);

  const backLink = (
    <Link
      href="/student/tugas"
      className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
    >
      <Icon name="arrow_back" size={16} /> Kembali ke Tugas Saya
    </Link>
  );

  const tipeLabel =
    t.tipe === "MULTIPLE_CHOICE"
      ? "Pilihan Ganda"
      : t.tipe === "ESSAY"
      ? "Soal Essay"
      : t.tipe === "KELOMPOK"
      ? "Proyek Kelompok"
      : "Tugas Mandiri";

  // Jika sudah dikerjakan / disubmit
  if (existing?.submittedAt) {
    const studentAnswers = (existing.answers as Record<string, string>) || {};
    return (
      <>
        {backLink}
        <PageHeader
          title={t.title}
          description={`Kelas: ${t.kelasName} · Tipe: ${tipeLabel} · Dikumpulkan: ${formatDate(existing.submittedAt, true)}`}
        />

        {/* Skor Card */}
        <div className="max-w-md rounded-2xl border border-black p-6 md:p-8 bg-white mb-8">
          <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Status &amp; Nilai</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-black">
              {existing.score !== null ? existing.score : "-"}
            </span>
            <span className="text-xl text-gray-400 font-bold">/ {t.maxScore}</span>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            {existing.score !== null
              ? "Tugas telah dinilai."
              : "Jawaban tersimpan dan menunggu koreksi/penilaian dari guru."}
          </p>
          {existing.feedback && (
            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
              <span className="font-bold text-black block mb-1">Catatan Guru:</span>
              <p>{existing.feedback}</p>
            </div>
          )}
        </div>

        {/* Lembar Hasil Pengerjaan */}
        <section className="space-y-4 max-w-3xl">
          <h3 className="font-bold text-sm tracking-widest uppercase text-gray-400">Lembar Jawaban Kamu:</h3>
          {soalList.map((s, idx) => {
            const options = (s.options as string[]) ?? [];
            const ans = studentAnswers[s.id];
            const isCorrect = s.type === "MULTIPLE_CHOICE" && ans === s.correctAnswer;
            return (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-sm font-bold text-black">
                    <span className="mr-2 text-gray-400">{idx + 1}.</span>
                    {s.question}
                  </p>
                  {s.type === "MULTIPLE_CHOICE" && (
                    <Badge tone={isCorrect ? "green" : "red"}>{isCorrect ? "Benar" : "Salah"}</Badge>
                  )}
                </div>

                {s.type === "MULTIPLE_CHOICE" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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
                  <div className="p-3 bg-gray-50 rounded-lg text-xs mt-2 border border-gray-100">
                    <span className="font-bold text-gray-500 block mb-1">Jawaban yang kamu kumpulkan:</span>
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

  // Jika waktu pengumpulan sudah lewat
  if (new Date() > t.dueDate) {
    return (
      <>
        {backLink}
        <PageHeader title={t.title} description="Batas waktu pengerjaan tugas ini telah berakhir." />
      </>
    );
  }

  // Form Pengerjaan Soal Tugas
  return (
    <>
      {backLink}
      <PageHeader
        title={t.title}
        description={`Kelas: ${t.kelasName} · ${soalList.length} Soal · Deadline: ${formatDate(t.dueDate)} · Nilai Maksimal: ${t.maxScore}`}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-700 leading-relaxed max-w-3xl">
        <span className="font-bold uppercase tracking-wider text-black block mb-1">Petunjuk Tugas:</span>
        <p className="whitespace-pre-wrap">{t.description}</p>
      </div>

      <form action={submitBound} className="max-w-3xl space-y-6">
        {soalList.map((s, idx) => {
          const options = (s.options as string[]) ?? [];
          return (
            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:rounded-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <p className="text-sm font-bold text-black">
                  <span className="mr-2 text-gray-400 font-black">{String(idx + 1).padStart(2, "0")}.</span>
                  {s.question}
                </p>
                <span className="rounded bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-600 whitespace-nowrap">
                  {s.points} POIN
                </span>
              </div>

              {s.type === "MULTIPLE_CHOICE" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {["A", "B", "C", "D"].map((letter, i) => (
                    <label
                      key={letter}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-xs transition-colors hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
                    >
                      <input type="radio" name={`soal_${s.id}`} value={letter} required className="sr-only" />
                      <span className="font-bold text-xs">{letter}</span>
                      <span>{options[i]}</span>
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

        {soalList.length > 0 ? (
          <div className="pt-2">
            <button type="submit" className={primaryButtonClass}>
              <Icon name="send" size={16} /> Kumpulkan Tugas Sekarang
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-xs text-gray-500">
            Guru belum menambahkan butir soal pada tugas ini.
          </div>
        )}
      </form>
    </>
  );
}
