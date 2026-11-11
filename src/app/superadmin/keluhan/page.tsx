import { db } from "@/lib/db";
import { complaints, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { EmptyState, Icon, PageHeader, StatCard, StatGrid, formatDate } from "@/components/ui";
import { replyComplaint } from "@/app/actions/complaints";

export const instant = false;

export default async function SuperadminComplaintsPage() {
  const allComplaints = await db
    .select({
      id: complaints.id,
      title: complaints.title,
      message: complaints.message,
      category: complaints.category,
      priority: complaints.priority,
      status: complaints.status,
      reply: complaints.reply,
      createdAt: complaints.createdAt,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.userId, users.id))
    .orderBy(desc(complaints.createdAt));

  const pending = allComplaints.filter((c) => c.status === "PENDING").length;
  const inProgress = allComplaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = allComplaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <>
      <PageHeader
        title="Manajemen Keluhan & Tiket"
        description="Pusat respons keluhan pengguna, kendala teknis node sensor IoT, dan administrasi sistem."
      />

      <StatGrid>
        <StatCard value={allComplaints.length} label="Total Tiket" />
        <StatCard value={pending} label="Menunggu Respon" />
        <StatCard value={inProgress} label="Sedang Ditangani" />
        <StatCard value={resolved} label="Selesai" />
      </StatGrid>

      {allComplaints.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-8">
          <EmptyState icon="mark_chat_read" text="Belum ada keluhan masuk dari pengguna." />
        </div>
      ) : (
        <div className="space-y-6">
          {allComplaints.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black md:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
                    {c.userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-black">{c.userName}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 uppercase">
                        {c.userRole}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">{c.userEmail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${
                      c.priority === "HIGH"
                        ? "bg-red-100 text-red-800"
                        : c.priority === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    Prioritas {c.priority}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                      c.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : c.status === "IN_PROGRESS"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status === "RESOLVED"
                      ? "Selesai"
                      : c.status === "IN_PROGRESS"
                      ? "Diproses"
                      : "Menunggu"}
                  </span>
                  <span className="text-[11px] text-gray-400">{formatDate(c.createdAt, false)}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 uppercase">
                    {c.category}
                  </span>
                  <h3 className="text-base font-extrabold text-black md:text-lg">{c.title}</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-700">{c.message}</p>
              </div>

              {/* Tanggapan Sekarang / Form Balas */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                {c.reply ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <Icon name="check_circle" size={16} />
                      <span>Balasan Admin Terkirim:</span>
                    </div>
                    <p className="mt-1 text-xs text-emerald-800">{c.reply}</p>
                  </div>
                ) : (
                  <form action={replyComplaint} className="flex flex-col gap-3">
                    <input type="hidden" name="id" value={c.id} />
                    <label className="text-xs font-bold uppercase tracking-wider text-black">
                      Tanggapi Keluhan Ini
                    </label>
                    <textarea
                      name="reply"
                      required
                      rows={2}
                      placeholder="Tuliskan respon atau solusi penanganan..."
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium text-black outline-none focus:border-black"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        name="status"
                        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-black outline-none focus:border-black"
                      >
                        <option value="RESOLVED">Tandai Selesai (RESOLVED)</option>
                        <option value="IN_PROGRESS">Tandai Sedang Diproses (IN_PROGRESS)</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition-all hover:bg-black/80 active:scale-95"
                      >
                        Kirim Tanggapan
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
