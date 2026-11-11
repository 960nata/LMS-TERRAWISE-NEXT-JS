import { db } from "@/lib/db";
import { requireClassManager } from "@/lib/access";
import { notFound } from "next/navigation";
import { ujian, soal, ujianAttempts, users } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { addSoal, deleteSoal, gradeExamAttempt } from "../actions";
import {
  ActionModal,
  Badge,
  EmptyState,
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

export default async function UjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [u] = await db.select().from(ujian).where(eq(ujian.id, id));
  if (!u) notFound();
  const user = await requireClassManager(u.kelasId);
  const backPath =
    user.role === "SUPERADMIN"
      ? "/superadmin/ujian"
      : user.role === "ADMIN"
      ? "/admin/ujian"
      : "/teacher/ujian";

  const [soalList, attempts] = await Promise.all([
    db.select().from(soal).where(eq(soal.ujianId, id)).orderBy(asc(soal.order), asc(soal.id)),
    db
      .select({
        id: ujianAttempts.id,
        studentName: users.name,
        studentEmail: users.email,
        answers: ujianAttempts.answers,
        score: ujianAttempts.score,
        feedback: ujianAttempts.feedback,
        startedAt: ujianAttempts.startedAt,
        submittedAt: ujianAttempts.submittedAt,
      })
      .from(ujianAttempts)
      .innerJoin(users, eq(ujianAttempts.studentId, users.id))
      .where(eq(ujianAttempts.ujianId, id))
      .orderBy(desc(ujianAttempts.submittedAt)),
  ]);

  const addSoalBound = addSoal.bind(null, id);
  const totalPoin = soalList.reduce((a, s) => a + s.points, 0);

  const tipeLabel =
    u.tipe === "MULTIPLE_CHOICE"
      ? "Pilihan Ganda"
      : u.tipe === "ESSAY"
      ? "Essay"
      : "Campuran (PG + Essay)";

  return (
    <>
      <Link
        href={backPath}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
      >
        <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Ujian
      </Link>

      <PageHeader
        title={u.title}
        description={`Tipe: ${tipeLabel} · ${formatDate(u.startTime)} — ${formatDate(u.endTime)} · Durasi: ${u.durationMinutes} menit`}
        action={
          <ActionModal
            triggerText="Tambah Soal"
            triggerIcon="add"
            title={`Tambah Soal Ujian (${tipeLabel})`}
            description="Tambahkan soal baru ke dalam ujian ini sesuai tipe yang dipilih."
          >
            <form action={addSoalBound} className="space-y-4">
              {u.tipe === "MIXED" ? (
                <div>
                  <Label htmlFor="type">Tipe Pertanyaan</Label>
                  <select id="type" name="type" required className={inputClass}>
                    <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                    <option value="ESSAY">Soal Essay</option>
                  </select>
                </div>
              ) : (
                <input type="hidden" name="type" value={u.tipe} />
              )}

              <div>
                <Label htmlFor="question">Teks Pertanyaan Soal</Label>
                <textarea
                  id="question"
                  name="question"
                  placeholder="Tuliskan teks pertanyaan soal ujian..."
                  required
                  rows={2}
                  className={inputClass}
                />
              </div>

              {/* Input Pilihan Ganda (hanya relevan jika MULTIPLE_CHOICE atau MIXED) */}
              {u.tipe !== "ESSAY" && (
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-3">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Opsi Jawaban Pilihan Ganda (Kosongkan jika membuat soal essay)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(["A", "B", "C", "D"] as const).map((o) => (
                      <div key={o}>
                        <Label htmlFor={`option${o}`}>Pilihan {o}</Label>
                        <input
                          id={`option${o}`}
                          name={`option${o}`}
                          placeholder={`Teks pilihan ${o}`}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="correctAnswer">Kunci Jawaban Benar</Label>
                    <select id="correctAnswer" name="correctAnswer" className={inputClass}>
                      <option value="">Pilih Kunci (hanya untuk Pilihan Ganda)</option>
                      {["A", "B", "C", "D"].map((o) => (
                        <option key={o} value={o}>
                          Opsi {o}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Rubrik untuk Essay */}
              {u.tipe !== "MULTIPLE_CHOICE" && (
                <div>
                  <Label htmlFor="rubric">Rubrik / Pedoman Penilaian Essay (Opsional)</Label>
                  <textarea
                    id="rubric"
                    name="rubric"
                    placeholder="Pedoman poin: kesesuaian konsep, rumus, argumentasi..."
                    rows={2}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="points">Bobot Poin Soal</Label>
                <input id="points" name="points" type="number" defaultValue={25} required className={inputClass} />
              </div>

              <div className="pt-2">
                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  <Icon name="add" size={18} /> Simpan &amp; Tambahkan ke Ujian
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      <StatGrid>
        <StatCard value={tipeLabel} label="Tipe Ujian" />
        <StatCard value={soalList.length} label="Jumlah Soal" />
        <StatCard value={totalPoin} label="Total Poin Soal" />
        <StatCard value={attempts.length} label="Peserta Mengerjakan" />
      </StatGrid>

      {/* Daftar Soal */}
      <section className="mt-8">
        <SectionTitle icon="quiz" title={`Bank Soal Ujian (${soalList.length} Soal)`} />
        {soalList.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="quiz" text="Belum ada soal pada ujian ini." />
          </div>
        ) : (
          <div className="space-y-4">
            {soalList.map((s, idx) => {
              const options = (s.options as string[]) ?? [];
              const isMC = s.type === "MULTIPLE_CHOICE";
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-black md:p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase">
                          {isMC ? "Pilihan Ganda" : "Soal Essay"} · {s.points} Poin
                        </span>
                      </div>
                      <p className="text-sm font-bold text-black md:text-base">{s.question}</p>
                      {s.rubric && (
                        <p className="mt-1 text-xs text-gray-500 italic">
                          <span className="font-bold not-italic">Rubrik:</span> {s.rubric}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={deleteSoal.bind(null, id, s.id)}>
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

                  {isMC && options.length > 0 && (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {["A", "B", "C", "D"].map((label, i) => {
                        const correct = s.correctAnswer === label;
                        return (
                          <div
                            key={label}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs transition-all ${
                              correct
                                ? "bg-black text-white font-bold"
                                : "bg-gray-50/80 text-gray-800 border border-gray-100"
                            }`}
                          >
                            <span
                              className={`flex size-6 items-center justify-center rounded-md text-xs font-black ${
                                correct ? "bg-white text-black" : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {label}
                            </span>
                            <span>{options?.[i]}</span>
                            {correct && <Icon name="check_circle" filled size={16} className="ml-auto text-emerald-400" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Hasil & Form Koreksi Peserta Ujian */}
      <section className="mt-12">
        <SectionTitle icon="military_tech" title="Hasil &amp; Koreksi Jawaban Peserta Ujian" />
        {attempts.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="pending_actions" text="Belum ada siswa yang menyelesaikan ujian ini." />
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((att) => {
              const studentAnswers = (att.answers as Record<string, string>) || {};
              return (
                <div
                  key={att.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-black"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-black">{att.studentName}</h4>
                        <span className="text-xs text-gray-400">({att.studentEmail})</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Selesai: {att.submittedAt ? formatDate(att.submittedAt, true) : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-black">
                        Skor: {att.score ?? 0} <span className="text-xs font-medium text-gray-400">/ {totalPoin || 100}</span>
                      </span>
                      {(att.score ?? 0) >= 75 ? (
                        <Badge tone="green">Lulus (KKM)</Badge>
                      ) : (
                        <Badge tone="red">Remedial</Badge>
                      )}
                    </div>
                  </div>

                  {/* Rincian Jawaban Siswa */}
                  <div className="mt-4 space-y-3">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Lembar Jawaban Siswa:
                    </p>
                    <div className="space-y-2">
                      {soalList.map((s, idx) => {
                        const ans = studentAnswers[s.id];
                        const isMC = s.type === "MULTIPLE_CHOICE";
                        const isCorrect = isMC && ans === s.correctAnswer;
                        return (
                          <div
                            key={s.id}
                            className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs leading-relaxed"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-bold text-black">
                                {idx + 1}. {s.question} ({s.points} Poin)
                              </p>
                              {isMC && (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {isCorrect ? "Benar" : "Salah"}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-700 mt-1">
                              <span className="font-bold text-gray-500">Jawaban Siswa: </span>
                              {isMC ? (
                                <span className="font-bold text-black">Opsi {ans ?? "-"}</span>
                              ) : (
                                <p className="mt-1 p-2 bg-white rounded border border-gray-200 whitespace-pre-wrap">
                                  {ans || "Tidak ada jawaban tertulis."}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Koreksi / Penyesuaian Nilai */}
                  <form
                    action={gradeExamAttempt}
                    className="mt-6 border-t border-gray-100 pt-4 grid grid-cols-1 gap-3 md:grid-cols-4"
                  >
                    <input type="hidden" name="attemptId" value={att.id} />
                    <div>
                      <Label htmlFor={`score_${att.id}`}>Skor Total</Label>
                      <input
                        id={`score_${att.id}`}
                        name="score"
                        type="number"
                        required
                        min={0}
                        max={totalPoin || 100}
                        defaultValue={att.score ?? 0}
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`feedback_${att.id}`}>Catatan / Umpan Balik Guru</Label>
                      <input
                        id={`feedback_${att.id}`}
                        name="feedback"
                        placeholder="cth: Jawaban essay bagian teori sangat mendalam."
                        defaultValue={att.feedback ?? ""}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" className={primaryButtonClass}>
                        <Icon name="check" size={16} /> Simpan Skor Ujian
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
