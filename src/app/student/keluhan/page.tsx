import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { complaints } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ActionModal, EmptyState, Icon, PageHeader, StatCard, StatGrid, formatDate, primaryButtonClass } from "@/components/ui";
import { createComplaint } from "@/app/actions/complaints";

export const instant = false;

export default async function StudentComplaintsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) return null;

  const userComplaints = await db
    .select()
    .from(complaints)
    .where(eq(complaints.userId, userId))
    .orderBy(desc(complaints.createdAt));

  const resolved = userComplaints.filter((c) => c.status === "RESOLVED").length;
  const pending = userComplaints.filter((c) => c.status === "PENDING" || c.status === "IN_PROGRESS").length;

  return (
    <>
      <PageHeader
        title="Keluhan & Bantuan"
        description="Sampaikan kendala teknis sistem, materi, atau perangkat sensor IoT ke administrator."
        action={
          <ActionModal
            triggerText="Buat Tiket Bantuan"
            triggerIcon="support_agent"
            title="Ajukan Tiket Bantuan & Keluhan"
            description="Jelaskan kendala teknis, sensor, atau pembelajaran yang Anda hadapi secara spesifik."
          >
            <form action={createComplaint} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  Judul Keluhan
                </label>
                <input
                  name="title"
                  required
                  placeholder="cth: Nilai Sensor pH Tidak Terbaca"
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-medium text-black outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-black">
                    Kategori
                  </label>
                  <select
                    name="category"
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-black outline-none focus:border-black"
                  >
                    <option value="Sistem & Akun">Sistem &amp; Akun</option>
                    <option value="IoT Hardware">Sensor &amp; Hardware IoT</option>
                    <option value="Tugas & Ujian">Tugas &amp; Ujian</option>
                    <option value="Materi Pembelajaran">Materi Pembelajaran</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-black">
                    Prioritas
                  </label>
                  <select
                    name="priority"
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-black outline-none focus:border-black"
                  >
                    <option value="LOW">Rendah (Low)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                    <option value="HIGH">Tinggi (High)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-black">
                  Detail Pesan Kendala
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Jelaskan detail kendala, lokasi sensor, atau halaman error..."
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium text-black outline-none focus:border-black"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`${primaryButtonClass} w-full`}
                >
                  <Icon name="send" size={16} /> Kirim Tiket Sekarang
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      <StatGrid>
        <StatCard value={userComplaints.length} label="Total Tiket" />
        <StatCard value={pending} label="Dalam Proses" />
        <StatCard value={resolved} label="Terselesaikan" />
      </StatGrid>

      {/* Daftar Keluhan Saya */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-black">
              Riwayat Tiket Saya
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Pantau status penanganan dan tanggapan dari administrator.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-black">
            {userComplaints.length} Tiket
          </span>
        </div>

        {userComplaints.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon="mark_chat_read" text="Belum ada keluhan yang dikirimkan." />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {userComplaints.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition-all hover:border-black md:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700 uppercase">
                      {c.category}
                    </span>
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
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                        c.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          c.status === "RESOLVED" ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {c.status === "RESOLVED"
                        ? "Selesai"
                        : c.status === "IN_PROGRESS"
                        ? "Diproses"
                        : "Menunggu"}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(c.createdAt, false)}</span>
                  </div>
                </div>

                <h3 className="mt-4 text-base font-bold text-black md:text-lg">{c.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">{c.message}</p>

                {c.reply && (
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <Icon name="support_agent" size={16} />
                      <span>Tanggapan Administrator:</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-800 whitespace-pre-wrap">
                      {c.reply}
                    </p>
                  </div>
                )}

                <div className="mt-3 text-right text-[10px] text-gray-400">
                  Dibuat pada {formatDate(c.createdAt, true)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
