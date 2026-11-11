"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FEATURES = [
  {
    icon: "assignment",
    title: "Manajemen Tugas Terpadu",
    text: "Pembuatan tugas mandiri dan kelompok dengan pengaturan batas waktu, lampiran materi, dan rubrik penilaian terstandar.",
  },
  {
    icon: "quiz",
    title: "Ujian Online & Kuis Berwaktu",
    text: "Sistem ujian online terintegrasi dengan timer otomatis, pengacakan soal, dan penghitungan skor instan.",
  },
  {
    icon: "menu_book",
    title: "Modul & Materi Pembelajaran",
    text: "Distribusi bahan ajar digital, rangkuman materi, dan dokumen pendukung terstruktur per mata pelajaran dan kelas.",
  },
  {
    icon: "analytics",
    title: "Laporan & Evaluasi Nilai",
    text: "Rekapitulasi otomatis nilai tugas dan ujian siswa yang dapat diekspor langsung ke format lembar kerja Excel.",
  },
];

const PILLARS = [
  {
    tag: "Pilar 01",
    title: "Pembelajaran Terstruktur",
    desc: "Materi dan tugas terorganisir per kelas secara rapi untuk memudahkan proses belajar mengajar harian guru dan siswa.",
    metric: "100%",
    metricLabel: "Digitalisasi Pembelajaran",
  },
  {
    tag: "Pilar 02",
    title: "Evaluasi Objektif & Cepat",
    desc: "Pemeriksaan otomatis untuk ujian pilihan ganda serta form umpan balik deskriptif personal dari guru untuk setiap siswa.",
    metric: "< 1s",
    metricLabel: "Kalkulasi Skor Otomatis",
  },
  {
    tag: "Pilar 03",
    title: "Manajemen Terpadu 4 Role",
    desc: "Akses tersentralisasi untuk Superadmin, Admin, Guru, dan Siswa sesuai wewenang dan tanggung jawab masing-masing.",
    metric: "4 Role",
    metricLabel: "Superadmin, Admin, Guru, Siswa",
  },
  {
    tag: "Pilar 04",
    title: "Keamanan & Integritas",
    desc: "Otentikasi aman, proteksi sesi, dan rekam jejak pengerjaan tugas & ujian yang transparan dan akuntabel.",
    metric: "TLS/AES",
    metricLabel: "Keamanan Data Siswa",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => emailRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openLogin = () => {
    setIsRegister(false);
    setError("");
    setOpen(true);
  };

  const openRegister = () => {
    setIsRegister(true);
    setError("");
    setOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Gagal mendaftar");
          setLoading(false);
          return;
        }
      }

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email atau kata sandi tidak cocok.");
        setLoading(false);
      } else {
        router.refresh();
        const roleRedirects: Record<string, string> = {
          SUPERADMIN: "/superadmin",
          ADMIN: "/admin",
          TEACHER: "/teacher",
          STUDENT: "/student",
        };
        router.push(roleRedirects[role] || "/student");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0e121b]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e7ebf3] bg-white px-6 py-4 whitespace-nowrap md:px-20">
        <div className="flex items-center gap-3">
          <Logo />
          <h2 className="text-xl leading-tight font-black tracking-tighter uppercase">terrawise.id</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={openLogin}
            className="hover:text-primary hidden px-4 py-2 text-sm font-bold transition-colors sm:flex"
          >
            Masuk
          </button>
          <button
            onClick={openLogin}
            className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-black px-5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Portal LMS
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-20 text-center md:py-32">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-bold tracking-widest text-gray-600 uppercase">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Learning Management &amp; Assessment Platform
              </span>
              <h1 className="text-5xl leading-none font-black tracking-[-0.05em] uppercase md:text-8xl">
                terrawise.id
              </h1>
              <p className="max-w-[680px] text-lg leading-relaxed font-normal text-[#4e6797] md:text-2xl">
                Platform pembelajaran online dan evaluasi terpadu modern untuk sekolah dan institusi pendidikan.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={openLogin}
                className="flex h-14 min-w-[190px] cursor-pointer items-center justify-center rounded-lg bg-black px-8 text-base font-bold text-white transition-transform hover:scale-105 active:scale-95"
              >
                Mulai Pembelajaran
              </button>
              <a
                href="#features"
                className="flex h-14 min-w-[190px] cursor-pointer items-center justify-center rounded-lg border-2 border-black px-8 text-base font-bold text-black transition-all hover:scale-105 hover:bg-black hover:text-white"
              >
                Lihat Fitur LMS
              </a>
            </div>
          </div>
        </div>

        {/* Fitur LMS Unggulan */}
        <div id="features" className="mx-auto max-w-[1200px] border-t border-[#e7ebf3] px-6 py-20 md:py-24">
          <div className="flex flex-col gap-14">
            <div className="flex max-w-[720px] flex-col gap-3">
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">Kemampuan Inti LMS</h2>
              <p className="text-base text-[#4e6797] md:text-lg">
                Sederhanakan administrasi kelas, penyampaian materi, dan evaluasi hasil belajar siswa dengan fitur yang terstruktur.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col gap-6 rounded-2xl border border-[#d0d7e7] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-primary bg-primary/10 flex size-12 items-center justify-center rounded-xl bg-gray-100">
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                      {f.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-black">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-[#4e6797]">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Pilar Arsitektur */}
        <div className="border-t border-[#e7ebf3] bg-[#f8f9fc] px-6 py-20 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-14 flex max-w-[720px] flex-col gap-3">
              <span className="text-xs font-extrabold tracking-widest text-[#4e6797] uppercase">
                Standar Pembelajaran Digital
              </span>
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
                Fondasi Sistem Terpadu
              </h2>
              <p className="text-base text-[#4e6797] md:text-lg">
                Dibangun untuk keandalan akademik, kecepatan asesmen, dan kenyamanan belajar mengajar.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((p) => (
                <div
                  key={p.tag}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:border-black"
                >
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                      {p.tag}
                    </span>
                    <h3 className="mt-2 text-xl font-extrabold text-black md:text-2xl">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#4e6797]">{p.desc}</p>
                  </div>
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <div className="text-2xl font-black tracking-tight text-black md:text-3xl">{p.metric}</div>
                    <div className="text-xs font-semibold text-gray-400">{p.metricLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-black px-6 py-20 text-white md:py-24">
          <div className="mx-auto flex max-w-[800px] flex-col gap-6 text-center">
            <h2 className="text-4xl font-black tracking-tighter uppercase md:text-5xl">
              Siap Mengoptimalkan Pembelajaran &amp; Penilaian?
            </h2>
            <p className="text-base text-gray-300 md:text-xl">
              Platform lengkap untuk mengelola tugas, ujian online, dan materi dalam satu ekosistem terpadu.
            </p>
            <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={openLogin}
                className="flex h-14 min-w-[200px] cursor-pointer items-center justify-center rounded-lg bg-white px-8 text-base font-bold text-black transition-all hover:scale-105 hover:bg-neutral-100"
              >
                Masuk ke Platform
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e7ebf3] bg-white px-6 py-12 md:px-20">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Logo className="size-6" />
              <h2 className="text-xl leading-tight font-black tracking-tighter uppercase">terrawise.id</h2>
            </div>
            <p className="max-w-xs text-xs text-[#4e6797]">
              Platform pembelajaran terpadu, asesmen ujian online, dan manajemen kelas modern.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-[#4e6797]">
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="hover:text-black transition-colors">
              Security
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-[1200px] items-center justify-between border-t border-[#e7ebf3] pt-6">
          <p className="text-xs text-[#4e6797]">© 2026 terrawise.id. All rights reserved.</p>
          <div className="flex gap-4 text-gray-400">
            <span className="material-symbols-outlined text-sm">school</span>
            <span className="material-symbols-outlined text-sm">menu_book</span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo className="size-6" />
                <h3 className="text-xl font-bold tracking-tight text-black">
                  {isRegister ? "Daftar Akun Baru" : "Masuk ke Terrawise"}
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
                aria-label="Tutup"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Quick Demo Fill Buttons */}
            {!isRegister && (
              <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="mb-2 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  Pilih Akun Demo (1-Klik Masuk):
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("superadmin@terrawise.id");
                      setPassword("superadmin123");
                      setRole("SUPERADMIN");
                      setError("");
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left font-semibold text-gray-800 transition-all hover:border-black hover:bg-black hover:text-white"
                  >
                    👑 Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@terrawise.id");
                      setPassword("admin123");
                      setRole("ADMIN");
                      setError("");
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left font-semibold text-gray-800 transition-all hover:border-black hover:bg-black hover:text-white"
                  >
                    ⚙️ Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("guru@terrawise.id");
                      setPassword("guru123");
                      setRole("TEACHER");
                      setError("");
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left font-semibold text-gray-800 transition-all hover:border-black hover:bg-black hover:text-white"
                  >
                    👨‍🏫 Guru
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("siswa@terrawise.id");
                      setPassword("siswa123");
                      setRole("STUDENT");
                      setError("");
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left font-semibold text-gray-800 transition-all hover:border-black hover:bg-black hover:text-white"
                  >
                    🎓 Siswa
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isRegister && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-black uppercase">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="h-11 w-full rounded-lg border border-[#e7ebf3] bg-white px-3.5 text-sm text-black outline-none transition-all placeholder:text-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-bold text-black uppercase">
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@terrawise.id"
                  className="h-11 w-full rounded-lg border border-[#e7ebf3] bg-white px-3.5 text-sm text-black outline-none transition-all placeholder:text-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pass" className="text-xs font-bold text-black uppercase">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-lg border border-[#e7ebf3] bg-white px-3.5 pr-10 text-sm text-black outline-none transition-all placeholder:text-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {isRegister && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="role" className="text-xs font-bold text-black uppercase">
                    Daftar Sebagai Peran
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[#e7ebf3] bg-white px-3 text-sm font-medium text-black outline-none focus:border-black"
                  >
                    <option value="STUDENT">Siswa</option>
                    <option value="TEACHER">Guru</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-black text-sm font-bold text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
              >
                {loading ? "Memproses..." : isRegister ? "Daftar Akun" : "Masuk Sekarang"}
              </button>
            </form>

            <div className="mt-5 border-t border-gray-100 pt-4 text-center text-xs text-[#4e6797]">
              {isRegister ? (
                <>
                  Sudah memiliki akun?{" "}
                  <button
                    onClick={openLogin}
                    className="font-bold text-black underline underline-offset-2 hover:text-neutral-700"
                  >
                    Masuk di sini
                  </button>
                </>
              ) : (
                <>
                  Belum memiliki akun?{" "}
                  <button
                    onClick={openRegister}
                    className="font-bold text-black underline underline-offset-2 hover:text-neutral-700"
                  >
                    Daftar sekarang
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Logo({ className = "size-7" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-black text-white ${className}`}
    >
      <span className="text-xs font-black tracking-tighter">TW</span>
    </div>
  );
}
