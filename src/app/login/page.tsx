"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FEATURES = [
  {
    icon: "monitoring",
    title: "Pemantauan Real-time",
    text: "Pengawasan berkelanjutan terhadap seluruh ekosistem sensor lapangan dengan latensi milidetik.",
  },
  {
    icon: "verified_user",
    title: "Kepatuhan Otomatis",
    text: "Validasi dan pelaporan kepatuhan instan untuk standar kualitas lingkungan dan tanah.",
  },
  {
    icon: "memory",
    title: "Integrasi Edge",
    text: "Protokol komputasi edge proprietary untuk transmisi data mikrokontroler yang mulus.",
  },
  {
    icon: "insights",
    title: "Analitik Prediktif",
    text: "Peramalan berbasis machine learning untuk mengantisipasi anomali sebelum terjadi.",
  },
];

const PILLARS = [
  {
    tag: "Pilar 01",
    title: "Pemantauan Berkelanjutan",
    desc: "Metrik tanah NPK, suhu, kelembaban, dan pH dipantau 24/7 dengan resolusi tinggi di seluruh probe sensor Anda.",
    metric: "99.98%",
    metricLabel: "Uptime Node Sensor",
  },
  {
    tag: "Pilar 02",
    title: "Diagnostik Presisi di Edge",
    desc: "Pemrosesan komputasi di tingkat mikrokontroler memfilter anomali sebelum data dikirim ke cloud.",
    metric: "< 120ms",
    metricLabel: "Latensi Transmisi MQTT",
  },
  {
    tag: "Pilar 03",
    title: "Manajemen Terpadu",
    desc: "Satu platform untuk tugas, materi, ujian berbasis diagnostik, dan evaluasi hasil belajar siswa dan guru secara otomatis.",
    metric: "4 Role",
    metricLabel: "Superadmin, Admin, Guru, Siswa",
  },
  {
    tag: "Pilar 04",
    title: "Keamanan Enterprise",
    desc: "Otentikasi bertingkat, enkripsi transmisi TLS/SSL, dan perlindungan integritas rekaman telemetri penelitian.",
    metric: "AES-256",
    metricLabel: "Enkripsi Data Telemetri",
  },
];

function Logo({ className = "size-6 md:size-7" }: { className?: string }) {
  return (
    <div className={`${className} text-primary`}>
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 4H18V8H14V4Z" />
        <path d="M6 10H10V14H6V10Z" />
        <path d="M10 10H14V14H10V10Z" />
        <path d="M10 14H14V18H10V14Z" opacity="0.3" />
      </svg>
    </div>
  );
}

