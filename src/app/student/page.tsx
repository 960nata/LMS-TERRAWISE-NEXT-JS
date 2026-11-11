import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const instant = false;

export default async function StudentDashboard() {
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const myKelas = await db
    .select({ id: kelas.id, name: kelas.name, description: kelas.description })
    .from(enrollments)
    .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
    .where(eq(enrollments.studentId, studentId));

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard Siswa</h1>
      <div className="mb-6 flex gap-3">
        <Link href="/student/materi" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Materi</Link>
        <Link href="/student/tugas" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Tugas</Link>
        <Link href="/student/ujian" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Ujian</Link>
      </div>
      <h2 className="mb-3 text-lg font-medium">Kelas yang Diikuti</h2>
      <div className="grid gap-3">
        {myKelas.length === 0 && <p className="text-sm text-gray-500">Belum terdaftar di kelas manapun.</p>}
        {myKelas.map((k) => (
          <div key={k.id} className="rounded-lg border p-4">
            <p className="font-medium">{k.name}</p>
            <p className="text-sm text-gray-500">{k.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
