import { db } from "../src/lib/db";
import { users, kelas, enrollments } from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const [admin] = await db.insert(users).values({ name: "Super Admin", email: "admin@terrawise.id", password, role: "SUPERADMIN" }).returning();
  const [teacher] = await db.insert(users).values({ name: "Bu Guru", email: "guru@terrawise.id", password, role: "TEACHER" }).returning();
  const [student] = await db.insert(users).values({ name: "Budi Siswa", email: "siswa@terrawise.id", password, role: "STUDENT" }).returning();

  const [kelasX] = await db.insert(kelas).values({ name: "Kelas X - Matematika", description: "Kelas matematika dasar", teacherId: teacher.id }).returning();
  await db.insert(enrollments).values({ studentId: student.id, kelasId: kelasX.id });

  console.log("Seed done. Demo accounts (password: password123):");
  console.log("- admin@terrawise.id (SUPERADMIN)");
  console.log("- guru@terrawise.id (TEACHER)");
  console.log("- siswa@terrawise.id (STUDENT)");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
