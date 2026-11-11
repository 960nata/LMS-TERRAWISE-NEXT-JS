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
          Terakhir Diperbarui: 11 November 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-black uppercase">1. Ketentuan Penggunaan</h2>
            <p className="mt-2">
              Dengan mengakses dan menggunakan platform Terrawise.id, Anda menyetujui untuk terikat oleh syarat dan ketentuan
              ini serta mematuhi seluruh peraturan yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">2. Hak Akses Akun</h2>
            <p className="mt-2">
              Setiap pengguna bertanggung jawab untuk menjaga kerahasiaan kredensial login akun mereka. Tindakan tidak sah atau
              akses tanpa izin ke node sensor pihak lain sangat dilarang.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">3. Integritas Riset &amp; Penilaian</h2>
            <p className="mt-2">
              Jawaban tugas, ujian, dan pengumpulan data sensor wajib dilakukan secara jujur dan transparan sesuai dengan
              kode etik akademik dan protokol penelitian.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
