import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas, materi, tugas, tugasSubmissions, ujian, enrollments } from "@/lib/db/schema";
import { count, eq, isNull, isNotNull, and } from "drizzle-orm";
import { EmptyState, Icon, MenuCard, Panel, StatRows, WelcomeHeader } from "@/components/ui";

export const instant = false;

const PERMISSIONS = [
  "Mengelola kelas yang diajar",
  "Membuat tugas dan ujian",
  "Mengelola materi pembelajaran",
  "Memantau perkembangan kelas",
];
const RESPONSIBILITIES = [
  "Menyiapkan materi pembelajaran",
  "Membuat dan menilai tugas",
  "Mengelola ujian",
  "Memantau perkembangan siswa",
];

export default async function TeacherDashboard() {
  const session = await auth();
  const teacherId = (session?.user as { id: string } | null)?.id as string;
  const name = session?.user?.name ?? "Guru";

  const mine = eq(kelas.teacherId, teacherId);
  const [myKelas, [materiCount], [tugasCount], [ujianCount], [graded], [pending], [siswaCount]] = await Promise.all([
    db.select().from(kelas).where(mine),
    db.select({ n: count() }).from(materi).innerJoin(kelas, eq(materi.kelasId, kelas.id)).where(mine),
    db.select({ n: count() }).from(tugas).innerJoin(kelas, eq(tugas.kelasId, kelas.id)).where(mine),
    db.select({ n: count() }).from(ujian).innerJoin(kelas, eq(ujian.kelasId, kelas.id)).where(mine),
    db
      .select({ n: count() })
      .from(tugasSubmissions)
      .innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id))
      .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
      .where(and(mine, isNotNull(tugasSubmissions.score))),
    db
      .select({ n: count() })
      .from(tugasSubmissions)
      .innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id))
      .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
      .where(and(mine, isNull(tugasSubmissions.score))),
    db.select({ n: count() }).from(enrollments).innerJoin(kelas, eq(enrollments.kelasId, kelas.id)).where(mine),
  ]);

  return (
    <>
      <WelcomeHeader title={`Selamat datang, ${name}!`}>
        Guru — Kelola pembelajaran dan kelas Anda. Sebagai Guru, Anda dapat mengelola pembelajaran, tugas, dan ujian untuk
        kelas Anda.
      </WelcomeHeader>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:mb-12 lg:gap-8">
        <MenuCard
          href="/teacher/tugas"
          icon="assignment"
          title="Manajemen Tugas"
          description="Kelola tugas per kelas dengan kategorisasi dan tingkat kesulitan."
        />
        <MenuCard
          href="/teacher/ujian"
          icon="edit_document"
          title="Manajemen Ujian"
          description="Buat, edit, dan kelola ujian dengan fitur lengkap."
        />
        <MenuCard
          href="/teacher/materi"
          icon="folder_open"
          title="Materi"
          description="Kelola materi pembelajaran dan konten edukasi."
        />
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 md:mb-12 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
        <Panel icon="query_stats" title="Ringkasan Kelas" badge="TOTAL">
          <StatRows
            rows={[
              ["Kelas", myKelas.length, ""],
              ["Siswa terdaftar", siswaCount.n, ""],
              ["Materi", materiCount.n, ""],
            ]}
          />
        </Panel>
        <Panel icon="verified_user" title="Status Tugas">
          <StatRows
            rows={[
              ["Total tugas", tugasCount.n, ""],
              ["Menunggu dinilai", pending.n, "text-orange-600"],
              ["Sudah dinilai", graded.n, "text-green-600"],
            ]}
          />
        </Panel>
        <Panel icon="monitoring" title="Ujian">
          <StatRows rows={[["Total ujian", ujianCount.n, ""]]} />
        </Panel>
      </section>

      <section className="mb-8 md:mb-12">
        <Panel icon="school" title="Kelas Saya" bodyClassName="p-4 md:p-6">
          {myKelas.length === 0 ? (
            <EmptyState icon="school" text="Belum ada kelas." />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {myKelas.map((k) => (
                <div key={k.id} className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50">
                  <h4 className="text-xs font-bold md:text-sm">{k.name}</h4>
                  {k.description && <p className="mt-1 text-xs text-gray-500">{k.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="mb-8 overflow-hidden rounded-2xl border border-black md:mb-12 md:rounded-3xl">
        <div className="flex flex-col items-start gap-4 border-b border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center md:gap-6 md:p-6 lg:p-10">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-black text-white md:h-12 md:w-12">
            <Icon name="security" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight uppercase md:text-xl lg:text-2xl">Hak Akses Guru</h2>
            <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
              Rincian wewenang dan tanggung jawab akun guru
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b border-gray-100 p-6 md:border-r md:border-b-0 md:p-8 lg:p-10">
            <h3 className="mb-8 flex items-center gap-3 text-xs font-black tracking-[0.25em] text-gray-300 uppercase">
              <span className="h-4 w-1 bg-black" /> Hak Akses
            </h3>
            <ul className="space-y-6">
              {PERMISSIONS.map((p) => (
                <li key={p} className="flex items-start gap-4">
                  <Icon name="check_circle" filled className="text-black" />
                  <span className="text-sm leading-tight font-medium">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 md:p-8 lg:p-10">
            <h3 className="mb-8 flex items-center gap-3 text-xs font-black tracking-[0.25em] text-gray-300 uppercase">
              <span className="h-4 w-1 bg-black" /> Tanggung Jawab
            </h3>
            <ul className="space-y-6">
              {RESPONSIBILITIES.map((r) => (
                <li key={r} className="flex items-start gap-4">
                  <Icon name="star" className="text-black" />
                  <span className="text-sm leading-tight font-medium">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
