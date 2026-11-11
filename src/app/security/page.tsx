import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-[#e7ebf3] px-6 py-4 md:px-20">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black uppercase tracking-tighter">terrawise.id</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black">
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-6 py-16">
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Keamanan Sistem</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Standar Proteksi Data &amp; Integritas Penilaian
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-black uppercase">1. Enkripsi Transmisi &amp; Kata Sandi</h2>
            <p className="mt-2">
              Seluruh data yang dikirimkan antara browser pengguna dan server kami dienkripsi menggunakan protokol TLS 1.3 / HTTPS.
              Kata sandi pengguna di-hash menggunakan algoritma Bcrypt dengan cost factor terstandar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">2. Role-Based Access Control (RBAC)</h2>
            <p className="mt-2">
              Sistem menerapkan pemisahan hak akses yang ketat antara Super Admin, Administrator, Guru Pengajar, dan Siswa
              pada tingkat middleware dan query database.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">3. Integritas Penilaian Akademik</h2>
            <p className="mt-2">
              Setiap rekaman pengumpulan tugas dan hasil ujian dilengkapi timestamp yang akurat untuk menjamin keaslian pengerjaan dan kejujuran akademik.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
