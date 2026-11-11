import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { createTugas } from "../actions";
import { Icon, Label, PageHeader, inputClass, primaryButtonClass } from "@/components/ui";

export const instant = false;

export default async function CreateTugasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipe?: string }>;
}) {
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
  const resolvedSearchParams = await searchParams;
  const initialTipe = resolvedSearchParams.tipe || "MULTIPLE_CHOICE";

  return (
    <>
      <Link
        href={`${basePath}/tugas`}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
      >
        <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Tugas
      </Link>

      <PageHeader
        title="Buat Tugas Baru"
        description="Pilih salah satu dari 4 tipe tugas pembelajaran: Pilihan Ganda, Soal Essay, Mandiri, atau Proyek Kelompok."
      />

      <div className="max-w-3xl rounded-2xl border border-black bg-white p-6 sm:p-8 shadow-sm">
        <form action={createTugas} className="space-y-6">
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
            <Label htmlFor="tipe">Tipe Tugas (4 Pilihan Model)</Label>
            <select id="tipe" name="tipe" defaultValue={initialTipe} required className={inputClass}>
              <option value="MULTIPLE_CHOICE">1. Pilihan Ganda (Kuis dengan Kunci Jawaban & Auto-Grading)</option>
              <option value="ESSAY">2. Soal Essay (Pertanyaan Uraian & Koreksi Manual Guru)</option>
              <option value="MANDIRI">3. Mandiri (Tugas Uraian Individu / Upload Berkas Dokumen)</option>
              <option value="KELOMPOK">4. Kelompok (Proyek Kolaborasi Kelompok / Nama & Anggota Tim)</option>
            </select>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              * Khusus tipe <strong>Pilihan Ganda</strong> dan <strong>Essay</strong>, Anda akan langsung dialihkan ke halaman Bank Soal setelah menekan tombol simpan di bawah untuk menambahkan butir-butir pertanyaan.
            </p>
          </div>

          <div>
            <Label htmlFor="title">Judul Tugas</Label>
            <input
              id="title"
              name="title"
              placeholder="cth: Kuis Logika Algoritma Dasar atau Proyek Analisis Sains"
              required
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi &amp; Petunjuk Pengerjaan</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Tuliskan petunjuk pengerjaan tugas, kriteria penilaian, atau panduan kelompok..."
              required
              rows={4}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Batas Waktu (Deadline)</Label>
              <input id="dueDate" name="dueDate" type="datetime-local" required className={inputClass} />
            </div>
            <div>
              <Label htmlFor="maxScore">Nilai Maksimal</Label>
              <input id="maxScore" name="maxScore" type="number" defaultValue={100} className={inputClass} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              href={`${basePath}/tugas`}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:border-black hover:text-black uppercase transition-colors"
            >
              Batal
            </Link>
            <button type="submit" className={primaryButtonClass}>
              <Icon name="check" size={18} /> Simpan &amp; Lanjutkan →
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
