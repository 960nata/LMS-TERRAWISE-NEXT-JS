import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { materi, kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createMateri } from "./actions";

export default async function MateriPage() {
  const session = await auth();
  const teacherId = (session?.user as any)?.id as string;

  const myKelas = await db.select().from(kelas).where(eq(kelas.teacherId, teacherId));
  const myMateri = await db
    .select({ id: materi.id, title: materi.title, content: materi.content, kelasName: kelas.name })
    .from(materi)
    .innerJoin(kelas, eq(materi.kelasId, kelas.id))
    .where(eq(kelas.teacherId, teacherId));

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Kelola Materi</h1>
      <form action={createMateri} className="mb-8 space-y-3 rounded-lg border p-4">
        <select name="kelasId" required className="w-full rounded-md border px-3 py-2 text-sm">
          <option value="">Pilih Kelas</option>
          {myKelas.map((k) => (<option key={k.id} value={k.id}>{k.name}</option>))}
        </select>
        <input name="title" placeholder="Judul materi" required className="w-full rounded-md border px-3 py-2 text-sm" />
        <textarea name="content" placeholder="Isi materi" required rows={4} className="w-full rounded-md border px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Tambah Materi</button>
      </form>
      <div className="grid gap-3">
        {myMateri.map((m) => (
          <div key={m.id} className="rounded-lg border p-4">
            <p className="text-xs text-gray-400">{m.kelasName}</p>
            <p className="font-medium">{m.title}</p>
            <p className="text-sm text-gray-500">{m.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
