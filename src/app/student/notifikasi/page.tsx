import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { EmptyState, PageHeader, StatCard, StatGrid, formatDate } from "@/components/ui";
import { markAsRead } from "@/app/actions/notifications";

export const instant = false;

export default async function StudentNotificationPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) return null;

  const notifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <>
      <PageHeader
        title="Notifikasi Saya"
        description="Pemberitahuan nilai, penugasan baru, dan informasi penting dari pengajar dan admin."
      />

      <StatGrid>
        <StatCard value={notifs.length} label="Total Notifikasi" />
        <StatCard value={unread} label="Belum Dibaca" />
      </StatGrid>

      {notifs.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-8">
          <EmptyState icon="notifications_none" text="Belum ada notifikasi untuk Anda." />
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all md:p-6 ${
                n.isRead ? "border-gray-100 bg-white text-gray-700" : "border-black bg-gray-50/50 text-black"
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="size-2 rounded-full bg-blue-600" />}
                  <h3 className="text-sm font-bold">{n.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">{formatDate(n.createdAt, false)}</span>
                  {!n.isRead && (
                    <form action={markAsRead.bind(null, n.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600 hover:border-black hover:text-black uppercase"
                      >
                        Tandai Dibaca
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-600">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
