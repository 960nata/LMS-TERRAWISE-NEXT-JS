"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { iotDevices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function registerDevice(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== "SUPERADMIN" && role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string)?.trim();
  const deviceCode = (formData.get("deviceCode") as string)?.trim().toUpperCase();
  const location = (formData.get("location") as string)?.trim();
  const kelasId = (formData.get("kelasId") as string) || null;

  if (!name || !deviceCode || !location) {
    throw new Error("Nama perangkat, kode, dan lokasi wajib diisi");
  }

  await db.insert(iotDevices).values({
    name,
    deviceCode,
    location,
    status: "ONLINE",
    kelasId,
  });

  revalidatePath("/superadmin/iot");
  revalidatePath("/admin/iot");
  revalidatePath("/teacher/iot");
  revalidatePath("/student/iot");
}

export async function deleteDevice(formData: FormData) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (role !== "SUPERADMIN" && role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const deviceId = formData.get("deviceId") as string;
  if (deviceId) {
    await db.delete(iotDevices).where(eq(iotDevices.id, deviceId));
  }

  revalidatePath("/superadmin/iot");
  revalidatePath("/admin/iot");
  revalidatePath("/teacher/iot");
  revalidatePath("/student/iot");
}
