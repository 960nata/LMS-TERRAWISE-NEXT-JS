import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { createMateri } from "../actions";
import { Icon, Label, PageHeader, RichTextEditor, inputClass, primaryButtonClass } from "@/components/ui";

export const instant = false;

export default async function CreateMateriPage() {
  const session = await auth();
  const user = session?.user as { id: string; role: string };
  const teacherId = user.id;
  const classFilter = user.role === "TEACHER" ? eq(kelas.teacherId, teacherId) : undefined;
  const basePath =
    user.role === "SUPERADMIN"
      ? "/superadmin"
      : user.role === "ADMIN"
      ? "/admin"
      : "/teacher";

  const myKelas = await db.select().from(kelas).where(classFilter);

  return (
    <>
      <Link
        href={`${basePath}/materi`}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
      >
        <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Materi
      </Link>

      <PageHeader
        title="Tambah Materi Pembelajaran"
        description="Publikasikan modul ajar, ringkasan teori, atau dokumen pembelajaran baru untuk siswa di kelas Anda."
      />

      <div className="max-w-3xl rounded-2xl border border-black bg-white p-6 sm:p-8 shadow-sm">
        <form action={createMateri} className="space-y-6">
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
            <Label htmlFor="title">Judul Materi Pembelajaran</Label>
            <input
              id="title"
              name="title"
              placeholder="cth: Pengantar Algoritma dan Struktur Data Dasar"
              required
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="content">Isi Materi / Ringkasan Modul Ajar (Mendukung Rich Text &amp; Gambar)</Label>
            <RichTextEditor
              name="content"
              id="content"
              placeholder="Tuliskan modul pelajaran, konsep penting, atau sematkan gambar ilustrasi / bagan..."
              minHeight="220px"
              required
            />
          </div>

          <div>
            <Label htmlFor="fileUrl">Tautan Berkas Dokumen / Modul PDF / Video (Opsional)</Label>
            <input
              id="fileUrl"
              type="url"
              name="fileUrl"
              placeholder="https://drive.google.com/... atau https://youtube.com/..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">
              Cantumkan link Google Drive, repository GitHub, atau file cloud untuk diakses siswa.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              href={`${basePath}/materi`}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:border-black hover:text-black uppercase transition-colors"
            >
              Batal
            </Link>
            <button type="submit" className={primaryButtonClass}>
              <Icon name="check" size={18} /> Simpan &amp; Publikasikan Materi
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
