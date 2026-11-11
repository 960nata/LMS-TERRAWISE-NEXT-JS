import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { materi, kelas, enrollments } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { EmptyState, HtmlContent, Icon, PageHeader, StatCard, StatGrid, formatDate } from "@/components/ui";

export const instant = false;

export default async function StudentMateriPage() {
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const rows = await db
    .select({
      id: materi.id,
      title: materi.title,
      content: materi.content,
      fileUrl: materi.fileUrl,
      createdAt: materi.createdAt,
      kelasName: kelas.name,
    })
    .from(enrollments)
    .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
    .innerJoin(materi, eq(materi.kelasId, kelas.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(materi.createdAt));

  const kelasCount = new Set(rows.map((r) => r.kelasName)).size;

  return (
    <>
      <PageHeader title="Materi" description="Akses materi pembelajaran dari kelas yang kamu ikuti" />

      <StatGrid>
        <StatCard value={rows.length} label="Total Materi" />
        <StatCard value={kelasCount} label="Kelas" />
      </StatGrid>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-gray-100 md:rounded-2xl">
          <EmptyState icon="folder_open" text="Belum ada materi." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {rows.map((m) => (
            <details
              key={m.id}
              className="group rounded-2xl border border-gray-100 bg-white p-4 transition-all open:border-black hover:border-black md:rounded-[32px] md:p-6 lg:p-8"
            >
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="mb-4 flex items-start justify-between md:mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 transition-colors group-open:bg-black group-open:text-white group-hover:bg-black group-hover:text-white md:h-10 md:w-10 md:rounded-xl">
                    <Icon name="description" size={18} />
                  </div>
                  <Icon name="expand_more" className="text-gray-300 transition-transform group-open:rotate-180" />
                </div>
                <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">{m.kelasName}</p>
                <h3 className="mb-1 text-sm font-bold md:mb-2 md:text-base">{m.title}</h3>
                <p className="text-[10px] font-medium text-gray-400">{formatDate(m.createdAt, false)}</p>
              </summary>
              <div className="mt-4 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-700">
                <HtmlContent content={m.content} />
                {m.fileUrl && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-black underline hover:text-gray-600"
                    >
                      <Icon name="link" size={16} /> Buka Tautan Lampiran Materi ↗
                    </a>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
