import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ActionModal, EmptyState, Icon, PageHeader, StatCard, StatGrid, formatDate, primaryButtonClass } from "@/components/ui";
import { broadcastNotification } from "@/app/actions/notifications";

export const instant = false;

export default async function SuperadminNotificationPage() {
  const allNotifs = await db
    .select({
      id: notifications.id,
      title: notifications.title,
      message: notifications.message,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      userName: users.name,
      userRole: users.role,
    })
    .from(notifications)
    .innerJoin(users, eq(notifications.userId, users.id))
    .orderBy(desc(notifications.createdAt))
    .limit(30);

  return (
    <>
      <PageHeader
        title="Push Notifikasi Sistem"
        description="Kirimkan pengumuman, instruksi penugasan, atau broadcast pemeliharaan ke seluruh pengguna."
        action={
          <ActionModal
            triggerText="Kirim Notifikasi"
            triggerIcon="add_alert"
            title="Kirim Notifikasi Siaran"
            description="Kirimkan pengumuman instan ke akun guru, siswa, atau seluruh pengguna."
          >
            <form action={broadcastNotification} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  Target Penerima
                </label>
                <select
                  name="target"
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-black outline-none focus:border-black"
                >
                  <option value="ALL">Semua Pengguna (All Users)</option>
                  <option value="STUDENT">Semua Siswa (Students)</option>
                  <option value="TEACHER">Semua Guru (Teachers)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  Judul Notifikasi
                </label>
                <input
                  name="title"
                  required
                  placeholder="cth: Pengumuman Jadwal Ujian Tengah Semester"
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-medium text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  Isi Pesan
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tuliskan isi informasi yang ingin disampaikan..."
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium text-black outline-none focus:border-black"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  <Icon name="send" size={16} /> Siarkan Notifikasi Sekarang
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      <StatGrid>
        <StatCard value={allNotifs.length} label="Notifikasi Terkirim" />
        <StatCard value="Semua Role" label="Target Siaran" />
      </StatGrid>

      {/* Log Notifikasi Terakhir */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
          Log Notifikasi Terakhir
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Daftar 30 pesan siaran sistem yang baru saja dikirimkan ke pengguna.
        </p>

        {allNotifs.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon="notifications_off" text="Belum ada notifikasi yang dikirimkan." />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {allNotifs.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-black"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black text-xs">{n.title}</span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 uppercase">
                      Ke: {n.userName} ({n.userRole})
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{formatDate(n.createdAt, false)}</span>
                </div>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
