import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugas, kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createTugas } from "./actions";
import Link from "next/link";

export const instant = false;

export default async function TugasPage() {
  const session = await auth();
  const teacherId = (session?.user as { id: string } | null)?.id as string;

  const myKelas = await db.select().from(kelas).where(eq(kelas.teacherId, teacherId));
  const myTugas = await db
    .select({ id: tugas.id, title: tugas.title, dueDate: tugas.dueDate, kelasName: kelas.name })
    .from(tugas)
    .innerJoin(kelas, eq(tugas.kelasId, kelas.id))
    .where(eq(kelas.teacherId, teacherId));

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Kelola Tugas</h1>
      <form action={createTugas} className="mb-8 space-y-3 rounded-lg border p-4">
        <select name="kelasId" required className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Pilih Kelas</option>
          {myKelas.map((k) => (<option key={k.id} value={k.id}>{k.name}</option>))}
        </select>
        <input name="title" placeholder="Judul tugas" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <textarea name="description" placeholder="Deskripsi tugas" required rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="dueDate" type="datetime-local" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <input name="maxScore" type="number" defaultValue={100} className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Tambah Tugas</button>
      </form>
      <div className="grid gap-3">
        {myTugas.map((t) => (
          <Link key={t.id} href={`/teacher/tugas/${t.id}`} className="rounded-lg border p-4 hover:bg-gray-50">
            <p className="text-xs text-gray-400">{t.kelasName}</p>
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-gray-500">Deadline: {new Date(t.dueDate).toLocaleString("id-ID")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