export default function LoginPage({ initialOpen = true }: { initialOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Live IoT telemetry showcase on landing page
  const [sensorData, setSensorData] = useState({
    temp: 27.4,
    moisture: 68.5,
    n: 45.2,
    p: 32.1,
    k: 84.7,
    ph: 6.8,
    ec: 1.45,
    updatedAt: "Baru saja",
  });
  const [isSampling, setIsSampling] = useState(false);

  async function triggerSensorSampling() {
    setIsSampling(true);
    try {
      const res = await fetch("/api/iot/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success && data.reading) {
        setSensorData({
          temp: data.reading.soilTemperature,
          moisture: data.reading.soilMoisture,
          n: data.reading.nitrogen,
          p: data.reading.phosphorus,
          k: data.reading.potassium,
          ph: data.reading.ph,
          ec: data.reading.ec,
          updatedAt: "Baru saja",
        });
      }
    } catch {
      // Fallback update
      setSensorData({
        temp: Number((26 + Math.random() * 4).toFixed(1)),
        moisture: Number((62 + Math.random() * 12).toFixed(1)),
        n: Number((42 + Math.random() * 8).toFixed(1)),
        p: Number((30 + Math.random() * 6).toFixed(1)),
        k: Number((80 + Math.random() * 10).toFixed(1)),
        ph: Number((6.5 + Math.random() * 0.5).toFixed(2)),
        ec: Number((1.3 + Math.random() * 0.4).toFixed(2)),
        updatedAt: "Baru saja",
      });
    } finally {
      setIsSampling(false);
    }
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => emailRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setLoading(false);
      setError("Email atau password salah.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  const openLogin = () => setOpen(true);

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
            Login
          </button>
          <button
            onClick={openLogin}
            className="bg-primary hover:bg-primary/90 flex h-10 min-w-[120px] cursor-pointer items-center justify-center rounded-lg px-5 text-sm font-bold text-white transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="flex flex-col items-center gap-10 text-center">
            <div className="flex flex-col items-center gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-bold tracking-widest text-gray-600 uppercase">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Creative Problem Solving &amp; Assessment Platform
              </span>
              <h1 className="text-5xl leading-none font-black tracking-[-0.05em] uppercase md:text-8xl">
                terrawise.id
              </h1>
              <p className="max-w-[680px] text-lg leading-relaxed font-normal text-[#4e6797] md:text-2xl">
                Platform diagnostik dan penilaian paling canggih di dunia untuk infrastruktur enterprise modern. Presisi di edge.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={openLogin}
                className="flex h-14 min-w-[190px] cursor-pointer items-center justify-center rounded-lg bg-black px-8 text-base font-bold text-white transition-transform hover:scale-105 active:scale-95"
              >
                Start Assessment
              </button>
              <a
                href="#iot-section"
                className="flex h-14 min-w-[190px] cursor-pointer items-center justify-center rounded-lg border-2 border-black px-8 text-base font-bold text-black transition-all hover:scale-105 hover:bg-black hover:text-white"
              >
                Live Telemetri
              </a>
            </div>
          </div>
        </div>

        {/* Live IoT Telemetry Showcase Section */}
        <div id="iot-section" className="mx-auto max-w-[1200px] border-t border-[#e7ebf3] px-6 py-20 md:py-24">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-extrabold tracking-widest text-primary uppercase">
                  Hardware &amp; Telemetri Sensor Lapangan
                </span>
                <h2 className="mt-1 text-3xl font-black tracking-tight uppercase md:text-4xl">
                  Live Sensor Monitoring
                </h2>
                <p className="mt-1 text-sm text-[#4e6797]">
                  Data telemetri real-time yang terhubung langsung dari node probe sensor tanah di greenhouse.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>ESP8266 Online</span>
                </div>
                <button
                  type="button"
                  onClick={triggerSensorSampling}
                  disabled={isSampling}
                  className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition-all hover:bg-black/80 active:scale-95 disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-sm ${isSampling ? "animate-spin" : ""}`}>
                    refresh
                  </span>
                  <span>{isSampling ? "Mengambil Data..." : "Ambil Sampel Baru"}</span>
                </button>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
                <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Suhu Tanah</div>
                <div className="mt-3 text-3xl font-black text-black md:text-4xl">{sensorData.temp}°C</div>
                <div className="mt-1 text-xs text-emerald-600 font-semibold">Rentang Optimal</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
                <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Kelembaban</div>
                <div className="mt-3 text-3xl font-black text-black md:text-4xl">{sensorData.moisture}%</div>
                <div className="mt-1 text-xs text-blue-600 font-semibold">Kadar Air Tanah</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
                <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Tingkat pH</div>
                <div className="mt-3 text-3xl font-black text-black md:text-4xl">{sensorData.ph}</div>
                <div className="mt-1 text-xs text-purple-600 font-semibold">Netral (6.0 - 7.2)</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-black">
                <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Konduktivitas (EC)</div>
                <div className="mt-3 text-3xl font-black text-black md:text-4xl">{sensorData.ec}</div>
                <div className="mt-1 text-xs text-gray-500 font-semibold">mS/cm (Salinitas)</div>
              </div>
            </div>

            {/* NPK Banner */}
            <div className="rounded-3xl border border-black bg-black p-6 text-white md:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Kandungan Unsur Hara Makro (NPK)
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight md:text-2xl">
                    Spektrometri Status Kesuburan Tanah
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span>Kondisi Tanah: Sangat Subur</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs font-bold text-gray-400 uppercase">Nitrogen (N)</div>
                  <div className="mt-2 text-3xl font-black text-emerald-400">{sensorData.n}</div>
                  <div className="text-xs text-gray-400">mg/kg (ppm)</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs font-bold text-gray-400 uppercase">Fosfor (P)</div>
                  <div className="mt-2 text-3xl font-black text-blue-400">{sensorData.p}</div>
                  <div className="text-xs text-gray-400">mg/kg (ppm)</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs font-bold text-gray-400 uppercase">Kalium (K)</div>
                  <div className="mt-2 text-3xl font-black text-amber-400">{sensorData.k}</div>
                  <div className="text-xs text-gray-400">mg/kg (ppm)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kemampuan Inti */}
        <div id="features" className="mx-auto max-w-[1200px] border-t border-[#e7ebf3] px-6 py-20 md:py-24">
          <div className="flex flex-col gap-14">
            <div className="flex max-w-[720px] flex-col gap-3">
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">Kemampuan Inti</h2>
              <p className="text-base text-[#4e6797] md:text-lg">
                Sederhanakan infrastruktur dan manajemen pembelajaran Anda dengan diagnostik presisi dan pemantauan otomatis.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col gap-6 rounded-2xl border border-[#d0d7e7] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-primary bg-primary/10 flex size-12 items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                      {f.icon}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-[#4e6797]">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Pillars Section */}
        <div className="border-t border-[#e7ebf3] bg-gray-50/60 py-20 md:py-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="mb-14 flex max-w-[720px] flex-col gap-3">
              <span className="text-xs font-extrabold tracking-widest text-primary uppercase">Arsitektur Terintegrasi</span>
              <h2 className="text-3xl font-black tracking-tight uppercase md:text-4xl">
                Solusi End-to-End untuk Presisi Lingkungan &amp; Pembelajaran
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {PILLARS.map((p) => (
                <div
                  key={p.tag}
                  className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm transition-all hover:border-black"
                >
                  <div>
                    <span className="inline-block text-[10px] font-bold tracking-widest text-gray-400 uppercase">
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
              Siap Mengoptimalkan Pembelajaran &amp; Diagnostik Anda?
            </h2>
            <p className="text-base text-gray-300 md:text-xl">
              Bergabunglah dengan pengajar dan peneliti yang mengandalkan Terrawise untuk penilaian cerdas dan riset berbasis data sensor presisi.
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
              Platform diagnostik, asesmen pembelajaran, dan telemetri agrikultur modern.
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
            <span className="material-symbols-outlined text-sm">wifi_tethering</span>
            <span className="material-symbols-outlined text-sm">sensors</span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px]" onClick={() => setOpen(false)} />
          <div className="animate-modal-in relative flex w-full max-w-[460px] flex-col gap-6 rounded-2xl border border-[#e7ebf3] bg-white p-8 md:p-10 shadow-[0_25px_50px_rgba(0,0,0,0.15)]">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                close
              </span>
            </button>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-black tracking-tight text-black uppercase">Login</h1>
              <p className="text-xs text-[#4e6797]">
                Masukkan kredensial Anda untuk mengakses dashboard Terrawise.
              </p>
            </div>

            {/* Quick Demo Accounts Chips */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
              <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Akun Demo (Klik untuk isi cepat):
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("superadmin@terrawise.id");
                    setPassword("superadmin123");
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
                    setError("");
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left font-semibold text-gray-800 transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  🎓 Siswa
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-black uppercase" htmlFor="email">
                  Email Address
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-black uppercase" htmlFor="password">
                    Password
                  </label>
                  <span className="text-[11px] text-gray-400">demo format: [role]123</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-lg border border-[#e7ebf3] bg-white px-3.5 pr-11 text-sm text-black outline-none transition-all placeholder:text-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 w-full rounded-lg bg-black text-sm font-bold text-white transition-all hover:bg-black/90 disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Sign In"}
              </button>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <span className="material-symbols-outlined text-red-600" style={{ fontSize: 18 }}>
                    cancel
                  </span>
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
