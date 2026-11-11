import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ujian, soal, ujianAttempts, enrollments } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitAttempt } from "./actions";
import { Icon, PageHeader, formatDate, primaryButtonClass } from "@/components/ui";

export const instant = false;

export default async function StudentUjianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const studentId = (session?.user as { id: string } | null)?.id as string;

  const [u] = await db.select({ id: ujian.id, title: ujian.title, durationMinutes: ujian.durationMinutes, startTime: ujian.startTime, endTime: ujian.endTime }).from(ujian).innerJoin(enrollments, and(eq(enrollments.kelasId, ujian.kelasId), eq(enrollments.studentId, studentId))).where(eq(ujian.id, id)).limit(1);
  if (!u) notFound();
  const soalList = await db.select().from(soal).where(eq(soal.ujianId, id)).orderBy(asc(soal.order), asc(soal.id));
  const [existing] = await db
    .select()
    .from(ujianAttempts)
    .where(and(eq(ujianAttempts.ujianId, id), eq(ujianAttempts.studentId, studentId)));
  const submitBound = submitAttempt.bind(null, id);
  const totalPoin = soalList.reduce((a, s) => a + s.points, 0);

  const back = (
    <Link href="/student/ujian" className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black">
      <Icon name="arrow_back" size={16} /> Kembali ke Ujian Saya
    </Link>
  );

  if (existing?.submittedAt) {
    return (
      <>
        {back}
        <PageHeader title={u?.title ?? "Ujian"} description="Kamu sudah mengerjakan ujian ini." />
        <div className="max-w-md rounded-2xl border border-black p-6 md:rounded-3xl md:p-10">
          <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Nilai Kamu</p>
          <p className="text-5xl font-extrabold tracking-tight">
            {existing.score ?? "-"}
            <span className="text-xl text-gray-300"> / {totalPoin}</span>
          </p>
          <p className="mt-4 text-xs text-gray-500">Dikumpulkan {formatDate(existing.submittedAt)}</p>
        </div>
      </>
    );
  }

  if (new Date() < u.startTime || new Date() > u.endTime) {
    return <>{back}<PageHeader title={u.title} description="Ujian belum dibuka atau sudah berakhir." /></>;
  }
  return (
    <>
      {back}
      <PageHeader
        title={u?.title ?? "Ujian"}
        description={u ? `${soalList.length} soal · ${u.durationMinutes} menit · berakhir ${formatDate(u.endTime)}` : undefined}
      />
      <form action={submitBound} className="max-w-3xl space-y-4 md:space-y-6">
        {soalList.map((s, idx) => {
          const options = s.options as string[];
          return (
            <div key={s.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:rounded-2xl md:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <p className="text-sm font-bold">
                  <span className="mr-2 text-gray-300">{String(idx + 1).padStart(2, "0")}</span>
                  {s.question}
                </p>
                <span className="rounded bg-gray-50 px-2 py-1 text-[10px] font-bold whitespace-nowrap text-gray-400">
                  {s.points} POIN
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {["A", "B", "C", "D"].map((label, i) => (
                  <label
                    key={label}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-xs transition-colors hover:border-black has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white"
                  >
                    <input type="radio" name={`soal_${s.id}`} value={label} required className="sr-only" />
                    <span className="font-bold">{label}</span>
                    <span>{options?.[i]}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
        {soalList.length > 0 && (
          <button type="submit" className={primaryButtonClass}>
            <Icon name="send" size={16} /> Kumpulkan Ujian
          </button>
        )}
      </form>
    </>
  );
}
