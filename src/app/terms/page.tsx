import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Syarat &amp; Ketentuan</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Aturan Penggunaan Platform LMS Terrawise
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-black uppercase">1. Penggunaan Akun</h2>
            <p className="mt-2">
              Akun pengguna bersifat personal dan tidak boleh dialihkan kepada pihak lain. Setiap pengguna bertanggung jawab
              penuh atas kerahasiaan kredensial akun masing-masing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">2. Integritas Pengerjaan Tugas &amp; Ujian</h2>
            <p className="mt-2">
              Jawaban tugas dan ujian wajib dikerjakan secara jujur dan mandiri. Segala bentuk kecurangan atau plagiarisme
              merupakan pelanggaran terhadap tata tertib akademik.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">3. Hak Cipta Materi</h2>
            <p className="mt-2">
              Seluruh modul pembelajaran, bank soal, dan materi yang diunggah oleh guru dilindungi oleh hak cipta dan hanya boleh
              digunakan untuk keperluan pembelajaran di lingkungan sekolah.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
