# Terrawise.id — Modern High-Contrast Learning Management System (LMS)

Port modern dan lengkap dari ekosistem **[Terrawise.id](https://github.com/960nata/Terrawise.id)** ke stack performa tinggi **Next.js 16 (App Router + Turbopack)**, **Tailwind CSS v4**, **Drizzle ORM**, **PostgreSQL / Supabase**, dan **NextAuth v5 (Auth.js)**.

Menghadirkan seluruh fungsi pembelajaran daring (LMS), asesmen ujian interaktif, penugasan berwaktu, dan evaluasi hasil belajar dengan identitas visual khas Terrawise: *Minimalist, High Contrast, Precision-Engineered UI*.

---

## 👥 Akun Demo & Hak Akses (Sesuai Repositori Terrawise)

| Role | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | `superadmin@terrawise.id` | `superadmin123` | Akses penuh: Pengguna, Kelas, Materi, Tugas, Ujian, Notifikasi Broadcast, Laporan |
| ⚙️ **Admin** | `admin@terrawise.id` | `admin123` | Administrasi sistem, pengguna, kelas, tugas, ujian, materi, respon keluhan |
| 👨‍🏫 **Guru / Teacher** | `guru@terrawise.id` | `guru123` | Manajemen materi modul, penugasan, ujian online, kelola bank soal, penilaian & feedback |
| 🎓 **Siswa / Student** | `siswa@terrawise.id` | `siswa123` | Akses materi, kumpul tugas (jawaban & link berkas), ujian online berwaktu, riwayat nilai |
| 🎓 **Siswa 2** | `siswa2@terrawise.id` | `siswa123` | Akun siswa kedua untuk pengujian kolaborasi dan evaluasi |

---

## 📚 Modul & Fitur Utama LMS

### 1. 📝 Manajemen Tugas (Task Management)
- **Guru, Admin & Superadmin**:
  - Buat tugas baru dengan formulir modal (Bottom Sheet mobile-friendly): Judul, Deskripsi, Kelas Tujuan, Batas Waktu, Skor Maksimal.
  - Review pengumpulan tugas siswa di tabel rekapitulasi.
  - Form penilaian instan: input nilai numerik dan catatan evaluasi/feedback personal.
- **Siswa**:
  - Filter tugas berstatus: *Pending*, *Dikumpulkan*, dan *Sudah Dinilai*.
  - Modal pengumpulan jawaban: teks uraian deskriptif dan tautan dokumen pendukung (Google Drive/GitHub/dll).
  - Tampilan skor dan umpan balik personal dari guru.

### 2. 📊 Manajemen Ujian & Kuis Online (Exam Management)
- **Guru, Admin & Superadmin**:
  - Buat jadwal ujian: Judul Ujian, Kelas, Waktu Mulai & Selesai, serta Durasi Pengerjaan (menit).
  - Kelola Bank Soal (`/ujian/[id]`): Tambah soal pilihan ganda, Opsi A-D, Kunci Jawaban Benar, dan Bobot Poin per soal.
  - Monitor progres dan hasil attempt pengerjaan ujian siswa secara realtime.
- **Siswa**:
  - Status ujian otomatis: *Akan Datang*, *Sedang Berlangsung (Bisa Dikerjakan)*, dan *Selesai*.
  - Halaman pengerjaan ujian interaktif (`/student/ujian/[id]`) dengan countdown timer dan pemilihan opsi jawaban.
  - Sistem penilaian instan (Auto-Grading) langsung saat siswa mengumpulkan ujian.

### 3. 📖 Materi & Modul Pembelajaran (Material Management)
- Guru dan Admin dapat mempublikasikan bahan ajar, ringkasan materi, dan tautan dokumen referensi.
- Siswa dapat membaca materi terstruktur per kelas dan mengakses berkas dokumen.

### 4. 💬 Tiket Keluhan & Pusat Bantuan (Complaints System)
- Siswa dan guru dapat mengajukan tiket bantuan terkait kendala teknis sistem, materi, atau akun.
- Administrator dan Superadmin dapat meninjau, mengubah status tiket (*PENDING* -> *IN_PROGRESS* -> *RESOLVED*), serta memberikan tanggapan/solusi langsung.

### 5. 🔔 Notifikasi Sistem (Push Notifications)
- Peringatan otomatis ke siswa saat ada tugas baru atau kuis/ujian baru diterbitkan.
- Notifikasi ke guru saat ada siswa yang baru mengumpulkan jawaban tugas.
- Fitur broadcast notifikasi dari Superadmin dan Admin.

### 6. 📈 Laporan Nilai & Ekspor Data (Analytics & Reporting)
- Rekapitulasi nilai rata-rata, statistik kelulusan KKM, dan distribusi nilai per kelas.
- Unduh laporan nilai lengkap siswa ke format spreadsheet Excel (`.xlsx`).

---

## 🚀 Menjalankan Project

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Setup Konfigurasi Environment**:
   Salin `.env.example` menjadi `.env` dan masukkan kredensial database PostgreSQL:
   ```bash
   cp .env.example .env
   ```

3. **Seeding Database**:
   ```bash
   npm run seed
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Akses aplikasi di: **`http://localhost:3000`**
