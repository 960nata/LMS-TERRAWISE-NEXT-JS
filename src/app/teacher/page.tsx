import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function TeacherDashboard() {
  const session = await auth();
  const teacherId = (session?.user as any)?.id as string;

  const myKelas = await db.select().from(kelas).where(eq(kelas.teacherId, teacherId));

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard Guru</h1>
      <div className="mb-6 flex gap-3">
        <Link href="/teacher/materi" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Kelola Materi</Link>
        <Link href="/teacher/tugas" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Kelola Tugas</Link>
        <Link href="/teacher/ujian" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Kelola Ujian</Link>
      </div>
      <h2 className="mb-3 text-lg font-medium">Kelas Saya</h2>
      <div className="grid gap-3">
        {myKelas.length === 0 && <p className="text-sm text-gray-500">Belum ada kelas.</p>}
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
