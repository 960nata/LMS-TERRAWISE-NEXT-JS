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
      tipe: ujian.tipe,
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

  const tipeBadge = (tipe: string) => {
    switch (tipe) {
      case "MULTIPLE_CHOICE":
        return <Badge tone="black">Pilihan Ganda</Badge>;
      case "ESSAY":
        return <Badge tone="black">Essay</Badge>;
      case "MIXED":
      default:
        return <Badge tone="orange">Campuran (PG + Essay)</Badge>;
    }
  };

  return (
    <>
      <PageHeader
        title="Manajemen Ujian"
        description="Buat dan kelola 3 tipe ujian (Pilihan Ganda, Essay, Campuran), atur durasi timer, dan input bank soal."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`${basePath}/ujian/create`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black bg-black px-4 py-2.5 text-xs md:text-sm font-bold text-white transition-all hover:bg-neutral-800 shadow-sm"
            >
              <Icon name="add" size={18} />
              <span>+ Jadwalkan Ujian Baru</span>
            </Link>
            <ActionModal
              triggerText="Buka Modal"
              triggerIcon="open_in_new"
              title="Buat Ujian Baru (3 Tipe Ujian)"
              description="Jadwalkan sesi ujian berbasis timer untuk siswa dengan tipe Pilihan Ganda, Essay, atau Campuran."
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
                  <Label htmlFor="tipe">Tipe Ujian</Label>
                  <select id="tipe" name="tipe" required className={inputClass}>
                    <option value="MULTIPLE_CHOICE">1. Pilihan Ganda (Auto-Grading)</option>
                    <option value="ESSAY">2. Soal Essay (Penilaian Manual Guru)</option>
                    <option value="MIXED">3. Campuran (Pilihan Ganda &amp; Soal Essay)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="title">Judul Ujian</Label>
                  <input
                    id="title"
                    name="title"
                    placeholder="cth: UTS Teori Komputasi atau Ujian Akhir Semester"
                    required
                    className={inputClass}
                  />
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
                  <input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    placeholder="60"
                    defaultValue={60}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className={`${primaryButtonClass} w-full`}>
                    <Icon name="add" size={18} /> Simpan &amp; Terbitkan Jadwal Ujian
                  </button>
                </div>
              </form>
            </ActionModal>
          </div>
        }
      />

      <StatGrid>
        <StatCard value={myUjian.length} label="Total Ujian" />
        <StatCard value={live} label="Sedang Berlangsung" />
        <StatCard value={upcoming} label="Akan Datang" />
        <StatCard value={myUjian.length - live - upcoming} label="Selesai" />
      </StatGrid>

      {/* Ringkasan 3 Tipe Ujian dengan Quick Action Buat */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href={`${basePath}/ujian/create?tipe=MULTIPLE_CHOICE`}
          className="group rounded-xl border border-black bg-white p-3.5 text-center transition-all hover:bg-black hover:text-white"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-300">Tipe 1</p>
          <p className="font-bold text-xs sm:text-sm mt-0.5">Pilihan Ganda</p>
          <p className="text-[10px] text-gray-500 group-hover:text-gray-300 mt-1">
            {myUjian.filter((u) => u.tipe === "MULTIPLE_CHOICE").length} Ujian
          </p>
          <span className="mt-2 inline-block rounded-md bg-gray-100 group-hover:bg-white group-hover:text-black px-2 py-0.5 text-[10px] font-bold">
            + Buat Ujian PG
          </span>
        </Link>
        <Link
          href={`${basePath}/ujian/create?tipe=ESSAY`}
          className="group rounded-xl border border-black bg-white p-3.5 text-center transition-all hover:bg-black hover:text-white"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-300">Tipe 2</p>
          <p className="font-bold text-xs sm:text-sm mt-0.5">Soal Essay</p>
          <p className="text-[10px] text-gray-500 group-hover:text-gray-300 mt-1">
            {myUjian.filter((u) => u.tipe === "ESSAY").length} Ujian
          </p>
          <span className="mt-2 inline-block rounded-md bg-gray-100 group-hover:bg-white group-hover:text-black px-2 py-0.5 text-[10px] font-bold">
            + Buat Ujian Essay
          </span>
        </Link>
        <Link
          href={`${basePath}/ujian/create?tipe=MIXED`}
          className="group rounded-xl border border-black bg-white p-3.5 text-center transition-all hover:bg-black hover:text-white"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-300">Tipe 3</p>
          <p className="font-bold text-xs sm:text-sm mt-0.5">Campuran (PG + Essay)</p>
          <p className="text-[10px] text-gray-500 group-hover:text-gray-300 mt-1">
            {myUjian.filter((u) => u.tipe === "MIXED").length} Ujian
          </p>
          <span className="mt-2 inline-block rounded-md bg-gray-100 group-hover:bg-white group-hover:text-black px-2 py-0.5 text-[10px] font-bold">
            + Buat Campuran
          </span>
        </Link>
      </div>

      <section className="mt-8">
        <SectionTitle icon="list_alt" title="Daftar Ujian Terjadwal" />
        {myUjian.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="quiz" text="Belum ada ujian." />
          </div>
        ) : (
          <DataTable
            columns={[
              { label: "No" },
              { label: "Judul & Tipe" },
              { label: "Kelas", className: "hidden md:table-cell" },
              { label: "Jadwal & Durasi", className: "hidden lg:table-cell" },
              { label: "Jumlah Soal", className: "hidden md:table-cell" },
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
                      {tipeBadge(u.tipe)}
                      <p className="font-bold">{u.title}</p>
                      {s === "live" ? (
                        <Badge tone="green">Berlangsung</Badge>
                      ) : s === "upcoming" ? (
                        <Badge tone="orange">Akan datang</Badge>
                      ) : (
                        <Badge tone="gray">Selesai</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">Durasi: {u.durationMinutes} menit</p>
                  </td>
                  <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>{u.kelasName}</td>
                  <td className={`${tdClass} hidden text-gray-500 lg:table-cell`}>
                    <p className="font-medium">{formatDate(u.startTime)}</p>
                    <p className="text-[10px] text-gray-400">s/d {formatDate(u.endTime)}</p>
                  </td>
                  <td className={`${tdClass} hidden text-gray-500 md:table-cell font-bold`}>
                    {u.soalCount} Soal
                  </td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`${basePath}/ujian/${u.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-black px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-black hover:text-white"
                      >
                        <Icon name="edit" size={14} /> Kelola Soal &amp; Nilai
                      </Link>
                      <form action={deleteUjian}>
                        <input type="hidden" name="ujianId" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
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
