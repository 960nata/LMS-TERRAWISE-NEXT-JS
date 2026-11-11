import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ujian, kelas, soal } from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { deleteUjian } from "./actions";
import Link from "next/link";
import {
  Badge,
  DataTable,
  EmptyState,
  Icon,
  PageHeader,
  SectionTitle,
  StatCard,
  StatGrid,
  formatDate,
  tdClass,
} from "@/components/ui";

export const instant = false;

export default async function UjianPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  const user = session?.user as { id: string; role: string };
  const teacherId = user.id;
  const classFilter = user.role === "TEACHER" ? eq(kelas.teacherId, teacherId) : undefined;
  const basePath = user.role === "SUPERADMIN" ? "/superadmin" : user.role === "ADMIN" ? "/admin" : "/teacher";

  const resolvedParams = await searchParams;
  const activeFilter = resolvedParams?.filter;

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

  const countMC = myUjian.filter((u) => u.tipe === "MULTIPLE_CHOICE").length;
  const countEssay = myUjian.filter((u) => u.tipe === "ESSAY").length;
  const countMixed = myUjian.filter((u) => u.tipe === "MIXED").length;

  const displayedUjian = activeFilter
    ? myUjian.filter((u) => u.tipe === activeFilter)
    : myUjian;

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
          <Link
            href={`${basePath}/ujian/create`}
            className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-4 py-2.5 text-xs md:text-sm font-bold text-white transition-all hover:bg-neutral-800 shadow-sm"
          >
            <Icon name="add" size={18} />
            <span>+ Jadwalkan Ujian Baru</span>
          </Link>
        }
      />

      <StatGrid>
        <StatCard value={myUjian.length} label="Total Ujian" />
        <StatCard value={live} label="Sedang Berlangsung" />
        <StatCard value={upcoming} label="Akan Datang" />
        <StatCard value={myUjian.length - live - upcoming} label="Selesai" />
      </StatGrid>

      {/* 3 Model Ujian Sekolah - Prominent Hero Cards */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-base font-black uppercase tracking-tight text-black flex items-center gap-2">
            <Icon name="quiz" size={20} /> 3 Model Ujian Terjadwal
          </h2>
          <p className="text-xs text-gray-500">
            Pilih tipe ujian di bawah untuk menjadwalkan sesi evaluasi dengan timer otomatis dan acak butir soal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Pilihan Ganda */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Icon name="quiz" size={20} />
                </div>
                <span className="rounded-full bg-black text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Auto-Grading
                </span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-black">
                1. Ujian Pilihan Ganda
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Evaluasi objektif berbasis durasi waktu hitung mundur dengan sistem penilaian otomatis instan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">{countMC} Ujian</span>
              <Link
                href={`${basePath}/ujian/create?tipe=MULTIPLE_CHOICE`}
                className="inline-flex items-center gap-1 rounded-lg border border-black bg-black px-2.5 py-1 text-[11px] font-black text-white hover:bg-neutral-800 transition-colors"
              >
                + Jadwalkan PG →
              </Link>
            </div>
          </div>

          {/* Card 2: Ujian Essay */}
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
                2. Ujian Soal Essay
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Ujian uraian komprehensif dengan rubrik penskoran terstandar dan penilaian manual oleh penguji.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">{countEssay} Ujian</span>
              <Link
                href={`${basePath}/ujian/create?tipe=ESSAY`}
                className="inline-flex items-center gap-1 rounded-lg border border-black bg-black px-2.5 py-1 text-[11px] font-black text-white hover:bg-neutral-800 transition-colors"
              >
                + Jadwalkan Essay →
              </Link>
            </div>
          </div>

          {/* Card 3: Ujian Campuran */}
          <div className="rounded-2xl border-2 border-black bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <Icon name="splitscreen" size={20} />
                </div>
                <span className="rounded-full bg-gray-100 text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black">
                  Kombinasi
                </span>
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight text-black">
                3. Campuran (PG + Essay)
              </h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Format ujian UTS/UAS terintegrasi yang memadukan butir pilihan ganda dan pertanyaan uraian.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">{countMixed} Ujian</span>
              <Link
                href={`${basePath}/ujian/create?tipe=MIXED`}
                className="inline-flex items-center gap-1 rounded-lg border border-black bg-black px-2.5 py-1 text-[11px] font-black text-white hover:bg-neutral-800 transition-colors"
              >
                + Jadwalkan Campuran →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Daftar Ujian */}
      <section className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <SectionTitle icon="list_alt" title="Daftar Ujian Terjadwal" />
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`${basePath}/ujian`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                !activeFilter
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Semua ({myUjian.length})
            </Link>
            <Link
              href={`${basePath}/ujian?filter=MULTIPLE_CHOICE`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "MULTIPLE_CHOICE"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Pilihan Ganda ({countMC})
            </Link>
            <Link
              href={`${basePath}/ujian?filter=ESSAY`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "ESSAY"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Essay ({countEssay})
            </Link>
            <Link
              href={`${basePath}/ujian?filter=MIXED`}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                activeFilter === "MIXED"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Campuran ({countMixed})
            </Link>
          </div>
        </div>

        {displayedUjian.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="quiz" text={`Belum ada ujian${activeFilter ? ` untuk kategori ${activeFilter}` : ""}.`} />
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
            {displayedUjian.map((u, i) => {
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
