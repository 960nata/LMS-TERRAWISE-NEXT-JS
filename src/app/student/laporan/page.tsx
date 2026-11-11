import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, tugasSubmissions, ujian, ujianAttempts, kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EmptyState, PageHeader, StatCard, StatGrid, formatDate } from "@/components/ui";

export const instant = false;

export default async function StudentReportPage() {
  const session = await auth();
  const studentId = (session?.user as { id?: string } | null)?.id;
  if (!studentId) return null;

  const [tugasRows, ujianRows] = await Promise.all([
    db
      .select({
        id: tugasSubmissions.id,
        title: tugas.title,
        maxScore: tugas.maxScore,
        score: tugasSubmissions.score,
        feedback: tugasSubmissions.feedback,
        submittedAt: tugasSubmissions.submittedAt,
        kelasName: kelas.name,
      })
      .from(tugasSubmissions)
      .innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id))
      .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
      .where(eq(tugasSubmissions.studentId, studentId)),
    db
      .select({
        id: ujianAttempts.id,
        title: ujian.title,
        score: ujianAttempts.score,
        submittedAt: ujianAttempts.submittedAt,
        kelasName: kelas.name,
      })
      .from(ujianAttempts)
      .innerJoin(ujian, eq(ujianAttempts.ujianId, ujian.id))
      .innerJoin(kelas, eq(ujian.kelasId, kelas.id))
      .where(eq(ujianAttempts.studentId, studentId)),
  ]);

  const allScores = [
    ...tugasRows.filter((t) => t.score !== null).map((t) => t.score as number),
    ...ujianRows.filter((u) => u.score !== null).map((u) => u.score as number),
  ];

  const avg =
    allScores.length > 0
      ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
      : "N/A";

  const totalPassed = allScores.filter((s) => s >= 75).length;

  return (
    <>
      <PageHeader
        title="Laporan Nilai & Hasil Belajar"
        description="Rekapitulasi nilai tugas mandiri, kelompok, dan hasil pengerjaan ujian berbasis IoT."
      />

      <StatGrid>
        <StatCard value={avg} label="Nilai Rata-rata" />
        <StatCard value={tugasRows.length} label="Tugas Dinilai" />
        <StatCard value={ujianRows.length} label="Ujian Selesai" />
        <StatCard value={totalPassed} label="Mencapai KKM (>=75)" />
      </StatGrid>

      {/* Nilai Tugas */}
      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
            Daftar Nilai Tugas
          </h2>
          <span className="text-xs font-bold text-gray-400">{tugasRows.length} Tugas</span>
        </div>

        {tugasRows.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-6">
            <EmptyState icon="assignment" text="Belum ada riwayat nilai tugas." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/60 font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Tugas &amp; Kelas</th>
                    <th className="px-6 py-4">Tanggal Kumpul</th>
                    <th className="px-6 py-4">Nilai</th>
                    <th className="px-6 py-4">Status KKM</th>
                    <th className="px-6 py-4">Catatan Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {tugasRows.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-black">{t.title}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">{t.kelasName}</div>
                      </td>
                      <td className="px-6 py-4">{formatDate(t.submittedAt, false)}</td>
                      <td className="px-6 py-4 text-sm font-black text-black">
                        {t.score !== null ? `${t.score} / ${t.maxScore}` : "Belum Dinilai"}
                      </td>
                      <td className="px-6 py-4">
                        {t.score !== null ? (
                          t.score >= 75 ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                              Tuntas
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800 uppercase">
                              Remedial
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{t.feedback ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Nilai Ujian */}
      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
            Daftar Nilai Ujian
          </h2>
          <span className="text-xs font-bold text-gray-400">{ujianRows.length} Ujian</span>
        </div>

        {ujianRows.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-6">
            <EmptyState icon="quiz" text="Belum ada riwayat nilai ujian." />
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/60 font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Judul Ujian</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Waktu Selesai</th>
                    <th className="px-6 py-4">Skor Akhir</th>
                    <th className="px-6 py-4">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {ujianRows.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-black">{u.title}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">{u.kelasName}</td>
                      <td className="px-6 py-4">{u.submittedAt ? formatDate(u.submittedAt, true) : "-"}</td>
                      <td className="px-6 py-4 text-sm font-black text-black">{u.score ?? 0} / 100</td>
                      <td className="px-6 py-4">
                        {(u.score ?? 0) >= 85 ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                            Sangat Baik (A)
                          </span>
                        ) : (u.score ?? 0) >= 75 ? (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                            Baik (B)
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800 uppercase">
                            Perlu Remedial
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
