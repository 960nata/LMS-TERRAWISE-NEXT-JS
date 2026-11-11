import { db } from "@/lib/db";
import { requireClassManager } from "@/lib/access";
import { notFound } from "next/navigation";
import { tugas, kelas, tugasSoal, tugasSubmissions, users } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { addTugasSoal, deleteTugasSoal, gradeSubmissionAction } from "../actions";
import {
  ActionModal,
  Badge,
  EmptyState,
  HtmlContent,
  Icon,
  Label,
  PageHeader,
  SectionTitle,
  StatCard,
  StatGrid,
  formatDate,
  inputClass,
  primaryButtonClass,
} from "@/components/ui";

export const instant = false;

export default async function TugasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t] = await db
    .select({
      id: tugas.id,
      title: tugas.title,
      description: tugas.description,
      tipe: tugas.tipe,
      dueDate: tugas.dueDate,
      maxScore: tugas.maxScore,
      kelasId: tugas.kelasId,
      kelasName: kelas.name,
    })
    .from(tugas)
    .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
    .where(eq(tugas.id, id))
    .limit(1);

  if (!t) notFound();
  const user = await requireClassManager(t.kelasId);
  const backPath =
    user.role === "SUPERADMIN"
      ? "/superadmin/tugas"
      : user.role === "ADMIN"
      ? "/admin/tugas"
      : "/teacher/tugas";

  const [soalList, submissions] = await Promise.all([
    db.select().from(tugasSoal).where(eq(tugasSoal.tugasId, id)).orderBy(asc(tugasSoal.order), asc(tugasSoal.id)),
    db
      .select({
        id: tugasSubmissions.id,
        studentName: users.name,
        studentEmail: users.email,
        answerText: tugasSubmissions.answerText,
        answers: tugasSubmissions.answers,
        groupName: tugasSubmissions.groupName,
        groupMembers: tugasSubmissions.groupMembers,
        fileUrl: tugasSubmissions.fileUrl,
        score: tugasSubmissions.score,
        feedback: tugasSubmissions.feedback,
        submittedAt: tugasSubmissions.submittedAt,
        gradedAt: tugasSubmissions.gradedAt,
      })
      .from(tugasSubmissions)
      .innerJoin(users, eq(tugasSubmissions.studentId, users.id))
      .where(eq(tugasSubmissions.tugasId, id))
      .orderBy(desc(tugasSubmissions.submittedAt)),
  ]);

  const addSoalBound = addTugasSoal.bind(null, id);
  const totalPoin = soalList.reduce((acc, s) => acc + s.points, 0);

  const tipeLabel =
    t.tipe === "MULTIPLE_CHOICE"
      ? "Pilihan Ganda"
      : t.tipe === "ESSAY"
      ? "Soal Essay"
      : t.tipe === "KELOMPOK"
      ? "Proyek Kelompok"
      : "Tugas Mandiri";

  const isQuestionBased = t.tipe === "MULTIPLE_CHOICE" || t.tipe === "ESSAY";

  return (
    <>
      <Link
        href={backPath}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
      >
        <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Tugas
      </Link>

      <PageHeader
        title={t.title}
        description={`Kelas: ${t.kelasName} · Tipe: ${tipeLabel} · Deadline: ${formatDate(t.dueDate)} · Nilai Maks: ${t.maxScore}`}
        action={
          isQuestionBased ? (
            <ActionModal
              triggerText={t.tipe === "MULTIPLE_CHOICE" ? "Tambah Soal Pilihan Ganda" : "Tambah Soal Essay"}
              triggerIcon="add"
              title={t.tipe === "MULTIPLE_CHOICE" ? "Tambah Soal Pilihan Ganda" : "Tambah Soal Essay"}
              description={
                t.tipe === "MULTIPLE_CHOICE"
                  ? "Tambahkan soal baru dengan 4 pilihan jawaban dan kunci jawaban yang benar."
                  : "Tambahkan pertanyaan uraian/essay beserta bobot nilai."
              }
            >
              <form action={addSoalBound} className="space-y-4">
                <input type="hidden" name="type" value={t.tipe} />
                <div>
                  <Label htmlFor="question">Teks Pertanyaan Soal</Label>
                  <textarea
                    id="question"
                    name="question"
                    placeholder="Tuliskan teks pertanyaan soal tugas..."
                    required
                    rows={3}
                    className={inputClass}
                  />
                </div>

                {t.tipe === "MULTIPLE_CHOICE" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["A", "B", "C", "D"] as const).map((opt) => (
                        <div key={opt}>
                          <Label htmlFor={`option${opt}`}>Pilihan {opt}</Label>
                          <input
                            id={`option${opt}`}
                            name={`option${opt}`}
                            placeholder={`Teks pilihan ${opt}`}
                            required
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label htmlFor="correctAnswer">Kunci Jawaban Benar</Label>
                      <select id="correctAnswer" name="correctAnswer" required className={inputClass}>
                        <option value="">Pilih Opsi Kunci Jawaban</option>
                        {["A", "B", "C", "D"].map((opt) => (
                          <option key={opt} value={opt}>
                            Opsi {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="points">Bobot Poin Soal</Label>
                  <input
                    id="points"
                    name="points"
                    type="number"
                    defaultValue={t.tipe === "MULTIPLE_CHOICE" ? 25 : 30}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className={`${primaryButtonClass} w-full`}>
                    <Icon name="add" size={18} /> Simpan &amp; Tambahkan ke Tugas
                  </button>
                </div>
              </form>
            </ActionModal>
          ) : undefined
        }
      />

      <StatGrid>
        <StatCard value={tipeLabel} label="Tipe Tugas" />
        {isQuestionBased ? (
          <>
            <StatCard value={soalList.length} label="Jumlah Soal" />
            <StatCard value={totalPoin} label="Total Poin Soal" />
          </>
        ) : (
          <StatCard value={t.maxScore} label="Nilai Maksimal" />
        )}
        <StatCard value={submissions.length} label="Siswa Mengumpulkan" />
      </StatGrid>

      {/* Deskripsi & Instruksi Tugas */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Instruksi &amp; Petunjuk Tugas</h4>
        <HtmlContent content={t.description} className="mt-2 text-sm leading-relaxed text-gray-700" />
      </div>

      {/* Daftar Soal jika tipe MULTIPLE_CHOICE atau ESSAY */}
      {isQuestionBased && (
        <section className="mt-8">
          <SectionTitle
            icon="quiz"
            title={`Bank Soal ${t.tipe === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay"} (${soalList.length} Soal)`}
          />
          {soalList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center md:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                <Icon name="quiz" size={28} />
              </div>
              <h3 className="mt-4 text-base font-extrabold uppercase tracking-tight text-black">
                Bank Soal Masih Kosong
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
                Tugas bertipe {tipeLabel} ini belum memiliki butir soal. Klik tombol di bawah atau tombol di atas untuk mulai membuat soal pertama.
              </p>
              <div className="mt-6 flex justify-center">
                <ActionModal
                  triggerText={t.tipe === "MULTIPLE_CHOICE" ? "+ Buat Soal Pilihan Ganda Pertama" : "+ Buat Soal Essay Pertama"}
                  triggerIcon="add"
                  title={t.tipe === "MULTIPLE_CHOICE" ? "Tambah Soal Pilihan Ganda" : "Tambah Soal Essay"}
                  description={
                    t.tipe === "MULTIPLE_CHOICE"
                      ? "Tambahkan soal baru dengan 4 pilihan jawaban dan kunci jawaban yang benar."
                      : "Tambahkan pertanyaan uraian/essay beserta bobot nilai."
                  }
                >
                  <form action={addSoalBound} className="space-y-4 text-left">
                    <input type="hidden" name="type" value={t.tipe} />
                    <div>
                      <Label htmlFor="empty-question">Teks Pertanyaan Soal</Label>
                      <textarea
                        id="empty-question"
                        name="question"
                        placeholder="Tuliskan teks pertanyaan soal tugas..."
                        required
                        rows={3}
                        className={inputClass}
                      />
                    </div>

                    {t.tipe === "MULTIPLE_CHOICE" && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(["A", "B", "C", "D"] as const).map((opt) => (
                            <div key={opt}>
                              <Label htmlFor={`empty-option${opt}`}>Pilihan {opt}</Label>
                              <input
                                id={`empty-option${opt}`}
                                name={`option${opt}`}
                                placeholder={`Teks pilihan ${opt}`}
                                required
                                className={inputClass}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <Label htmlFor="empty-correctAnswer">Kunci Jawaban Benar</Label>
                          <select id="empty-correctAnswer" name="correctAnswer" required className={inputClass}>
                            <option value="">Pilih Opsi Kunci Jawaban</option>
                            {["A", "B", "C", "D"].map((opt) => (
                              <option key={opt} value={opt}>
                                Opsi {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="empty-points">Bobot Poin Soal</Label>
                      <input
                        id="empty-points"
                        name="points"
                        type="number"
                        defaultValue={t.tipe === "MULTIPLE_CHOICE" ? 25 : 30}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="pt-2">
                      <button type="submit" className={`${primaryButtonClass} w-full`}>
                        <Icon name="add" size={18} /> Simpan &amp; Tambahkan ke Tugas
                      </button>
                    </div>
                  </form>
                </ActionModal>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {soalList.map((s, idx) => {
                const options = (s.options as string[]) ?? [];
                const deleteAction = deleteTugasSoal.bind(null, id, s.id);
                return (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-black md:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {s.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Essay"} · {s.points} Poin
                          </span>
                        </div>
                        <HtmlContent content={s.question} className="text-sm font-bold text-black md:text-base leading-relaxed" />

                        {s.type === "MULTIPLE_CHOICE" && options.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {options.map((opt, i) => {
                              const letter = ["A", "B", "C", "D"][i];
                              const isCorrect = s.correctAnswer === letter;
                              return (
                                <div
                                  key={letter}
                                  className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs ${
                                    isCorrect
                                      ? "border-black bg-black text-white font-bold"
                                      : "border-gray-200 bg-gray-50 text-gray-700"
                                  }`}
                                >
                                  <span
                                    className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                                      isCorrect ? "bg-white text-black" : "bg-gray-200 text-gray-800"
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                  <span>{opt}</span>
                                  {isCorrect && <span className="ml-auto text-[10px] uppercase font-bold tracking-wider">Kunci</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <form action={deleteAction}>
                        <button
                          type="submit"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors"
                          title="Hapus Soal"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Pengumpulan Siswa & Penilaian */}
      <section className="mt-12">
        <SectionTitle icon="grading" title={`Pengumpulan Jawaban Siswa (${submissions.length} Siswa)`} />
        {submissions.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="mark_email_read" text="Belum ada jawaban tugas yang dikumpulkan siswa." />
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const studentAnswers = (sub.answers as Record<string, string>) || {};
              return (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-black"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-black">{sub.studentName}</h4>
                        <span className="text-xs text-gray-400">({sub.studentEmail})</span>
                      </div>
                      {sub.groupName && (
                        <p className="mt-1 text-xs font-bold text-black">
                          Kelompok: <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">{sub.groupName}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">Dikumpul: {formatDate(sub.submittedAt, true)}</span>
                      {sub.score !== null ? (
                        <Badge tone="green">Dinilai: {sub.score}/{t.maxScore}</Badge>
                      ) : (
                        <Badge tone="orange">Perlu Dinilai</Badge>
                      )}
                    </div>
                  </div>

                  {sub.groupMembers && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs">
                      <span className="font-bold text-gray-600 block mb-1">Anggota Tim:</span>
                      <p className="text-gray-800">{sub.groupMembers}</p>
                    </div>
                  )}

                  {/* Jawaban berdasarkan tipe */}
                  <div className="mt-4">
                    {t.tipe === "MULTIPLE_CHOICE" && soalList.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Jawaban Kuis Pilihan Ganda Siswa:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {soalList.map((s, idx) => {
                            const ans = studentAnswers[s.id];
                            const isCorrect = ans === s.correctAnswer;
                            return (
                              <div
                                key={s.id}
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                  isCorrect ? "border-green-300 bg-green-50/50" : "border-red-200 bg-red-50/50"
                                }`}
                              >
                                <span className="font-bold">No. {idx + 1}: Opsi {ans ?? "-"}</span>
                                <span className="text-[10px] font-bold">
                                  {isCorrect ? `+${s.points} Poin` : "0 Poin"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : t.tipe === "ESSAY" && soalList.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Jawaban Uraian Essay Siswa:</p>
                        {soalList.map((s, idx) => (
                          <div key={s.id} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                            <div className="font-bold text-black mb-1.5 flex items-start gap-1.5">
                              <span>Soal {idx + 1} ({s.points} Poin):</span>
                              <HtmlContent content={s.question} className="inline-block flex-1" />
                            </div>
                            <div className="text-gray-700 leading-relaxed border-t border-gray-200/60 pt-2 mt-1">
                              <HtmlContent content={studentAnswers[s.id] || "Belum ada jawaban."} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Uraian / Laporan Siswa:</p>
                        <div className="mt-1.5 rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs leading-relaxed text-gray-700">
                          <HtmlContent content={sub.answerText || "Tidak ada jawaban teks yang dilampirkan."} fallback="Tidak ada jawaban teks yang dilampirkan." />
                        </div>
                      </div>
                    )}

                    {sub.fileUrl && (
                      <div className="mt-3 text-xs">
                        <span className="font-bold text-gray-500">Lampiran URL: </span>
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-black underline hover:text-gray-600"
                        >
                          {sub.fileUrl} ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Form Penilaian */}
                  <form
                    action={gradeSubmissionAction}
                    className="mt-6 border-t border-gray-100 pt-4 grid grid-cols-1 gap-3 md:grid-cols-4"
                  >
                    <input type="hidden" name="submissionId" value={sub.id} />
                    <div>
                      <Label htmlFor={`score_${sub.id}`}>Nilai (Maks: {t.maxScore})</Label>
                      <input
                        id={`score_${sub.id}`}
                        name="score"
                        type="number"
                        required
                        min={0}
                        max={t.maxScore}
                        defaultValue={sub.score ?? 85}
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`feedback_${sub.id}`}>Catatan / Umpan Balik Guru</Label>
                      <input
                        id={`feedback_${sub.id}`}
                        name="feedback"
                        placeholder="cth: Analisis sangat bagus, materi dipahami dengan baik."
                        defaultValue={sub.feedback ?? ""}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className={primaryButtonClass}>
                        <Icon name="check" size={16} /> Simpan Nilai
                      </button>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
