"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">terrawise.id</span>
        </Link>

        <Link
          href="/"
          className="rounded-lg border border-black bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white"
        >
          Masuk / Dashboard
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:py-24">
        {/* Large 404 Badge */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-black bg-black text-white shadow-xl shadow-black/10 md:h-24 md:w-24">
          <span className="material-symbols-outlined" style={{ fontSize: 44 }}>
            search_off
          </span>
        </div>

        <span className="mb-3 inline-block rounded-full border border-black bg-neutral-100 px-3.5 py-1 text-xs font-black tracking-widest text-black uppercase">
          Error 404 · Halaman Tidak Ditemukan
        </span>

        <h1 className="mb-4 max-w-2xl text-3xl font-black tracking-tight uppercase md:text-5xl lg:text-6xl text-black">
          HALAMAN TIDAK DITEMUKAN
        </h1>

        <p className="mb-8 max-w-lg text-sm leading-relaxed text-gray-600 md:text-base">
          Halaman, tugas, materi, atau kelas yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang Anda tuju salah.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mb-12">
          <Link
            href="/"
            className="flex h-12 w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 text-xs font-black tracking-widest text-white uppercase transition-all hover:bg-neutral-800 hover:scale-[1.02] shadow-lg shadow-black/10"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              dashboard
            </span>
            Kembali ke Beranda
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex h-12 w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 text-xs font-black tracking-widest text-black uppercase transition-all hover:border-black hover:bg-gray-50"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_back
            </span>
            Halaman Sebelumnya
          </button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="w-full max-w-3xl border-t border-gray-200 pt-10">
          <p className="mb-5 text-[11px] font-black tracking-widest text-gray-400 uppercase">
            Akses Cepat Menu Platform Terrawise:
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-left">
            <Link
              href="/teacher"
              className="rounded-xl border border-gray-200 bg-neutral-50/70 p-4 transition-all hover:border-black hover:bg-white hover:shadow-sm"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  school
                </span>
              </div>
              <h3 className="text-xs font-black uppercase text-black">Portal Guru</h3>
              <p className="mt-1 text-[11px] text-gray-500">Kelola kelas, materi &amp; penilaian.</p>
            </Link>

            <Link
              href="/student"
              className="rounded-xl border border-gray-200 bg-neutral-50/70 p-4 transition-all hover:border-black hover:bg-white hover:shadow-sm"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  person
                </span>
              </div>
              <h3 className="text-xs font-black uppercase text-black">Portal Siswa</h3>
              <p className="mt-1 text-[11px] text-gray-500">Akses tugas, ujian &amp; materi Anda.</p>
            </Link>

            <Link
              href="/student/tugas"
              className="rounded-xl border border-gray-200 bg-neutral-50/70 p-4 transition-all hover:border-black hover:bg-white hover:shadow-sm"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  assignment
                </span>
              </div>
              <h3 className="text-xs font-black uppercase text-black">Daftar Tugas</h3>
              <p className="mt-1 text-[11px] text-gray-500">Tugas mandiri, essay, PG &amp; tim.</p>
            </Link>

            <Link
              href="/student/keluhan"
              className="rounded-xl border border-gray-200 bg-neutral-50/70 p-4 transition-all hover:border-black hover:bg-white hover:shadow-sm"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  help_center
                </span>
              </div>
              <h3 className="text-xs font-black uppercase text-black">Pusat Bantuan</h3>
              <p className="mt-1 text-[11px] text-gray-500">Bantuan teknis &amp; konsultasi.</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-6 text-center text-xs text-gray-400">
        &copy; 2026 terrawise.id &middot; Platform Manajemen Pembelajaran &amp; Asesmen Terpadu
      </footer>
    </div>
  );
}
