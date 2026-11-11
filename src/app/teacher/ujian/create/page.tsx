import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { createUjian } from "../actions";
import { Icon, Label, PageHeader, inputClass, primaryButtonClass } from "@/components/ui";

export const instant = false;

export default async function CreateUjianPage({
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
        href={`${basePath}/ujian`}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-black"
      >
        <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Ujian
      </Link>

      <PageHeader
        title="Jadwalkan Ujian Baru"
        description="Pilih salah satu dari 3 tipe ujian: Pilihan Ganda (Auto-Grading), Soal Essay (Koreksi Manual), atau Campuran (PG & Essay)."
      />

      <div className="max-w-3xl rounded-2xl border border-black bg-white p-6 sm:p-8 shadow-sm">
        <form action={createUjian} className="space-y-6">
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
            <Label htmlFor="tipe">Tipe Ujian (3 Model Asesmen)</Label>
            <select id="tipe" name="tipe" defaultValue={initialTipe} required className={inputClass}>
              <option value="MULTIPLE_CHOICE">1. Pilihan Ganda (Kunci Jawaban A–D &amp; Penilaian Otomatis)</option>
              <option value="ESSAY">2. Soal Essay (Pertanyaan Uraian &amp; Rubrik Penilaian Guru)</option>
              <option value="MIXED">3. Campuran (Kombinasi Butir Pilihan Ganda &amp; Soal Essay)</option>
            </select>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              * Setelah menekan tombol simpan di bawah, Anda akan langsung dialihkan ke halaman Bank Soal Ujian untuk menambahkan butir-butir pertanyaan.
            </p>
          </div>

          <div>
            <Label htmlFor="title">Judul Ujian</Label>
            <input
              id="title"
              name="title"
              placeholder="cth: Evaluasi Tengah Semester - Sains Terapan & Logika"
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Waktu Mulai</Label>
              <input id="startTime" name="startTime" type="datetime-local" required className={inputClass} />
            </div>
            <div>
              <Label htmlFor="endTime">Waktu Selesai</Label>
              <input id="endTime" name="endTime" type="datetime-local" required className={inputClass} />
            </div>
          </div>

          <div>
            <Label htmlFor="durationMinutes">Durasi Pengerjaan (Menit)</Label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              placeholder="60"
              defaultValue={60}
              required
              className={inputClass}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              href={`${basePath}/ujian`}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:border-black hover:text-black uppercase transition-colors"
            >
              Batal
            </Link>
            <button type="submit" className={primaryButtonClass}>
              <Icon name="check" size={18} /> Simpan &amp; Lanjutkan ke Bank Soal →
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
