import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, kelas, materi, tugas, tugasSubmissions, ujian, ujianAttempts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge, EmptyState, Icon, Panel, StatRows, WelcomeHeader, formatDate } from "@/components/ui";

export const instant = false;

export default async function StudentDashboard() {
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;
  const name = session?.user?.name ?? "Siswa";

  const enrolled = eq(enrollments.studentId, studentId);
  const [tugasRows, ujianRows, materiRows, subs, attempts] = await Promise.all([
    db
      .select({ id: tugas.id, title: tugas.title, dueDate: tugas.dueDate, kelasName: kelas.name })
      .from(enrollments)
      .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
      .innerJoin(tugas, eq(tugas.kelasId, kelas.id))
      .where(enrolled)
      .orderBy(desc(tugas.dueDate)),
    db
      .select({ id: ujian.id, title: ujian.title, startTime: ujian.startTime, kelasName: kelas.name })
      .from(enrollments)
      .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
      .innerJoin(ujian, eq(ujian.kelasId, kelas.id))
      .where(enrolled)
      .orderBy(desc(ujian.startTime)),
    db
      .select({ id: materi.id, title: materi.title, createdAt: materi.createdAt, kelasName: kelas.name })
      .from(enrollments)
      .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
      .innerJoin(materi, eq(materi.kelasId, kelas.id))
      .where(enrolled)
      .orderBy(desc(materi.createdAt)),
    db.select({ tugasId: tugasSubmissions.tugasId }).from(tugasSubmissions).where(eq(tugasSubmissions.studentId, studentId)),
    db
      .select({ ujianId: ujianAttempts.ujianId, submittedAt: ujianAttempts.submittedAt })
      .from(ujianAttempts)
      .where(eq(ujianAttempts.studentId, studentId)),
  ]);

  const doneTugas = new Set(subs.map((s) => s.tugasId));
  const doneUjian = new Set(attempts.filter((a) => a.submittedAt).map((a) => a.ujianId));
  const now = new Date();
  const completedTugas = tugasRows.filter((t) => doneTugas.has(t.id)).length;
  const completedUjian = ujianRows.filter((u) => doneUjian.has(u.id)).length;

  return (
    <>
      <WelcomeHeader title={`Selamat datang, ${name}!`}>
        Siswa — Akses pembelajaran dan penelitian IoT di <span className="font-bold text-black">terrawise.id</span>. Anda dapat
        mengakses materi pembelajaran, mengerjakan tugas, dan melakukan penelitian IoT.
      </WelcomeHeader>

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-100 bg-gray-100 lg:mb-12 lg:grid-cols-3 lg:rounded-3xl">
        <QuickCard href="/student/tugas" icon="assignment" title="Tugas Saya">
          Lihat dan kerjakan tugas yang diberikan ({tugasRows.length})
        </QuickCard>
        <QuickCard href="/student/ujian" icon="edit_document" title="Ujian Saya">
          Ikuti ujian yang telah dijadwalkan ({ujianRows.length})
        </QuickCard>
        <QuickCard href="/student/materi" icon="folder_open" title="Materi Saya" className="col-span-2 lg:col-span-1">
          Akses materi pembelajaran kelas ({materiRows.length})
        </QuickCard>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:mb-12 md:grid-cols-3 md:gap-6 lg:gap-8">
        <Panel icon="assignment" title="Status Tugas">
          <StatRows
            rows={[
              ["Total", tugasRows.length, ""],
              ["Pending", tugasRows.length - completedTugas, "text-orange-600"],
              ["Selesai", completedTugas, "text-green-600"],
            ]}
          />
        </Panel>
        <Panel icon="edit_document" title="Status Ujian">
          <StatRows
            rows={[
              ["Total", ujianRows.length, ""],
              ["Pending", ujianRows.length - completedUjian, "text-orange-600"],
              ["Selesai", completedUjian, "text-green-600"],
            ]}
          />
        </Panel>
        <Panel icon="folder_open" title="Materi Tersedia">
          <StatRows rows={[["Total Materi", materiRows.length, ""]]} />
        </Panel>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:mb-12 md:gap-8 lg:grid-cols-3">
        <Panel icon="assignment" title="Tugas Terbaru" action={<SeeAll href="/student/tugas" />}>
          {tugasRows.length === 0 ? (
            <EmptyState text="Tidak ada tugas" />
          ) : (
            <div className="space-y-4">
              {tugasRows.slice(0, 5).map((t) => (
                <Link
                  key={t.id}
                  href="/student/tugas"
                  className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 text-xs font-bold md:text-sm">{t.title}</h4>
                    {doneTugas.has(t.id) ? (
                      <Badge tone="green">Selesai</Badge>
                    ) : t.dueDate < now ? (
                      <Badge tone="red">Terlambat</Badge>
                    ) : (
                      <Badge tone="orange">Pending</Badge>
                    )}
                  </div>
                  <p className="mb-1 text-xs text-gray-500">{t.kelasName}</p>
                  <p className="text-[10px] text-gray-400">Deadline: {formatDate(t.dueDate, false)}</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel icon="edit_document" title="Ujian Terbaru" action={<SeeAll href="/student/ujian" />}>
          {ujianRows.length === 0 ? (
            <EmptyState text="Tidak ada ujian" />
          ) : (
            <div className="space-y-4">
              {ujianRows.slice(0, 5).map((u) => (
                <Link
                  key={u.id}
                  href={`/student/ujian/${u.id}`}
                  className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 text-xs font-bold md:text-sm">{u.title}</h4>
                    {doneUjian.has(u.id) ? <Badge tone="green">Selesai</Badge> : <Badge tone="orange">Pending</Badge>}
                  </div>
                  <p className="mb-1 text-xs text-gray-500">{u.kelasName}</p>
                  <p className="text-[10px] text-gray-400">Mulai: {formatDate(u.startTime)}</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel icon="folder_open" title="Materi Terbaru" action={<SeeAll href="/student/materi" />}>
          {materiRows.length === 0 ? (
            <EmptyState text="Tidak ada materi" />
          ) : (
            <div className="space-y-4">
              {materiRows.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  href="/student/materi"
                  className="block rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  <h4 className="mb-2 line-clamp-1 text-xs font-bold md:text-sm">{m.title}</h4>
                  <p className="mb-1 text-xs text-gray-500">{m.kelasName}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(m.createdAt, false)}</p>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

function QuickCard({
  href,
  icon,
  title,
  children,
  className = "",
}: {
  href: string;
  icon: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`group cursor-pointer bg-white p-4 transition-all hover:bg-gray-50 md:p-6 lg:p-8 ${className}`}>
      <div className="mb-4 flex h-8 w-8 items-center justify-center border border-black transition-colors group-hover:bg-black group-hover:text-white md:mb-6 md:h-10 md:w-10">
        <Icon name={icon} size={18} />
      </div>
      <h3 className="mb-1 text-sm font-bold md:mb-2 md:text-base">{title}</h3>
      <p className="text-xs leading-relaxed font-medium text-gray-500">{children}</p>
    </Link>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link href={href} className="text-xs text-gray-400 hover:text-black">
      Lihat semua
    </Link>
  );
}
