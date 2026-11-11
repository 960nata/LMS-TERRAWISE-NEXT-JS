import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white">
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
          lock
        </span>
      </div>
      <div>
        <p className="mb-2 text-xs font-bold tracking-widest text-gray-400 uppercase">403</p>
        <h1 className="mb-3 text-3xl font-black tracking-tight uppercase md:text-5xl">Akses Ditolak</h1>
        <p className="text-sm text-gray-500">Kamu tidak punya akses ke halaman ini.</p>
      </div>
      <Link
        href="/"
        className="flex h-12 items-center justify-center rounded-lg bg-black px-8 text-sm font-bold text-white transition-transform hover:scale-105"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
