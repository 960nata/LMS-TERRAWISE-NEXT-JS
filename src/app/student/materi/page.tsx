import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { materi, kelas, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function StudentMateriPage() {
  const session = await auth();
  const studentId = (session?.user as any)?.id as string;

  const rows = await db
    .select({ id: materi.id, title: materi.title, content: materi.content, kelasName: kelas.name })
    .from(enrollments)
    .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
    .innerJoin(materi, eq(materi.kelasId, kelas.id))
    .where(eq(enrollments.studentId, studentId));

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Materi</h1>
      <div className="grid gap-3">
        {rows.length === 0 && <p className="text-sm text-gray-500">Belum ada materi.</p>}
        {rows.map((m) => (
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
