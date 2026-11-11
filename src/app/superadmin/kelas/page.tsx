import { db } from "@/lib/db";
import { enrollments, kelas, users } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { ActionModal, DataTable, Icon, Label, PageHeader, inputClass, primaryButtonClass, tdClass } from "@/components/ui";
import { addStudent, createClass, removeStudent, updateClass, deleteClass } from "./actions";

export const instant = false;

export default async function ClassPage() {
  const [teachers, students, classes, members] = await Promise.all([
    db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.role, "TEACHER"))
      .orderBy(asc(users.name)),
    db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.role, "STUDENT"))
      .orderBy(asc(users.name)),
    db
      .select({
        id: kelas.id,
        name: kelas.name,
        description: kelas.description,
        teacherId: kelas.teacherId,
        teacher: users.name,
      })
      .from(kelas)
      .innerJoin(users, eq(kelas.teacherId, users.id))
      .orderBy(asc(kelas.name)),
    db
      .select({ id: enrollments.id, kelasId: enrollments.kelasId, name: users.name })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .orderBy(asc(users.name)),
  ]);

  return (
    <>
      <PageHeader
        title="Manajemen Kelas"
        description="Kelola alokasi kelas, tetapkan guru pengajar, dan daftarkan siswa."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ActionModal
              triggerText="Buat Kelas"
              triggerIcon="add"
              title="Buat Kelas Baru"
              description="Buat kelas pembelajaran baru dan tetapkan guru penanggung jawab."
            >
              <form action={createClass} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Kelas</Label>
                  <input
                    className={inputClass}
                    id="name"
                    name="name"
                    required
                    maxLength={120}
                    placeholder="cth: XII Pertanian Presisi A"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Keterangan / Deskripsi Kelas</Label>
                  <input
                    className={inputClass}
                    id="description"
                    name="description"
                    maxLength={1000}
                    placeholder="cth: Kelas riset sensor NPK dan monitoring lahan"
                  />
                </div>
                <div>
                  <Label htmlFor="teacherId">Guru Pengajar</Label>
                  <select
                    className={inputClass}
                    id="teacherId"
                    name="teacherId"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Pilih Guru Pengajar
                    </option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button className={`${primaryButtonClass} w-full`}>
                    <Icon name="add" size={16} /> Buat Kelas Sekarang
                  </button>
                </div>
              </form>
            </ActionModal>

            <ActionModal
              triggerText="Tambah Siswa"
              triggerIcon="person_add"
              triggerClassName="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold tracking-wider text-black uppercase transition-all hover:border-black active:scale-95 shadow-sm"
              title="Daftarkan Siswa ke Kelas"
              description="Masukkan siswa terdaftar ke dalam kelas yang telah ditentukan."
            >
              <form action={addStudent} className="space-y-4">
                <div>
                  <Label htmlFor="kelasId">Pilih Kelas</Label>
                  <select
                    className={inputClass}
                    name="kelasId"
                    id="kelasId"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Pilih Kelas Tujuan
                    </option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="studentId">Pilih Siswa</Label>
                  <select
                    className={inputClass}
                    name="studentId"
                    id="studentId"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Pilih Siswa Terdaftar
                    </option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button className={`${primaryButtonClass} w-full`}>
                    <Icon name="person_add" size={16} /> Daftarkan Siswa ke Kelas
                  </button>
                </div>
              </form>
            </ActionModal>
          </div>
        }
      />

      <DataTable
        columns={[
          { label: "Informasi Kelas" },
          { label: "Guru Pengajar" },
          { label: "Daftar Siswa Terdaftar" },
        ]}
      >
        {classes.map((c) => {
          const classMembers = members.filter((m) => m.kelasId === c.id);
          return (
            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
              <td className={tdClass}>
                <p className="font-bold text-black text-sm">{c.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.description || "-"}</p>
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer font-bold text-black underline hover:text-gray-600">
                    Edit / Hapus Kelas Ini
                  </summary>
                  <form action={updateClass} className="mt-3 space-y-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                    <input type="hidden" name="id" value={c.id} />
                    <div>
                      <Label htmlFor={`edit-name-${c.id}`}>Nama Kelas</Label>
                      <input
                        id={`edit-name-${c.id}`}
                        aria-label="Nama kelas"
                        className={inputClass}
                        name="name"
                        defaultValue={c.name}
                        required
                        maxLength={120}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-desc-${c.id}`}>Keterangan</Label>
                      <input
                        id={`edit-desc-${c.id}`}
                        aria-label="Keterangan"
                        className={inputClass}
                        name="description"
                        defaultValue={c.description ?? ""}
                        maxLength={1000}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-teacher-${c.id}`}>Guru Pengajar</Label>
                      <select
                        id={`edit-teacher-${c.id}`}
                        aria-label="Guru"
                        className={inputClass}
                        name="teacherId"
                        defaultValue={c.teacherId}
                      >
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button className={primaryButtonClass} type="submit">
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                  <form action={deleteClass} className="mt-2 text-right">
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      className="text-xs text-red-600 hover:text-red-800 underline font-bold"
                      type="submit"
                    >
                      Hapus Kelas Ini
                    </button>
                  </form>
                </details>
              </td>
              <td className={`${tdClass} font-semibold text-black`}>{c.teacher}</td>
              <td className={tdClass}>
                {classMembers.length === 0 ? (
                  <span className="text-gray-400 italic">Belum ada siswa</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {classMembers.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs"
                      >
                        <span className="font-medium text-black">{m.name}</span>
                        <form action={removeStudent} className="inline">
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            title="Keluarkan dari kelas"
                            className="text-gray-400 hover:text-red-600 font-bold"
                          >
                            ×
                          </button>
                        </form>
                      </span>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
