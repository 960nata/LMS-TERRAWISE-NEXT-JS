import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tugasSubmissions, tugas, users, kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  const teacherId = user?.id;
  const role = user?.role;

  if (!teacherId || !role || !["TEACHER", "ADMIN", "SUPERADMIN"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const kelasId = searchParams.get("kelasId");

  const rows = await db
    .select({
      studentName: users.name,
      tugasTitle: tugas.title,
      score: tugasSubmissions.score,
      submittedAt: tugasSubmissions.submittedAt,
      kelasName: kelas.name,
      kelasId: kelas.id,
      classTeacherId: kelas.teacherId,
    })
    .from(tugasSubmissions)
    .innerJoin(tugas, eq(tugasSubmissions.tugasId, tugas.id))
    .innerJoin(users, eq(tugasSubmissions.studentId, users.id))
    .innerJoin(kelas, eq(tugas.kelasId, kelas.id));

  const filtered = rows.filter((r) => (role !== "TEACHER" || r.classTeacherId === teacherId) && (!kelasId || r.kelasId === kelasId));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Nilai Tugas");
  sheet.columns = [
    { header: "Kelas", key: "kelasName", width: 20 },
    { header: "Nama Siswa", key: "studentName", width: 25 },
    { header: "Tugas", key: "tugasTitle", width: 30 },
    { header: "Nilai", key: "score", width: 10 },
    { header: "Waktu Submit", key: "submittedAt", width: 20 },
  ];
  filtered.forEach((r) => {
    sheet.addRow({
      kelasName: r.kelasName,
      studentName: r.studentName,
      tugasTitle: r.tugasTitle,
      score: r.score ?? "-",
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toLocaleString("id-ID") : "-",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=nilai-tugas.xlsx",
    },
  });
}
