import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, kelas, tugasSubmissions, tugasSoal, users } from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { deleteTugas, gradeSubmissionAction } from "./actions";
import Link from "next/link";
import {
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

export default async function TugasPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  const user = session?.user as { id: string; role: string };
  const teacherId = user.id;
  const classFilter = user.role === "TEACHER" ? eq(kelas.teacherId, teacherId) : undefined;
  const basePath =
    user.role === "SUPERADMIN"
      ? "/superadmin"
      : user.role === "ADMIN"
      ? "/admin"
      : "/teacher";

  const resolvedParams = await searchParams;
  const activeFilter = resolvedParams?.filter;

  const [myTugas, studentSubmissions] = await Promise.all([
    db
      .select({
        id: tugas.id,
        title: tugas.title,
        description: tugas.description,
        tipe: tugas.tipe,
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
        tugasId: tugas.id,
        tugasTitle: tugas.title,
        tugasTipe: tugas.tipe,
        maxScore: tugas.maxScore,
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
      .innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id))
      .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
      .innerJoin(users, eq(tugasSubmissions.studentId, users.id))
      .where(classFilter)
      .orderBy(desc(tugasSubmissions.submittedAt)),
  ]);

  // Query soal count per tugas
  const soalCounts = await db
    .select({
      tugasId: tugasSoal.tugasId,
      total: count(tugasSoal.id),
    })
    .from(tugasSoal)
    .groupBy(tugasSoal.tugasId);

  const soalCountMap = new Map(soalCounts.map((s) => [s.tugasId, s.total]));

  const now = new Date();
  const active = myTugas.filter((t) => t.dueDate >= now).length;
  const totalSubs = studentSubmissions.length;
  const gradedSubs = studentSubmissions.filter((s) => s.score !== null).length;

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

  const countMC = myTugas.filter((t) => t.tipe === "MULTIPLE_CHOICE").length;
  const countEssay = myTugas.filter((t) => t.tipe === "ESSAY").length;
  const countMandiri = myTugas.filter((t) => t.tipe === "MANDIRI").length;
  const countKelompok = myTugas.filter((t) => t.tipe === "KELOMPOK").length;

  const displayedTugas = activeFilter
    ? myTugas.filter((t) => t.tipe === activeFilter)
    : myTugas;

  return (
    <>
      <PageHeader
        title="Manajemen Tugas"
        description="Kelola 4 tipe tugas (Pilihan Ganda, Essay, Mandiri, Kelompok), atur bank soal, dan evaluasi hasil belajar siswa."
        action={
          <Link
            href={`${basePath}/tugas/create`}
            className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-4 py-2.5 text-xs md:text-sm font-bold text-white transition-all hover:bg-neutral-800 shadow-sm"
          >
            <Icon name="add" size={18} />
            <span>+ Buat Tugas Baru</span>
          </Link>
        }
      />

      <StatGrid>
        <StatCard value={myTugas.length} label="Total Tugas" />
        <StatCard value={active} label="Tugas Aktif" />
        <StatCard value={totalSubs} label="Tugas Terkumpul" />
        <StatCard value={gradedSubs} label="Sudah Dinilai" />
      </StatGrid>

      {/* 4 Model Penugasan Pembelajaran - Prominent Hero Cards */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-black flex items-center gap-2">
              <Icon name="dashboard_customize" size={20} /> 4 Model Tugas Pembelajaran
            </h2>
            <p className="text-xs text-gray-500">
              Pilih salah satu dari 4 model tugas di bawah ini untuk membuat penugasan langsung sesuai kurikulum.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pilihan Ganda */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Icon name="list_alt" size={20} />
                </div>
                <span className="rounded-full bg-black text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Auto-Grading
                </span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-black">
                1. Pilihan Ganda
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Kuis evaluasi objektif dengan opsi A, B, C, D dan kunci jawaban terotomatisasi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">{countMC} Tugas</span>
              <Link
                href={`${basePath}/tugas/create?tipe=MULTIPLE_CHOICE`}
                className="inline-flex items-center gap-1 rounded-lg border border-black bg-black px-2.5 py-1 text-[11px] font-black text-white hover:bg-neutral-800 transition-colors"
              >
                + Buat PG →
              </Link>
            </div>
          </div>

          {/* Card 2: Soal Essay */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Icon name="edit_note" size={20} />
                </div>
                <span className="rounded-full bg-neutral-800 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Koreksi Guru
                </span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-black">
                2. Soal Essay
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Tugas pertanyaan uraian analitis bebas dengan rubrik penskoran terstruktur.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">{countEssay} Tugas</span>
              <Link
                href={`${basePath}/tugas/create?tipe=ESSAY`}
                className="inline-flex items-center gap-1 rounded-lg border border-black bg-black px-2.5 py-1 text-[11px] font-black text-white hover:bg-neutral-800 transition-colors"
              >
                + Buat Essay →
              </Link>
            </div>
          </div>

          {/* Card 3: Tugas Mandiri */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Icon name="person" size={20} />
                </div>
                <span className="rounded-full bg-gray-100 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black">
                  Individu
                </span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-black">
                3. Tugas Mandiri
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Penugasan individual untuk laporan studi kasus dan pengumpulan dokumen.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">{countMandiri} Tugas</span>
              <Link
                href={`${basePath}/tugas/create?tipe=MANDIRI`}
                className="inline-flex items-center gap-1 rounded-lg border border-black bg-black px-2.5 py-1 text-[11px] font-black text-white hover:bg-neutral-800 transition-colors"
              >
                + Buat Mandiri →
              </Link>
            </div>
          </div>

          {/* Card 4: Proyek Kelompok */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Icon name="groups" size={20} />
                </div>
                <span className="rounded-full bg-gray-100 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black">
                  Kolaboratif
                </span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-black">
                4. Proyek Kelompok
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Tugas kerja kelompok terstruktur dengan pembagian anggota tim kolaborasi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">{countKelompok} Tugas</span>
              <Link
                href={`${basePath}/tugas/create?tipe=KELOMPOK`}
                className="inline-flex items-center gap-1 rounded-lg border border-black bg-black px-2.5 py-1 text-[11px] font-black text-white hover:bg-neutral-800 transition-colors"
              >
                + Buat Kelompok →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Daftar Tugas */}
      <section className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <SectionTitle icon="list_alt" title="Daftar Tugas Pembelajaran" />
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`${basePath}/tugas`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                !activeFilter
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua ({myTugas.length})
            </Link>
            <Link
              href={`${basePath}/tugas?filter=MULTIPLE_CHOICE`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "MULTIPLE_CHOICE"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pilihan Ganda ({countMC})
            </Link>
            <Link
              href={`${basePath}/tugas?filter=ESSAY`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "ESSAY"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Essay ({countEssay})
            </Link>
            <Link
              href={`${basePath}/tugas?filter=MANDIRI`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "MANDIRI"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Mandiri ({countMandiri})
            </Link>
            <Link
              href={`${basePath}/tugas?filter=KELOMPOK`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "KELOMPOK"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Kelompok ({countKelompok})
            </Link>
          </div>
        </div>

        {displayedTugas.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="assignment" text={`Belum ada tugas${activeFilter ? ` untuk kategori ${activeFilter}` : ""}.`} />
          </div>
        ) : (
          <DataTable
            columns={[
              { label: "No" },
              { label: "Judul & Tipe" },
              { label: "Kelas", className: "hidden md:table-cell" },
              { label: "Bank Soal", className: "hidden lg:table-cell" },
              { label: "Deadline", className: "hidden lg:table-cell" },
              { label: "Pengumpulan", className: "hidden md:table-cell" },
              { label: "Status" },
              { label: "Aksi", className: "text-right" },
            ]}
          >
            {displayedTugas.map((t, i) => {
              const countSoal = soalCountMap.get(t.id) ?? 0;
              const isQuestionBased = t.tipe === "MULTIPLE_CHOICE" || t.tipe === "ESSAY";
              return (
                <tr key={t.id} className="transition-colors hover:bg-gray-50/50">
                  <td className={`${tdClass} text-gray-400`}>{i + 1}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2">
                      {tipeBadge(t.tipe)}
                      <p className="font-bold text-black">{t.title}</p>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400 lg:hidden">
                      {t.kelasName} · Deadline: {formatDate(t.dueDate)}
                    </p>
                  </td>
                  <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>{t.kelasName}</td>
                  <td className={`${tdClass} hidden text-gray-500 lg:table-cell`}>
                    {isQuestionBased ? (
                      <span className="font-bold text-black">{countSoal} Soal</span>
                    ) : (
                      <span className="text-gray-400">Non-Soal (Uraian)</span>
                    )}
                  </td>
                  <td className={`${tdClass} hidden text-gray-500 lg:table-cell`}>{formatDate(t.dueDate)}</td>
                  <td className={`${tdClass} hidden text-gray-500 md:table-cell font-bold`}>
                    {t.submissions} Siswa
                  </td>
                  <td className={tdClass}>
                    {t.dueDate >= now ? <Badge tone="green">Aktif</Badge> : <Badge tone="gray">Selesai</Badge>}
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`${basePath}/tugas/${t.id}`}
                        className="rounded border border-black bg-white px-2.5 py-1 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors"
                      >
                        {isQuestionBased ? "Kelola Soal →" : "Detail & Koreksi →"}
                      </Link>
                      <form action={deleteTugas}>
                        <input type="hidden" name="tugasId" value={t.id} />
                        <button
                          type="submit"
                          className="text-xs font-bold text-red-600 hover:text-red-800 underline ml-1"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </section>

      {/* Pengumpulan Jawaban & Penilaian Siswa */}
      <section className="mt-12">
        <SectionTitle icon="grading" title="Pengumpulan Jawaban Siswa &amp; Form Penilaian Cepat" />
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
                      {tipeBadge(sub.tugasTipe)}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 font-medium">
                      Tugas: <span className="font-bold text-black">{sub.tugasTitle}</span>
                    </p>
                    {sub.groupName && (
                      <p className="mt-0.5 text-xs font-bold text-black">
                        Kelompok: <span className="bg-black text-white px-1.5 py-0.5 rounded text-[10px]">{sub.groupName}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Dikumpul: {formatDate(sub.submittedAt, true)}</span>
                    {sub.score !== null ? (
                      <Badge tone="green">Dinilai: {sub.score}/{sub.maxScore}</Badge>
                    ) : (
                      <Badge tone="orange">Perlu Dinilai</Badge>
                    )}
                    <Link
                      href={`${basePath}/tugas/${sub.tugasId}`}
                      className="text-xs font-bold text-black underline hover:text-gray-600 ml-2"
                    >
                      Buka Rincian Soal &amp; Koreksi ↗
                    </Link>
                  </div>
                </div>

                {sub.groupMembers && (
                  <div className="mt-3 p-2.5 bg-gray-50 rounded-lg text-xs border border-gray-100">
                    <span className="font-bold text-gray-500 block mb-0.5">Anggota Kelompok:</span>
                    <p className="text-gray-800">{sub.groupMembers}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Jawaban Siswa:</p>
                  <div className="mt-1.5 rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {sub.answerText || "Jawaban tersimpan pada bank soal tugas."}
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
