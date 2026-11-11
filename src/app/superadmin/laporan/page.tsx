import { db } from "@/lib/db";
import { enrollments, kelas, materi, tugas, tugasSubmissions, ujian, ujianAttempts, users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { DataTable, PageHeader, StatCard, StatGrid, primaryButtonClass, tdClass } from "@/components/ui";

export const instant = false;
export default async function ReportsPage() {
  const [[people], [classCount], [materials], [assignments], [exams], [submissions], [attempts], classes] = await Promise.all([
    db.select({ n: count() }).from(users), db.select({ n: count() }).from(kelas), db.select({ n: count() }).from(materi),
    db.select({ n: count() }).from(tugas), db.select({ n: count() }).from(ujian), db.select({ n: count() }).from(tugasSubmissions),
    db.select({ n: count() }).from(ujianAttempts),
    db.select({ id: kelas.id, name: kelas.name, teacher: users.name, students: count(enrollments.id) }).from(kelas).innerJoin(users, eq(kelas.teacherId, users.id)).leftJoin(enrollments, eq(enrollments.kelasId, kelas.id)).groupBy(kelas.id, users.name),
  ]);
  return <>
    <PageHeader title="Laporan" description="Ringkasan data pengguna dan pembelajaran." action={<a className={primaryButtonClass} href="/api/export/nilai">Unduh nilai tugas</a>} />
    <StatGrid><StatCard label="Pengguna" value={people.n}/><StatCard label="Kelas" value={classCount.n}/><StatCard label="Materi" value={materials.n}/><StatCard label="Tugas" value={assignments.n}/><StatCard label="Ujian" value={exams.n}/><StatCard label="Tugas terkumpul" value={submissions.n}/><StatCard label="Ujian dikerjakan" value={attempts.n}/></StatGrid>
    <DataTable columns={[{label:"Kelas"},{label:"Guru"},{label:"Jumlah siswa"}]}>{classes.map(c => <tr key={c.id}><td className={tdClass}>{c.name}</td><td className={tdClass}>{c.teacher}</td><td className={tdClass}>{c.students}</td></tr>)}</DataTable>
  </>;
}
