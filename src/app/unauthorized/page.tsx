export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">403 - Akses Ditolak</h1>
      <p className="text-gray-500">Kamu gak punya akses ke halaman ini.</p>
    </div>
  );
}
