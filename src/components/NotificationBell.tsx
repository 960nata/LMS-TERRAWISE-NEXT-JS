import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function NotificationBell() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string;
  if (!userId) return null;

  const items = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(5);
  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <div className="flex items-center gap-1 text-sm">
        🔔 {unreadCount > 0 && <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">{unreadCount}</span>}
      </div>
      <div className="absolute right-0 mt-2 hidden w-64 rounded-lg border bg-white p-2 shadow-lg group-hover:block">
        {items.length === 0 && <p className="p-2 text-xs text-gray-400">Tidak ada notifikasi</p>}
        {items.map((n) => (
          <div key={n.id} className="border-b p-2 text-xs last:border-0">
            <p className="font-medium">{n.title}</p>
            <p className="text-gray-500">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
