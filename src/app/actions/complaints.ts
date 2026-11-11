"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { complaints, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createComplaint(formData: FormData) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) throw new Error("Unauthorized");

  const title = (formData.get("title") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "Sistem";
  const priority = (formData.get("priority") as string)?.trim() || "MEDIUM";

  if (!title || !message) {
    throw new Error("Judul dan pesan keluhan harus diisi");
  }

  await db.insert(complaints).values({
    userId,
    title,
    message,
    category,
    priority,
    status: "PENDING",
  });

  revalidatePath("/student/keluhan");
  revalidatePath("/teacher/keluhan");
  revalidatePath("/superadmin/keluhan");
  revalidatePath("/admin/keluhan");
}

export async function replyComplaint(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== "SUPERADMIN" && role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const reply = (formData.get("reply") as string)?.trim();
  const status = (formData.get("status") as string) || "RESOLVED";

  if (!id || !reply) throw new Error("Balasan tidak boleh kosong");

  const [existing] = await db
    .select()
    .from(complaints)
    .where(eq(complaints.id, id))
    .limit(1);

  if (existing) {
    await db
      .update(complaints)
      .set({
        reply,
        status,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id));

    // Kirim notifikasi ke pengirim keluhan
    await db.insert(notifications).values({
      userId: existing.userId,
      title: "Keluhan Anda Telah Dibalas",
      message: `Keluhan "${existing.title}" telah ditanggapi oleh admin dengan status: ${status}.`,
      isRead: false,
    });
  }

  revalidatePath("/student/keluhan");
  revalidatePath("/teacher/keluhan");
  revalidatePath("/superadmin/keluhan");
  revalidatePath("/admin/keluhan");
}
