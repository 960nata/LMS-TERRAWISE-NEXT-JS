"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center text-black">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-black bg-black text-white shadow-xl shadow-black/10">
        <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
          warning
        </span>
      </div>

      <span className="mb-3 inline-block rounded-full border border-black bg-neutral-100 px-3.5 py-1 text-xs font-black tracking-widest text-black uppercase">
        Error 500 &middot; Terjadi Gangguan Sistem
      </span>

      <h1 className="mb-3 text-3xl font-black tracking-tight uppercase md:text-5xl text-black">
        TERJADI KESALAHAN TEKNIS
      </h1>

      <p className="mb-8 max-w-md text-sm leading-relaxed text-gray-600">
        Sistem mengalami kendala sementara saat memproses permintaan Anda. Silakan coba muat ulang atau kembali ke beranda.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={() => reset()}
          className="flex h-12 w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl bg-black px-6 text-xs font-black tracking-widest text-white uppercase transition-all hover:bg-neutral-800 shadow-lg shadow-black/10"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            refresh
          </span>
          Muat Ulang
        </button>

        <Link
          href="/"
          className="flex h-12 w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 text-xs font-black tracking-widest text-black uppercase transition-all hover:border-black hover:bg-gray-50"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            dashboard
          </span>
          Ke Beranda
        </Link>
      </div>

      <p className="mt-12 text-[11px] text-gray-400">
        Kode Digest: {error.digest || "ERR_SYS_UNKNOWN"}
      </p>
    </div>
  );
}
