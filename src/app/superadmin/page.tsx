import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas, users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { Icon, MenuCard, SectionTitle, StatCard, StatGrid, WelcomeHeader } from "@/components/ui";

export const instant = false;

export default async function SuperadminDashboard() {
  const session = await auth();
  const [[all], [teachers], [students], [classes]] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(users).where(eq(users.role, "TEACHER")),
    db.select({ n: count() }).from(users).where(eq(users.role, "STUDENT")),
    db.select({ n: count() }).from(kelas),
  ]);
  return <>
    <WelcomeHeader title={`Selamat datang, ${session?.user?.name ?? "Super Administrator"}!`}>
      Super Admin — Kontrol penuh atas sistem terrawise.id. Kelola ekosistem pembelajaran dalam satu tempat.
    </WelcomeHeader>

    {/* Aksi Cepat Buat Tugas, Ujian, Materi untuk Superadmin */}
    <div className="mb-8 rounded-2xl border-2 border-black bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold uppercase tracking-tight text-black flex items-center gap-2">
            <Icon name="add_circle" size={20} /> Aksi Cepat Buat Pembelajaran
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Buat penugasan 4 tipe, jadwalkan ujian online 3 tipe, atau publikasikan modul materi baru.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/superadmin/tugas/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white uppercase hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Icon name="assignment" size={16} /> + Buat Tugas
          </Link>
          <Link
            href="/superadmin/ujian/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white uppercase hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Icon name="quiz" size={16} /> + Jadwalkan Ujian
          </Link>
          <Link
            href="/superadmin/materi/create"
            className="inline-flex items-center gap-1.5 rounded-xl border border-black bg-white px-4 py-2.5 text-xs font-bold text-black uppercase hover:bg-black hover:text-white transition-colors"
          >
            <Icon name="description" size={16} /> + Upload Materi
          </Link>
        </div>
      </div>
    </div>

    <StatGrid><StatCard value={all.n} label="Total Pengguna" /><StatCard value={teachers.n} label="Guru" /><StatCard value={students.n} label="Siswa" /><StatCard value={classes.n} label="Kelas" /></StatGrid>
    <SectionTitle icon="apps" title="Menu Manajemen" />
    <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MenuCard href="/superadmin/pengguna" icon="groups" title="Manajemen Pengguna" description="Kelola akun pengguna sistem." />
      <MenuCard href="/superadmin/kelas" icon="meeting_room" title="Manajemen Kelas" description="Buat kelas dan atur keanggotaan siswa." />
      <MenuCard href="/superadmin/laporan" icon="analytics" title="Laporan" description="Lihat ringkasan pembelajaran dan unduh nilai tugas." />
      <MenuCard href="/superadmin/materi" icon="folder_open" title="Manajemen Materi" description="Lihat dan kelola materi pembelajaran." />
      <MenuCard href="/superadmin/tugas" icon="assignment" title="Manajemen Tugas" description="Lihat dan kelola tugas pembelajaran." />
      <MenuCard href="/superadmin/ujian" icon="quiz" title="Manajemen Ujian" description="Lihat dan kelola ujian sekolah." />
    </div>
  </>;
}
