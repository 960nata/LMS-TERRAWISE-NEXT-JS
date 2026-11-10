"use server";
import { db } from "@/lib/db";
import { materi } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createMateri(formData: FormData) {
  const session = await auth();
  const authorId = (session?.user as any)?.id as string;
  await db.insert(materi).values({
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    kelasId: formData.get("kelasId") as string,
    authorId,
  });
  revalidatePath("/teacher/materi");
}
