import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ujian, kelas, soal } from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { createUjian, deleteUjian } from "./actions";
import Link from "next/link";
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

export default async function UjianPage() {
  const session = await auth();
  const user = session?.user as { id: string; role: string };
  const teacherId = user.id;
  const classFilter = user.role === "TEACHER" ? eq(kelas.teacherId, teacherId) : undefined;
  const basePath = user.role === "SUPERADMIN" ? "/superadmin" : user.role === "ADMIN" ? "/admin" : "/teacher";

  const myKelas = await db.select().from(kelas).where(classFilter);
  const myUjian = await db
    .select({
      id: ujian.id,
      title: ujian.title,
      startTime: ujian.startTime,
      endTime: ujian.endTime,
      durationMinutes: ujian.durationMinutes,
      kelasName: kelas.name,
      soalCount: count(soal.id),
    })
    .from(ujian)
    .innerJoin(kelas, eq(ujian.kelasId, kelas.id))
    .leftJoin(soal, eq(soal.ujianId, ujian.id))
    .where(classFilter)
    .groupBy(ujian.id, kelas.name)
    .orderBy(desc(ujian.startTime));

  const now = new Date();
  const status = (u: (typeof myUjian)[number]) =>
    now < u.startTime ? "upcoming" : now > u.endTime ? "done" : "live";
  const live = myUjian.filter((u) => status(u) === "live").length;
  const upcoming = myUjian.filter((u) => status(u) === "upcoming").length;

  return (
    <>
      <PageHeader
        title="Manajemen Ujian"
        description="Buat, edit, dan kelola ujian dengan fitur lengkap"
        action={
          <ActionModal
            triggerText="Buat Ujian"
            triggerIcon="add"
            title="Buat Ujian Baru"
            description="Jadwalkan sesi ujian pilihan ganda berbasis timer untuk siswa di kelas."
          >
            <form action={createUjian} className="space-y-4">
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
                <Label htmlFor="title">Judul Ujian</Label>
                <input id="title" name="title" placeholder="cth: Evaluasi Tengah Semester - Sains Terapan" required className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Waktu Mulai</Label>
                  <input id="startTime" name="startTime" type="datetime-local" required className={inputClass} />
                </div>
                <div>
                  <Label htmlFor="endTime">Waktu Selesai</Label>
                  <input id="endTime" name="endTime" type="datetime-local" required className={inputClass} />
                </div>
              </div>
              <div>
                <Label htmlFor="durationMinutes">Durasi Pengerjaan (Menit)</Label>
                <input id="durationMinutes" name="durationMinutes" type="number" placeholder="90" required className={inputClass} />
              </div>
              <div className="pt-2">
                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  <Icon name="add" size={18} /> Simpan &amp; Terbitkan Jadwal Ujian
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      <StatGrid>
        <StatCard value={myUjian.length} label="Total Ujian" />
        <StatCard value={live} label="Sedang Berlangsung" />
        <StatCard value={upcoming} label="Akan Datang" />
        <StatCard value={myUjian.length - live - upcoming} label="Selesai" />
      </StatGrid>

      <section>
        <SectionTitle icon="list_alt" title="Daftar Ujian" />
        {myUjian.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="quiz" text="Belum ada ujian." />
          </div>
        ) : (
          <DataTable
            columns={[
              { label: "No" },
              { label: "Judul" },
              { label: "Kelas", className: "hidden md:table-cell" },
              { label: "Jadwal", className: "hidden lg:table-cell" },
              { label: "Soal", className: "hidden md:table-cell" },
              { label: "Aksi", className: "text-right" },
            ]}
          >
            {myUjian.map((u, i) => {
              const s = status(u);
              return (
                <tr key={u.id} className="transition-colors hover:bg-gray-50/50">
                  <td className={`${tdClass} text-gray-400`}>{i + 1}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{u.title}</p>
                      {s === "live" ? (
                        <Badge tone="green">Berlangsung</Badge>
                      ) : s === "upcoming" ? (
                        <Badge tone="orange">Akan datang</Badge>
                      ) : (
                        <Badge tone="gray">Selesai</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">{u.durationMinutes} menit</p>
                  </td>
                  <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>{u.kelasName}</td>
                  <td className={`${tdClass} hidden text-gray-500 lg:table-cell`}>{formatDate(u.startTime)}</td>
                  <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>{u.soalCount}</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`${basePath}/ujian/${u.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
                      >
                        <Icon name="edit" size={14} /> Kelola Soal
                      </Link>
                      <form action={deleteUjian}>
                        <input type="hidden" name="ujianId" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-2 py-1.5 text-[10px] font-bold tracking-widest text-red-600 uppercase transition-colors hover:bg-red-50"
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
    </>
  );
}
