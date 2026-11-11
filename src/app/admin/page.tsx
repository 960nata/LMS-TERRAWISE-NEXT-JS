import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas, users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { Icon, StatCard, StatGrid, WelcomeHeader } from "@/components/ui";

export const instant = false;

const PERMISSIONS = [
  "Kelola pengguna sistem (Guru dan Siswa)",
  "Akses ke fitur manajemen",
  "Konfigurasi sistem",
  "Monitoring aktivitas pengguna",
];
const RESPONSIBILITIES = [
  "Memastikan keamanan sistem",
  "Mengelola data pengguna",
  "Konfigurasi aplikasi",
  "Backup dan maintenance",
];

export default async function AdminDashboard() {
  const session = await auth();
  const name = session?.user?.name ?? "Admin";

  const [[guru], [siswa], [kelasCount], [all]] = await Promise.all([
    db.select({ n: count() }).from(users).where(eq(users.role, "TEACHER")),
    db.select({ n: count() }).from(users).where(eq(users.role, "STUDENT")),
    db.select({ n: count() }).from(kelas),
    db.select({ n: count() }).from(users),
  ]);

  return (
    <>
      <WelcomeHeader title={`Selamat datang, ${name}!`}>
        Admin — Kelola sistem Terra Assessment dengan akses admin. Sebagai Admin, Anda memiliki akses untuk mengelola sistem
        Terra Assessment.
      </WelcomeHeader>

      <StatGrid>
        <StatCard value={all.n} label="Total Pengguna" />
        <StatCard value={guru.n} label="Guru" />
        <StatCard value={siswa.n} label="Siswa" />
        <StatCard value={kelasCount.n} label="Kelas" />
      </StatGrid>

      <section className="mb-8 overflow-hidden rounded-2xl border border-black md:mb-12 md:rounded-3xl">
        <div className="flex flex-col items-start gap-4 border-b border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center md:gap-6 md:p-6 lg:p-10">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-black text-white md:h-12 md:w-12">
            <Icon name="security" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight uppercase md:text-xl lg:text-2xl">Hak Akses Admin</h2>
            <p className="mt-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
              Rincian wewenang dan tanggung jawab akun admin
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
