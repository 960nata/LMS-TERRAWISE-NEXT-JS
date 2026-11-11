import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, kelas, enrollments, tugasSubmissions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { submitTugas } from "./actions";
import {
  ActionModal,
  Badge,
  EmptyState,
  Icon,
  Label,
  PageHeader,
  StatCard,
  StatGrid,
  formatDate,
  inputClass,
  primaryButtonClass,
} from "@/components/ui";

export const instant = false;

export default async function StudentTugasPage() {
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const rows = await db
    .select({
      id: tugas.id,
      title: tugas.title,
      description: tugas.description,
      tipe: tugas.tipe,
      dueDate: tugas.dueDate,
      maxScore: tugas.maxScore,
      kelasName: kelas.name,
    })
    .from(enrollments)
    .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
    .innerJoin(tugas, eq(tugas.kelasId, kelas.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(tugas.dueDate));

  const mySubmissions = await db.select().from(tugasSubmissions).where(eq(tugasSubmissions.studentId, studentId));
  const submissionMap = new Map(mySubmissions.map((s) => [s.tugasId, s]));
  const now = new Date();
  const done = rows.filter((t) => submissionMap.has(t.id)).length;
  const graded = rows.filter((t) => submissionMap.get(t.id)?.score != null).length;

  const tipeBadge = (tipe: string) => {
    switch (tipe) {
      case "MULTIPLE_CHOICE":
        return <Badge tone="black">Pilihan Ganda</Badge>;
      case "ESSAY":
        return <Badge tone="black">Essay</Badge>;
      case "KELOMPOK":
        return <Badge tone="orange">Kelompok</Badge>;
      case "MANDIRI":
      default:
        return <Badge tone="gray">Mandiri</Badge>;
    }
  };

  return (
    <>
      <PageHeader
        title="Tugas Saya"
        description="Daftar tugas pembelajaran (Pilihan Ganda, Essay, Mandiri, dan Kelompok) yang ditugaskan guru untuk Anda."
      />

      <StatGrid>
        <StatCard value={rows.length} label="Total Tugas" />
        <StatCard value={rows.length - done} label="Belum Dikerjakan" />
        <StatCard value={done} label="Dikumpulkan" />
        <StatCard value={graded} label="Sudah Dinilai" />
      </StatGrid>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-gray-100 md:rounded-2xl">
          <EmptyState icon="assignment" text="Tidak ada tugas untuk kelas Anda saat ini." />
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {rows.map((t) => {
            const sub = submissionMap.get(t.id);
            const late = !sub && t.dueDate < now;
            const isQuestionBased = t.tipe === "MULTIPLE_CHOICE" || t.tipe === "ESSAY";

            return (
              <div key={t.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:rounded-2xl">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-start md:justify-between md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-black">
                      <Icon name="assignment" size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{t.kelasName}</p>
                        {tipeBadge(t.tipe)}
                      </div>
                      <h3 className="text-sm font-bold md:text-base text-black">{t.title}</h3>
                      <p className="mt-1 text-[10px] text-gray-400">
                        Deadline: {formatDate(t.dueDate)} · Nilai Maks: {t.maxScore}
                      </p>
                    </div>
                  </div>
                  {sub ? (
                    sub.score != null ? (
                      <Badge tone="black">Dinilai: {sub.score}/{t.maxScore}</Badge>
                    ) : (
                      <Badge tone="green">Terkumpul</Badge>
                    )
                  ) : late ? (
                    <Badge tone="red">Terlambat</Badge>
                  ) : (
                    <Badge tone="orange">Pending</Badge>
                  )}
                </div>

                <div className="p-4 md:p-6">
                  <p className="mb-4 text-sm leading-relaxed whitespace-pre-line text-gray-600">{t.description}</p>

                  {sub ? (
                    <div className="rounded-xl bg-gray-50 p-4 text-xs space-y-2 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-black text-sm">
                          {sub.score != null ? `Nilai: ${sub.score} / ${t.maxScore}` : "Status: Menunggu penilaian guru"}
                        </p>
                        {isQuestionBased && (
                          <Link
                            href={`/student/tugas/${t.id}`}
                            className="rounded border border-black bg-white px-3 py-1 font-bold text-black hover:bg-black hover:text-white transition-colors"
                          >
                            Lihat Lembar Jawaban &amp; Koreksi →
                          </Link>
                        )}
                      </div>

                      {sub.groupName && (
                        <p className="text-xs font-bold text-black">
                          Kelompok: <span className="bg-black text-white px-1.5 py-0.5 rounded text-[10px]">{sub.groupName}</span>
                        </p>
                      )}

                      {sub.feedback && <p className="text-gray-600 font-medium">Umpan Balik Guru: {sub.feedback}</p>}

                      {sub.fileUrl && (
                        <p className="text-gray-500">
                          Lampiran:{" "}
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold underline text-black hover:text-gray-600"
                          >
                            Buka Tautan Lampiran ↗
                          </a>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2">
                      {isQuestionBased ? (
                        <Link
                          href={`/student/tugas/${t.id}`}
                          className={`${primaryButtonClass} inline-flex items-center gap-1.5`}
                        >
                          <Icon name="edit_note" size={16} />
                          {t.tipe === "MULTIPLE_CHOICE" ? "Kerjakan Kuis Pilihan Ganda →" : "Kerjakan Soal Essay →"}
                        </Link>
                      ) : t.tipe === "KELOMPOK" ? (
                        <ActionModal
                          triggerText="Kumpulkan Tugas Kelompok"
                          triggerIcon="group"
                          title={`Pengumpulan Proyek Kelompok: ${t.title}`}
                          description={`Maksimal nilai: ${t.maxScore} poin · Kelas: ${t.kelasName}`}
                        >
                          <form action={submitTugas} className="space-y-4">
                            <input type="hidden" name="tugasId" value={t.id} />
                            <div>
                              <Label htmlFor={`groupName-${t.id}`}>Nama Kelompok</Label>
                              <input
                                id={`groupName-${t.id}`}
                                name="groupName"
                                placeholder="cth: Kelompok Alpha - BioSains"
                                required
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`groupMembers-${t.id}`}>Daftar Anggota Kelompok</Label>
                              <textarea
                                id={`groupMembers-${t.id}`}
                                name="groupMembers"
                                placeholder="1. Ahmad Rizki (Ketua)&#10;2. Siti Nurhaliza&#10;3. Budi Santoso"
                                required
                                rows={3}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`answer-${t.id}`}>Ringkasan Hasil Kerja / Laporan Proyek</Label>
                              <textarea
                                id={`answer-${t.id}`}
                                name="answerText"
                                placeholder="Tuliskan uraian hasil kerja kelompok, metodologi, dan temuan utama..."
                                required
                                rows={4}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`url-${t.id}`}>Tautan Repository / Dokumen Project</Label>
                              <input
                                id={`url-${t.id}`}
                                type="url"
                                name="fileUrl"
                                placeholder="https://github.com/... atau https://drive.google.com/..."
                                required
                                className={inputClass}
                              />
                            </div>
                            <div className="pt-2">
                              <button type="submit" className={`${primaryButtonClass} w-full`}>
                                <Icon name="send" size={16} /> Kumpulkan Tugas Kelompok Sekarang
                              </button>
                            </div>
                          </form>
                        </ActionModal>
                      ) : (
                        <ActionModal
                          triggerText="Kerjakan / Kumpulkan Tugas Mandiri"
                          triggerIcon="edit_note"
                          title={`Kumpulkan Tugas: ${t.title}`}
                          description={`Maksimal nilai: ${t.maxScore} poin · Kelas: ${t.kelasName}`}
                        >
                          <form action={submitTugas} className="space-y-4">
                            <input type="hidden" name="tugasId" value={t.id} />
                            <div>
                              <Label htmlFor={`answer-${t.id}`}>Jawaban Deskriptif / Uraian</Label>
                              <textarea
                                id={`answer-${t.id}`}
                                name="answerText"
                                placeholder="Tuliskan uraian hasil analisis, pengerjaan tugas, atau rangkuman kamu..."
                                required
                                rows={4}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`url-${t.id}`}>Tautan Lampiran Dokumen / Repository (Opsional)</Label>
                              <input
                                id={`url-${t.id}`}
                                type="url"
                                name="fileUrl"
                                placeholder="https://drive.google.com/... atau https://github.com/..."
                                className={inputClass}
                              />
                            </div>
                            <div className="pt-2">
                              <button type="submit" className={`${primaryButtonClass} w-full`}>
                                <Icon name="send" size={16} /> Kumpulkan Tugas Sekarang
                              </button>
                            </div>
                          </form>
                        </ActionModal>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
