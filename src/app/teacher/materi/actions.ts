"use server";
import { db } from "@/lib/db";
import { materi } from "@/lib/db/schema";
import { requireClassManager } from "@/lib/access";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function createMateri(formData: FormData) {
  const kelasId = String(formData.get("kelasId") ?? "");
  const { id: authorId, role } = await requireClassManager(kelasId);
  const fileUrl = (formData.get("fileUrl") as string)?.trim() || null;
  await db.insert(materi).values({
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    fileUrl,
    kelasId,
    authorId,
  });
  revalidatePath("/teacher/materi");
  revalidatePath("/admin/materi");
  revalidatePath("/superadmin/materi");
  revalidatePath("/student/materi");

  const basePath = role === "SUPERADMIN" ? "/superadmin" : role === "ADMIN" ? "/admin" : "/teacher";
  redirect(`${basePath}/materi`);
}

export async function deleteMateri(formData: FormData) {
  const materiId = formData.get("materiId") as string;
  const [entry] = await db
    .select({ kelasId: materi.kelasId })
    .from(materi)
    .where(eq(materi.id, materiId))
    .limit(1);
  if (!entry) throw new Error("Materi tidak ditemukan");
  await requireClassManager(entry.kelasId);
  await db.delete(materi).where(eq(materi.id, materiId));
  revalidatePath("/teacher/materi");
  revalidatePath("/admin/materi");
  revalidatePath("/superadmin/materi");
  revalidatePath("/student/materi");
}
