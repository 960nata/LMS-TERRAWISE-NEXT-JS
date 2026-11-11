import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { materi, kelas } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createMateri, deleteMateri } from "./actions";
import {
  ActionModal,
  DataTable,
  EmptyState,
  Icon,
  Label,
  PageHeader,
  SectionTitle,
  StatCard,
  StatGrid,
  formatDate,
  inputClass,
  primaryButtonClass,
  tdClass,
} from "@/components/ui";

export const instant = false;

export default async function MateriPage() {
  const session = await auth();
  const user = session?.user as { id: string; role: string };
  const teacherId = user.id;
  const classFilter = user.role === "TEACHER" ? eq(kelas.teacherId, teacherId) : undefined;

  const myKelas = await db.select().from(kelas).where(classFilter);
  const myMateri = await db
    .select({
      id: materi.id,
      title: materi.title,
      content: materi.content,
      fileUrl: materi.fileUrl,
      createdAt: materi.createdAt,
      kelasName: kelas.name,
    })
    .from(materi)
    .innerJoin(kelas, eq(materi.kelasId, kelas.id))
    .where(classFilter)
    .orderBy(desc(materi.createdAt));

  return (
    <>
      <PageHeader
        title="Manajemen Materi"
        description="Kelola materi pembelajaran, modul, dan dokumen pendukung"
        action={
          <ActionModal
            triggerText="Tambah Materi"
            triggerIcon="add"
            title="Tambah Materi Pembelajaran"
            description="Publikasikan modul, rangkuman, atau dokumen materi baru untuk siswa di kelas."
          >
            <form action={createMateri} className="space-y-4">
              <div>
                <Label htmlFor="kelasId">Kelas Tujuan</Label>
                <select id="kelasId" name="kelasId" required className={inputClass}>
                  <option value="">Pilih Kelas</option>
                  {myKelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="title">Judul Materi</Label>
                <input id="title" name="title" placeholder="cth: Dasar Sensor NPK Tanah & Pertanian Modern" required className={inputClass} />
              </div>
              <div>
                <Label htmlFor="content">Isi Materi</Label>
                <textarea id="content" name="content" placeholder="Tuliskan isi materi atau ringkasan penjelasan..." required rows={4} className={inputClass} />
              </div>
              <div>
                <Label htmlFor="fileUrl">Tautan Materi / Dokumen / Video (Opsional)</Label>
                <input id="fileUrl" type="url" name="fileUrl" placeholder="https://drive.google.com/... atau https://youtube.com/..." className={inputClass} />
              </div>
              <div className="pt-2">
                <button type="submit" className={`${primaryButtonClass} w-full`}>
                  <Icon name="add" size={18} /> Publikasikan Materi
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      <StatGrid>
        <StatCard value={myMateri.length} label="Total Materi" />
        <StatCard value={myKelas.length} label="Kelas Diajar" />
      </StatGrid>

      <section>
        <SectionTitle icon="list_alt" title="Daftar Materi" />
        {myMateri.length === 0 ? (
          <div className="rounded-xl border border-gray-100 md:rounded-2xl">
            <EmptyState icon="folder_open" text="Belum ada materi." />
          </div>
        ) : (
          <DataTable
            columns={[
              { label: "No" },
              { label: "Judul" },
              { label: "Kelas", className: "hidden md:table-cell" },
              { label: "Dibuat", className: "hidden lg:table-cell" },
              { label: "Aksi", className: "text-right" },
            ]}
          >
            {myMateri.map((m, i) => (
              <tr key={m.id} className="transition-colors hover:bg-gray-50/50">
                <td className={`${tdClass} text-gray-400`}>{i + 1}</td>
                <td className={tdClass}>
                  <p className="font-bold">{m.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{m.content}</p>
                  {m.fileUrl && (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-black underline hover:text-gray-600"
                    >
                      <Icon name="link" size={13} /> {m.fileUrl} ↗
                    </a>
                  )}
                  <p className="mt-1 text-[10px] text-gray-400 md:hidden">{m.kelasName}</p>
                </td>
                <td className={`${tdClass} hidden text-gray-500 md:table-cell`}>{m.kelasName}</td>
                <td className={`${tdClass} hidden text-gray-500 lg:table-cell`}>{formatDate(m.createdAt, false)}</td>
                <td className={`${tdClass} text-right`}>
                  <form action={deleteMateri}>
                    <input type="hidden" name="materiId" value={m.id} />
                    <button
                      type="submit"
                      className="text-xs font-bold text-red-600 hover:text-red-800 underline"
                    >
                      Hapus
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
