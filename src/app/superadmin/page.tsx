import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas, users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { MenuCard, SectionTitle, StatCard, StatGrid, WelcomeHeader } from "@/components/ui";

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
