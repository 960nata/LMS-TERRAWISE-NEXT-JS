"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function broadcastNotification(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== "SUPERADMIN" && role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const title = (formData.get("title") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  const target = (formData.get("target") as string) || "ALL";

  if (!title || !message) {
    throw new Error("Judul dan pesan tidak boleh kosong");
  }

  let recipients: { id: string }[] = [];
  if (target === "ALL") {
    recipients = await db.select({ id: users.id }).from(users);
  } else if (target === "TEACHER") {
    recipients = await db.select({ id: users.id }).from(users).where(eq(users.role, "TEACHER"));
  } else if (target === "STUDENT") {
    recipients = await db.select({ id: users.id }).from(users).where(eq(users.role, "STUDENT"));
  }

  if (recipients.length > 0) {
    await db.insert(notifications).values(
      recipients.map((u) => ({
        userId: u.id,
        title,
        message,
        isRead: false,
      }))
    );
  }

  revalidatePath("/superadmin/notifikasi");
  revalidatePath("/admin/notifikasi");
  revalidatePath("/teacher/notifikasi");
  revalidatePath("/student/notifikasi");
}

export async function markAsRead(id: string) {
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  revalidatePath("/student/notifikasi");
  revalidatePath("/teacher/notifikasi");
  revalidatePath("/superadmin/notifikasi");
  revalidatePath("/admin/notifikasi");
}
