import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enrollments, kelas, ujian, ujianAttempts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Badge, DataTable, EmptyState, Icon, PageHeader, StatCard, StatGrid, formatDate, tdClass } from "@/components/ui";

export const instant = false;

export default async function StudentUjianListPage() {
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const [rows, attempts] = await Promise.all([
    db
      .select({
        id: ujian.id,
        title: ujian.title,
        startTime: ujian.startTime,
        endTime: ujian.endTime,
        durationMinutes: ujian.durationMinutes,
        kelasName: kelas.name,
      })
      .from(enrollments)
      .innerJoin(kelas, eq(enrollments.kelasId, kelas.id))
      .innerJoin(ujian, eq(ujian.kelasId, kelas.id))
      .where(eq(enrollments.studentId, studentId))
      .orderBy(desc(ujian.startTime)),
    db.select().from(ujianAttempts).where(eq(ujianAttempts.studentId, studentId)),
  ]);

  const attemptMap = new Map(attempts.filter((a) => a.submittedAt).map((a) => [a.ujianId, a]));
  const now = new Date();
  const done = rows.filter((u) => attemptMap.has(u.id)).length;
  const live = rows.filter((u) => !attemptMap.has(u.id) && u.startTime <= now && now <= u.endTime).length;

  return (
    <>
      <PageHeader title="Ujian Saya" description="Ikuti ujian yang telah dijadwalkan" />

      <StatGrid>
        <StatCard value={rows.length} label="Total Ujian" />
        <StatCard value={live} label="Bisa Dikerjakan" />
        <StatCard value={done} label="Selesai" />
      </StatGrid>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-gray-100 md:rounded-2xl">
          <EmptyState icon="quiz" text="Tidak ada ujian." />
        </div>
      ) : (
        <DataTable
          columns={[
            { label: "No" },
            { label: "Ujian" },
            { label: "Jadwal", className: "hidden md:table-cell" },
            { label: "Status", className: "hidden md:table-cell" },
            { label: "Aksi", className: "text-right" },
          ]}
        >
          {rows.map((u, i) => {
            const attempt = attemptMap.get(u.id);
            const upcoming = now < u.startTime;
            const closed = now > u.endTime;
            return (
              <tr key={u.id} className="transition-colors hover:bg-gray-50/50">
                <td className={`${tdClass} text-gray-400`}>{i + 1}</td>
                <td className={tdClass}>
                  <p className="font-bold">{u.title}</p>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {u.kelasName} · {u.durationMinutes} menit
                  </p>
                </td>
                <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>
                  {formatDate(u.startTime)}
                  <br />
                  <span className="text-[10px] text-gray-400">s/d {formatDate(u.endTime)}</span>
                </td>
                <td className={`${tdClass} hidden md:table-cell`}>
                  {attempt ? (
                    <Badge tone="green">Selesai{attempt.score != null ? ` · ${attempt.score}` : ""}</Badge>
                  ) : upcoming ? (
                    <Badge tone="gray">Belum dimulai</Badge>
                  ) : closed ? (
                    <Badge tone="red">Ditutup</Badge>
                  ) : (
                    <Badge tone="orange">Berlangsung</Badge>
                  )}
                </td>
                <td className={`${tdClass} text-right`}>
                  <Link
                    href={`/student/ujian/${u.id}`}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                      attempt || upcoming || closed
                        ? "border border-gray-200 hover:border-black"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon name={attempt ? "visibility" : "play_arrow"} size={14} />
                    {attempt ? "Lihat" : "Kerjakan"}
                  </Link>
                </td>
              </tr>
            );
          })}
        </DataTable>
      )}
    </>
  );
}
