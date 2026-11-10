import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard Admin</h1>
      <Link href="/admin/users" className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Kelola Pengguna</Link>
    </div>
  );
}
