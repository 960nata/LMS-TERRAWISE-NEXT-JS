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
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Arsitektur Keamanan</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Standar Enterprise &amp; Edge Protection
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-black uppercase">1. Enkripsi End-to-End</h2>
            <p className="mt-2">
              Semua telemetri dari node ESP8266/ESP32 dikirimkan menggunakan kanal aman TLS/SSL terenkripsi AES-256 untuk
              mencegah serangan man-in-the-middle dan pemalsuan data lingkungan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">2. Role-Based Access Control (RBAC)</h2>
            <p className="mt-2">
              Sistem membatasi otorisasi secara ketat berdasarkan hierarki 4 peran: Super Admin, Admin, Guru, dan Siswa.
              Semua mutasi data divalidasi di level server actions dan middleware proxy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">3. Integritas Data &amp; Audit Log</h2>
            <p className="mt-2">
              Setiap catatan telemetri sensor, pengumpulan tugas, dan hasil ujian dilengkapi timestamp yang tidak dapat diubah
              untuk menjamin keaslian data penelitian.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
