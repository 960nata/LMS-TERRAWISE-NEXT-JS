import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, kelas, tugasSoal, tugasSubmissions, enrollments } from "@/lib/db/schema";
import { asc, eq, and } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitTugasQuestions } from "./actions";
import { Badge, HtmlContent, Icon, Label, PageHeader, formatDate, inputClass, primaryButtonClass } from "@/components/ui";

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

  const groupConfigSoal = soalList.find((s) => s.question === "__GROUP_CONFIG__");
  const groupConfig = groupConfigSoal?.options as
    | {
        groups?: Array<{ id: string; name: string; leader?: string; members?: string; topic?: string }>;
        enablePeerAssessment?: boolean;
        scaleItems?: Array<{ id: string; label: string; points: number }>;
        criteria?: string[];
      }
    | undefined;

  const actualSoalList = soalList.filter((s) => s.question !== "__GROUP_CONFIG__");

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
    const studentAnswers = (existing.answers as Record<string, unknown>) || {};
    const peerEval = studentAnswers.peerEvaluation as
      | { targetGroup?: string; rating?: string; points?: number; comment?: string }
      | undefined;
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

        {/* Lembar Hasil Pengerjaan Berdasarkan Tipe */}
        <section className="space-y-4 max-w-3xl">
          <h3 className="font-bold text-sm tracking-widest uppercase text-gray-400">
            {t.tipe === "MULTIPLE_CHOICE"
              ? "Lembar Jawaban Pilihan Ganda Kamu:"
              : t.tipe === "ESSAY"
              ? "Lembar Jawaban Essay Kamu:"
              : t.tipe === "KELOMPOK"
              ? "Laporan Proyek Kelompok yang Dikumpulkan:"
              : "Hasil Pengerjaan Tugas Mandiri Kamu:"}
          </h3>

          {t.tipe === "MANDIRI" ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-gray-400 block mb-1">
                  Uraian / Jawaban Tugas:
                </span>
                <HtmlContent content={existing.answerText || "-"} className="text-gray-800 leading-relaxed text-sm" />
              </div>
              {existing.fileUrl && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-400 block mb-1">
                    Lampiran Berkas / Tautan:
                  </span>
                  <a
                    href={existing.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-black underline hover:text-gray-600"
                  >
                    <Icon name="link" size={16} /> Buka Berkas Lampiran ↗
                  </a>
                </div>
              )}
            </div>
          ) : t.tipe === "KELOMPOK" ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Kelompok</span>
                  <h4 className="text-base font-bold text-black">{existing.groupName || "Tim Kolaborasi"}</h4>
                </div>
                {existing.groupMembers && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Anggota Tim</span>
                    <p className="text-xs text-gray-700 font-medium">{existing.groupMembers}</p>
                  </div>
                )}
              </div>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-gray-400 block mb-1">
                  Laporan Hasil Kerja:
                </span>
                <HtmlContent content={existing.answerText || "-"} className="text-gray-800 leading-relaxed text-sm" />
              </div>
              {existing.fileUrl && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-400 block mb-1">
                    Tautan Repository / Berkas:
                  </span>
                  <a
                    href={existing.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-black underline hover:text-gray-600"
                  >
                    <Icon name="link" size={16} /> Buka Tautan Repository Proyek ↗
                  </a>
                </div>
              )}

              {peerEval && (
                <div className="rounded-xl border border-gray-200 bg-neutral-50/70 p-4 space-y-2 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Evaluasi Sejawat (Peer Assessment) yang Dikirimkan
                    </span>
                    <Badge tone="black">Terekam</Badge>
                  </div>
                  <p className="text-xs font-bold text-black">
                    Kelompok Dinilai: <span className="underline">{peerEval.targetGroup}</span> · Penilaian: {peerEval.rating} {peerEval.points != null && `(${peerEval.points} Poin)`}
                  </p>
                  {peerEval.comment && (
                    <p className="text-xs text-gray-600 italic">&ldquo;{peerEval.comment}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            actualSoalList.map((s, idx) => {
              const options = (s.options as string[]) ?? [];
              const ans = studentAnswers[s.id];
              const isCorrect = s.type === "MULTIPLE_CHOICE" && ans === s.correctAnswer;
              return (
                <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                          {idx + 1}
                        </span>
                      </div>
                      <HtmlContent content={s.question} className="text-sm font-bold text-black" />
                    </div>
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
                      <HtmlContent content={(ans as string) || "-"} className="text-gray-800 leading-relaxed" />
                    </div>
                  )}
                </div>
              );
            })
          )}
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

  // Form Pengerjaan Tugas Berdasarkan Tipe
  return (
    <>
      {backLink}
      <PageHeader
        title={t.title}
        description={`Kelas: ${t.kelasName} · Tipe: ${tipeLabel} · Deadline: ${formatDate(t.dueDate)} · Nilai Maksimal: ${t.maxScore}`}
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-700 leading-relaxed max-w-3xl">
        <span className="font-bold uppercase tracking-wider text-black block mb-2">Petunjuk Tugas:</span>
        <HtmlContent content={t.description} />
      </div>

      <form action={submitBound} className="max-w-3xl space-y-6">
        {t.tipe === "MANDIRI" ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-sm tracking-tight text-black flex items-center gap-2">
              <Icon name="assignment" size={18} /> Lembar Pengerjaan Tugas Mandiri
            </h3>
            <div>
              <Label htmlFor="answerText">Uraian Jawaban / Ringkasan Tugas</Label>
              <textarea
                id="answerText"
                name="answerText"
                required
                rows={6}
                placeholder="Tuliskan uraian hasil analisis, jawaban pengerjaan tugas, atau rangkuman Anda di sini..."
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="fileUrl">Tautan Berkas / Modul / Dokumen Pendukung (Opsional)</Label>
              <input
                id="fileUrl"
                name="fileUrl"
                type="url"
                placeholder="https://drive.google.com/... atau https://github.com/..."
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Cantumkan link Google Drive, berkas PDF cloud, atau link eksternal jika tugas memerlukan pengumpulan file.
              </p>
            </div>
            <div className="pt-2">
              <button type="submit" className={primaryButtonClass}>
                <Icon name="send" size={16} /> Kumpulkan Tugas Mandiri
              </button>
            </div>
          </div>
        ) : t.tipe === "KELOMPOK" ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-sm tracking-tight text-black flex items-center gap-2">
              <Icon name="groups" size={18} /> Pengumpulan Proyek Kelompok
            </h3>

            {/* Jika ada kelompok yang telah dibagi oleh guru */}
            {groupConfig?.groups && groupConfig.groups.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-neutral-50/70 p-4 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">
                  Daftar Kelompok yang Ditetapkan Pengajar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {groupConfig.groups.map((grp, idx) => (
                    <div key={grp.id || idx} className="rounded-lg border border-gray-200 bg-white p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-black">{grp.name}</span>
                        {grp.leader && (
                          <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-bold">
                            Ketua: {grp.leader}
                          </span>
                        )}
                      </div>
                      {grp.topic && <p className="text-[11px] text-gray-600 mb-1">Topik: {grp.topic}</p>}
                      {grp.members && <p className="text-[10px] text-gray-400">Anggota: {grp.members}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupName">Nama Kelompok</Label>
                <input
                  id="groupName"
                  name="groupName"
                  list="groupNamesList"
                  required
                  placeholder="cth: Kelompok 1 - BioTeknologi"
                  className={inputClass}
                />
                {groupConfig?.groups && groupConfig.groups.length > 0 && (
                  <datalist id="groupNamesList">
                    {groupConfig.groups.map((grp, idx) => (
                      <option key={grp.id || idx} value={grp.name} />
                    ))}
                  </datalist>
                )}
              </div>
              <div>
                <Label htmlFor="groupMembers">Daftar Anggota Tim</Label>
                <input
                  id="groupMembers"
                  name="groupMembers"
                  required
                  placeholder="cth: Budi (Ketua), Siti, Ahmad"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="answerText">Ringkasan Laporan Proyek / Hasil Kolaborasi</Label>
              <textarea
                id="answerText"
                name="answerText"
                required
                rows={6}
                placeholder="Tuliskan ringkasan hasil kerja kelompok, metodologi, dan kesimpulan proyek..."
                className={inputClass}
              />
            </div>

            <div>
              <Label htmlFor="fileUrl">Tautan Repository / Berkas Laporan Tim (Google Drive / GitHub)</Label>
              <input
                id="fileUrl"
                name="fileUrl"
                type="url"
                required
                placeholder="https://github.com/... atau https://drive.google.com/..."
                className={inputClass}
              />
            </div>

            {/* Form Evaluasi Sejawat (Peer Assessment) jika diaktifkan */}
            {groupConfig?.enablePeerAssessment && (
              <div className="rounded-xl border-2 border-black bg-neutral-50 p-5 space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="star" size={18} />
                    <h4 className="text-xs font-black uppercase tracking-wider text-black">
                      Form Evaluasi Sejawat (Peer Assessment)
                    </h4>
                  </div>
                  <Badge tone="black">Evaluasi Tim Lain</Badge>
                </div>
                <p className="text-[11px] text-gray-500">
                  Sebagai bagian dari pembelajaran kolaboratif, berikan evaluasi objektif terhadap kelompok lain:
                </p>

                <div>
                  <Label htmlFor="peerTargetGroup">Pilih Kelompok Rekan yang Anda Nilai</Label>
                  <input
                    id="peerTargetGroup"
                    name="peerTargetGroup"
                    list="peerGroupsList"
                    placeholder="Ketik atau pilih nama kelompok lain (cth: Kelompok 2)"
                    className={inputClass}
                  />
                  {groupConfig?.groups && (
                    <datalist id="peerGroupsList">
                      {groupConfig.groups.map((grp, idx) => (
                        <option key={grp.id || idx} value={grp.name} />
                      ))}
                    </datalist>
                  )}
                </div>

                <div>
                  <Label htmlFor="peerRating">Skala Penilaian Kinerja Tim Rekan</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1.5">
                    {(groupConfig.scaleItems || [
                      { id: "1", label: "Tidak Memenuhi", points: 0 },
                      { id: "2", label: "Kurang Baik", points: 1 },
                      { id: "3", label: "Cukup Baik", points: 2 },
                      { id: "4", label: "Baik & Solid", points: 3 },
                      { id: "5", label: "Sangat Baik & Luar Biasa", points: 4 },
                    ]).map((scale) => (
                      <label
                        key={scale.id}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 cursor-pointer hover:border-black text-xs"
                      >
                        <input
                          type="radio"
                          name="peerRating"
                          value={scale.label}
                          className="text-black focus:ring-black accent-black"
                        />
                        <span className="font-bold text-black">{scale.label}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">({scale.points} Poin)</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="peerComment">Komentar &amp; Umpan Balik Konstruktif</Label>
                  <textarea
                    id="peerComment"
                    name="peerComment"
                    rows={2}
                    placeholder="Tuliskan masukan positif atau apresiasi untuk kelompok yang dinilai..."
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button type="submit" className={primaryButtonClass}>
                <Icon name="send" size={16} /> Kumpulkan Tugas Kelompok
              </button>
            </div>
          </div>
        ) : (
          <>
            {actualSoalList.map((s, idx) => {
              const options = (s.options as string[]) ?? [];
              return (
                <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:rounded-2xl">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {s.type === "MULTIPLE_CHOICE" ? "Pilihan Ganda" : "Soal Essay"}
                        </span>
                      </div>
                      <HtmlContent content={s.question} className="text-sm font-bold text-black" />
                    </div>
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
                  <Icon name="send" size={16} /> Kumpulkan Jawaban Sekarang
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-xs text-gray-500">
                Guru belum menambahkan butir soal pada tugas ini.
              </div>
            )}
          </>
        )}
      </form>
    </>
  );
}
