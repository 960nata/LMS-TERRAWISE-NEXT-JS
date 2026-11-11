import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, kelas, tugasSubmissions, users } from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { createTugas, deleteTugas, gradeSubmissionAction } from "./actions";
import {
  ActionModal,
  Badge,
  DataTable,
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
  tdClass,
} from "@/components/ui";

export const instant = false;

export default async function TugasPage() {
  const session = await auth();
  const user = session?.user as { id: string; role: string };
  const teacherId = user.id;
  const classFilter = user.role === "TEACHER" ? eq(kelas.teacherId, teacherId) : undefined;

  const [myKelas, myTugas, studentSubmissions] = await Promise.all([
    db.select().from(kelas).where(classFilter),
    db
      .select({
        id: tugas.id,
        title: tugas.title,
        dueDate: tugas.dueDate,
        maxScore: tugas.maxScore,
        kelasName: kelas.name,
        submissions: count(tugasSubmissions.id),
      })
      .from(tugas)
      .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
      .leftJoin(tugasSubmissions, eq(tugasSubmissions.tugasId, tugas.id))
      .where(classFilter)
      .groupBy(tugas.id, kelas.name)
      .orderBy(desc(tugas.dueDate)),
    db
      .select({
        id: tugasSubmissions.id,
        tugasTitle: tugas.title,
        maxScore: tugas.maxScore,
        studentName: users.name,
        studentEmail: users.email,
        answerText: tugasSubmissions.answerText,
        fileUrl: tugasSubmissions.fileUrl,
        score: tugasSubmissions.score,
        feedback: tugasSubmissions.feedback,
        submittedAt: tugasSubmissions.submittedAt,
        gradedAt: tugasSubmissions.gradedAt,
      })
      .from(tugasSubmissions)
      .innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id))
      .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
      .innerJoin(users, eq(tugasSubmissions.studentId, users.id))
      .where(classFilter)
      .orderBy(desc(tugasSubmissions.submittedAt)),
  ]);

  const now = new Date();
  const active = myTugas.filter((t) => t.dueDate >= now).length;
  const totalSubs = studentSubmissions.length;
  const gradedSubs = studentSubmissions.filter((s) => s.score !== null).length;

  return (
    <>
      <PageHeader
        title="Manajemen Tugas"
        description="Kelola tugas per kelas, evaluasi jawaban siswa, dan berikan penilaian serta umpan balik."
        action={
          <ActionModal
            triggerText="Tambah Tugas"
            triggerIcon="add"
            title="Tambah Tugas Baru"
            description="Buat penugasan baru untuk siswa kelas dengan tenggat waktu dan kriteria penilaian."
          >
            <form action={createTugas} className="space-y-4">
              <div>
                <Label htmlFor="kelasId">Kelas Tujuan</Label>
                <select id="kelasId" name="kelasId" required className={inputClass}>
                  <option value="">Pilih Kelas</option>
                  {myKelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="title">Judul Tugas</Label>
                <input
                  id="title"
                  name="title"
                  placeholder="cth: Analisis NPK Tanah pada Tanaman Padi"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi &amp; Instruksi Pengerjaan</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Tuliskan detail instruksi, kriteria penilaian, atau panduan pengumpulan..."
                  required
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Batas Waktu (Deadline)</Label>
                  <input id="dueDate" name="dueDate" type="datetime-local" required className={inputClass} />
                </div>
                <div>
                  <Label htmlFor="maxScore">Nilai Maksimal</Label>
                  <input id="maxScore" name="maxScore" type="number" defaultValue={100} className={inputClass} />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  <Icon name="add" size={18} /> Simpan &amp; Terbitkan Tugas
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      <StatGrid>
        <StatCard value={myTugas.length} label="Total Tugas" />
        <StatCard value={active} label="Tugas Aktif" />
        <StatCard value={totalSubs} label="Tugas Terkumpul" />
        <StatCard value={gradedSubs} label="Sudah Dinilai" />
      </StatGrid>

      {/* Daftar Tugas Guru */}
      <section className="mt-8">
        <SectionTitle icon="list_alt" title="Daftar Tugas yang Telah Dibuat" />
        {myTugas.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="assignment" text="Belum ada tugas yang dibuat." />
          </div>
        ) : (
          <DataTable
            columns={[
              { label: "No" },
              { label: "Judul" },
              { label: "Kelas", className: "hidden md:table-cell" },
              { label: "Deadline", className: "hidden lg:table-cell" },
              { label: "Pengumpulan", className: "hidden md:table-cell" },
              { label: "Status" },
              { label: "Aksi", className: "text-right" },
            ]}
          >
            {myTugas.map((t, i) => (
              <tr key={t.id} className="transition-colors hover:bg-gray-50/50">
                <td className={`${tdClass} text-gray-400`}>{i + 1}</td>
                <td className={tdClass}>
                  <p className="font-bold text-black">{t.title}</p>
                  <p className="mt-1 text-[10px] text-gray-400 lg:hidden">Deadline: {formatDate(t.dueDate)}</p>
                </td>
                <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>{t.kelasName}</td>
                <td className={`${tdClass} hidden text-gray-500 lg:table-cell`}>{formatDate(t.dueDate)}</td>
                <td className={`${tdClass} hidden text-gray-500 md:table-cell font-bold`}>
                  {t.submissions} Siswa
                </td>
                <td className={tdClass}>
                  {t.dueDate >= now ? <Badge tone="green">Aktif</Badge> : <Badge tone="gray">Selesai</Badge>}
                </td>
                <td className={`${tdClass} text-right`}>
                  <form action={deleteTugas}>
                    <input type="hidden" name="tugasId" value={t.id} />
                    <button
                      type="submit"
                      className="text-xs font-bold text-red-600 hover:text-red-800 underline"
                    >
                      Hapus
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      {/* Pengumpulan Jawaban & Penilaian Siswa */}
      <section className="mt-12">
        <SectionTitle icon="grading" title="Pengumpulan Jawaban Siswa &amp; Form Penilaian" />
        {studentSubmissions.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="mark_email_read" text="Belum ada jawaban tugas yang dikumpulkan siswa." />
          </div>
        ) : (
          <div className="space-y-4">
            {studentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-black">{sub.studentName}</h4>
                      <span className="text-xs text-gray-400">({sub.studentEmail})</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 font-medium">
                      Tugas: <span className="font-bold text-black">{sub.tugasTitle}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Dikumpul: {formatDate(sub.submittedAt, true)}</span>
                    {sub.score !== null ? (
                      <Badge tone="green">Dinilai: {sub.score}/{sub.maxScore}</Badge>
                    ) : (
                      <Badge tone="orange">Perlu Dinilai</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Jawaban Siswa:</p>
                  <div className="mt-1.5 rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {sub.answerText || "Tidak ada jawaban teks yang dilampirkan."}
                  </div>
                  {sub.fileUrl && (
                    <div className="mt-2 text-xs">
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
                <form action={gradeSubmissionAction} className="mt-6 border-t border-gray-100 pt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <input type="hidden" name="submissionId" value={sub.id} />
                  <div>
                    <Label htmlFor={`score_${sub.id}`}>Nilai (Maks: {sub.maxScore})</Label>
                    <input
                      id={`score_${sub.id}`}
                      name="score"
                      type="number"
                      required
                      min={0}
                      max={sub.maxScore}
                      defaultValue={sub.score ?? 85}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`feedback_${sub.id}`}>Catatan / Umpan Balik Guru</Label>
                    <input
                      id={`feedback_${sub.id}`}
                      name="feedback"
                      placeholder="cth: Analisis sangat bagus, perhitungan akurat."
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
            ))}
          </div>
        )}
      </section>
    </>
  );
}
