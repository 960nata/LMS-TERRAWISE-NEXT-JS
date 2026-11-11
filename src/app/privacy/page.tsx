import Link from "next/link";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Kebijakan Privasi</h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Terakhir Diperbarui: 11 November 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-black uppercase">1. Informasi yang Kami Kumpulkan</h2>
            <p className="mt-2">
              Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat membuat akun, termasuk nama, alamat
              email, peran (Super Admin, Admin, Guru, Siswa), dan data telemetri yang dikirimkan oleh node sensor IoT yang
              terhubung ke platform kami.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">2. Penggunaan Data Sensor &amp; Pembelajaran</h2>
            <p className="mt-2">
              Data telemetri (seperti suhu tanah, kelembaban, pH, EC, dan kandungan NPK) digunakan semata-mata untuk tujuan
              analisis diagnostik, penelitian akademik siswa, dan pemantauan kondisi lingkungan secara real-time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black uppercase">3. Keamanan Informasi</h2>
            <p className="mt-2">
              Kami menerapkan standar keamanan enkripsi industri untuk melindungi transmisi data antara node sensor, gateway
              ESP8266/ESP32, dan server cloud kami.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
