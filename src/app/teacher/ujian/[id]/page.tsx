import { db } from "@/lib/db";
import { requireClassManager } from "@/lib/access";
import { notFound } from "next/navigation";
import { ujian, soal, ujianAttempts, users } from "@/lib/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { addSoal, deleteSoal } from "../actions";
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

export default async function UjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [u] = await db.select().from(ujian).where(eq(ujian.id, id));
  if (!u) notFound();
  const user = await requireClassManager(u.kelasId);
  const backPath = user.role === "SUPERADMIN" ? "/superadmin/ujian" : user.role === "ADMIN" ? "/admin/ujian" : "/teacher/ujian";

  const [soalList, attempts] = await Promise.all([
    db.select().from(soal).where(eq(soal.ujianId, id)).orderBy(asc(soal.order), asc(soal.id)),
    db
      .select({
        id: ujianAttempts.id,
        studentName: users.name,
        studentEmail: users.email,
        score: ujianAttempts.score,
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

  return (
    <>
      <Link
        href={backPath}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
      >
        <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Ujian
      </Link>
      <PageHeader
        title={u?.title ?? "Ujian"}
        description={
          u
            ? `${formatDate(u.startTime)} — ${formatDate(u.endTime)} · Durasi: ${u.durationMinutes} menit`
            : undefined
        }
        action={
          <ActionModal
            triggerText="Tambah Soal"
            triggerIcon="add"
            title="Tambah Soal Pilihan Ganda"
            description="Tambahkan pertanyaan baru beserta 4 pilihan jawaban dan kunci jawaban yang benar."
          >
            <form action={addSoalBound} className="space-y-4">
              <div>
                <Label htmlFor="question">Pertanyaan Soal</Label>
                <textarea
                  id="question"
                  name="question"
                  placeholder="Tuliskan teks pertanyaan soal..."
                  required
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["A", "B", "C", "D"] as const).map((o) => (
                  <div key={o}>
                    <Label htmlFor={`option${o}`}>Pilihan {o}</Label>
                    <input
                      id={`option${o}`}
                      name={`option${o}`}
                      placeholder={`Teks pilihan ${o}`}
                      required
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="correctAnswer">Kunci Jawaban Benar</Label>
                  <select id="correctAnswer" name="correctAnswer" required className={inputClass}>
                    <option value="">Pilih jawaban</option>
                    {["A", "B", "C", "D"].map((o) => (
                      <option key={o} value={o}>
                        Opsi {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="points">Bobot Poin Soal</Label>
                  <input id="points" name="points" type="number" defaultValue={25} required className={inputClass} />
                </div>
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
        <StatCard value={soalList.length} label="Jumlah Soal" />
        <StatCard value={totalPoin} label="Total Poin" />
        <StatCard value={attempts.length} label="Peserta Mengerjakan" />
      </StatGrid>

      {/* Daftar Soal */}
      <section className="mt-8">
        <SectionTitle icon="quiz" title="Bank Soal Ujian" />
        {soalList.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="quiz" text="Belum ada soal pada ujian ini." />
          </div>
        ) : (
          <div className="space-y-4">
            {soalList.map((s, idx) => {
              const options = s.options as string[];
              return (
                <div
                  key={s.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-black md:p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <p className="text-sm font-bold text-black">
                      <span className="mr-2 text-gray-400 font-extrabold">{String(idx + 1).padStart(2, "0")}</span>
                      {s.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-700 uppercase">
                        {s.points} POIN
                      </span>
                      <form action={deleteSoal.bind(null, id, s.id)}>
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-600 hover:bg-red-50 uppercase"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </div>
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Hasil Ujian Siswa */}
      <section className="mt-12">
        <SectionTitle icon="military_tech" title="Hasil &amp; Skor Peserta Ujian" />
        {attempts.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="pending_actions" text="Belum ada siswa yang menyelesaikan ujian ini." />
          </div>
        ) : (
          <DataTable
            columns={[
              { label: "Nama Siswa" },
              { label: "Email", className: "hidden md:table-cell" },
              { label: "Waktu Selesai", className: "hidden lg:table-cell" },
              { label: "Skor Akhir" },
              { label: "Status", className: "text-right" },
            ]}
          >
            {attempts.map((att) => (
              <tr key={att.id} className="hover:bg-gray-50/50 transition-colors">
                <td className={tdClass}>
                  <span className="font-bold text-black">{att.studentName}</span>
                </td>
                <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>{att.studentEmail}</td>
                <td className={`${tdClass} hidden text-gray-500 lg:table-cell`}>
                  {att.submittedAt ? formatDate(att.submittedAt, true) : "-"}
                </td>
                <td className={`${tdClass} font-black text-base text-black`}>
                  {att.score ?? 0} <span className="text-xs font-medium text-gray-400">/ 100</span>
                </td>
                <td className={`${tdClass} text-right`}>
                  {(att.score ?? 0) >= 75 ? (
                    <Badge tone="green">Lulus (KKM)</Badge>
                  ) : (
                    <Badge tone="red">Remedial</Badge>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
