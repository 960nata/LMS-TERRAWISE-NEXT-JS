import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import {
  ActionModal,
  Badge,
  DataTable,
  Label,
  PageHeader,
  StatCard,
  StatGrid,
  inputClass,
  primaryButtonClass,
  tdClass,
} from "@/components/ui";
import { createUser, toggleUser, deleteUser } from "./actions";

export const instant = false;

export default async function UsersPage() {
  const list = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .orderBy(asc(users.name));

  const totalAdmin = list.filter((u) => u.role === "ADMIN" || u.role === "SUPERADMIN").length;
  const totalGuru = list.filter((u) => u.role === "TEACHER").length;
  const totalSiswa = list.filter((u) => u.role === "STUDENT").length;

  return (
    <>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun hak akses administrator, guru pengajar, dan siswa terdaftar."
        action={
          <ActionModal
            triggerText="Tambah Pengguna"
            triggerIcon="person_add"
            title="Tambah Pengguna Baru"
            description="Buat akun baru untuk hak akses Guru, Siswa, atau Administrator."
          >
            <form action={createUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <input
                  className={inputClass}
                  id="name"
                  name="name"
                  required
                  maxLength={120}
                  placeholder="cth: Ahmad Fauzi"
                />
              </div>
              <div>
                <Label htmlFor="email">Alamat Email</Label>
                <input
                  className={inputClass}
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="name@terrawise.id"
                />
              </div>
              <div>
                <Label htmlFor="password">Password (minimal 6 karakter)</Label>
                <input
                  className={inputClass}
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  maxLength={72}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="role">Peran Sistem</Label>
                <select className={inputClass} id="role" name="role" defaultValue="STUDENT">
                  <option value="STUDENT">Siswa (Student)</option>
                  <option value="TEACHER">Guru (Teacher)</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="pt-2">
                <button className={`${primaryButtonClass} w-full`} type="submit">
                  Simpan &amp; Buat Pengguna
                </button>
              </div>
            </form>
          </ActionModal>
        }
      />

      <StatGrid>
        <StatCard value={list.length} label="Total Pengguna" />
        <StatCard value={totalAdmin} label="Admin &amp; Superadmin" />
        <StatCard value={totalGuru} label="Guru Pengajar" />
        <StatCard value={totalSiswa} label="Siswa Terdaftar" />
      </StatGrid>

      <DataTable
        columns={[
          { label: "Nama" },
          { label: "Email" },
          { label: "Peran" },
          { label: "Status" },
          { label: "Aksi", className: "text-right" },
        ]}
      >
        {list.map((u) => (
          <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
            <td className={tdClass}>
              <span className="font-bold text-black">{u.name}</span>
            </td>
            <td className={`${tdClass} text-gray-500`}>{u.email}</td>
            <td className={tdClass}>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 uppercase">
                {u.role}
              </span>
            </td>
            <td className={tdClass}>
              <Badge tone={u.isActive ? "green" : "gray"}>
                {u.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </td>
            <td className={`${tdClass} text-right`}>
              {u.role !== "SUPERADMIN" ? (
                <div className="flex items-center justify-end gap-3">
                  <form action={toggleUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      className="text-xs font-bold text-gray-700 hover:text-black underline"
                      type="submit"
                    >
                      {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                  <span className="text-gray-300">|</span>
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      className="text-xs font-bold text-red-600 hover:text-red-800 underline"
                      type="submit"
                    >
                      Hapus
                    </button>
                  </form>
                </div>
              ) : (
                <span className="text-xs text-gray-400 font-medium">Akun Utama</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
