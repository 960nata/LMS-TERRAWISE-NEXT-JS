import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ujian, kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createUjian } from "./actions";
import Link from "next/link";

export default async function UjianPage() {
  const session = await auth();
  const teacherId = (session?.user as any)?.id as string;

  const myKelas = await db.select().from(kelas).where(eq(kelas.teacherId, teacherId));
  const myUjian = await db
    .select({ id: ujian.id, title: ujian.title, startTime: ujian.startTime, kelasName: kelas.name })
    .from(ujian)
    .innerJoin(kelas, eq(ujian.kelasId, kelas.id))
    .where(eq(kelas.teacherId, teacherId));

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Kelola Ujian</h1>
      <form action={createUjian} className="mb-8 space-y-3 rounded-lg border p-4">
        <select name="kelasId" required className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Pilih Kelas</option>
          {myKelas.map((k) => (<option key={k.id} value={k.id}>{k.name}</option>))}
        </select>
        <input name="title" placeholder="Judul ujian" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input name="startTime" type="datetime-local" required className="w-full rounded-md border px-3 py-2 text-sm" />
          <input name="endTime" type="datetime-local" required className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <input name="durationMinutes" type="number" placeholder="Durasi (menit)" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Buat Ujian</button>
      </form>
      <div className="grid gap-3">
        {myUjian.map((u) => (
          <Link key={u.id} href={`/teacher/ujian/${u.id}`} className="rounded-lg border p-4 hover:bg-gray-50">
            <p className="text-xs text-gray-400">{u.kelasName}</p>
            <p className="font-medium">{u.title}</p>
            <p className="text-sm text-gray-500">Mulai: {new Date(u.startTime).toLocaleString("id-ID")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
