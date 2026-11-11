# 📱 TERRAWISE.ID - Next.js Fullstack Clone

Porting lengkap platform **[Terrawise.id](https://github.com/960nata/Terrawise.id)** (versi Laravel) ke **Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 + Drizzle ORM (Supabase PostgreSQL) + NextAuth.js v5**.

Menghadirkan seluruh fungsi pembelajaran (LMS), diagnostik presisi, dan **IoT Telemetri Lingkungan** dengan identitas visual khas Terrawise: *Minimalist, High Contrast, Precision-Engineered UI*.

---

## 👥 Akun Demo (Sesuai `DEMO_ACCOUNTS.md` Laravel)

Untuk mempermudah pengujian, modal login dilengkapi tombol **Quick Fill** untuk setiap peran:

| Peran | Email | Password | Akses & Wewenang |
|---|---|---|---|
| 👑 **Super Admin** | `superadmin@terrawise.id` | `superadmin123` | Akses penuh: Pengguna, Kelas, Notifikasi Broadcast, IoT, Laporan |
| ⚙️ **Admin** | `admin@terrawise.id` | `admin123` | Administrasi sistem, pengguna, kelas, IoT monitoring, keluhan |
| 👨‍🏫 **Guru / Teacher** | `guru@terrawise.id` | `guru123` | Manajemen materi, penugasan, ujian, penilaian, riset IoT kelas |
| 🎓 **Siswa / Student** | `siswa@terrawise.id` | `siswa123` | Akses materi, kumpul tugas, ujian online, telemetri IoT, cek nilai |

---

## 🚀 Fitur yang Telah Diimplementasikan

### 1. 🌐 Landing Page & Legal
- Tampilan beranda interaktif presisi tinggi (`terrawise.id | Creative Problem Solving`)
- Hero section, badge indikator status sistem, dan CTA
- Bagian **Kemampuan Inti** (Pemantauan Real-time, Kepatuhan Otomatis, Integrasi Edge, Analitik Prediktif)
- 4 Pilar Arsitektur Terintegrasi Terrawise
- Modal Login popup interaktif dengan toggle password & chip akun demo instan
- Halaman legalitas: `/privacy`, `/terms`, dan `/security`

### 2. 📡 Integrasi & Telemetri IoT Lapangan
- Dashboard telemetri sensor tanah lengkap:
  - **Suhu Tanah (°C)**
  - **Kelembaban Tanah (%)**
  - **Unsur Hara NPK (Nitrogen, Fosfor, Kalium) dalam mg/kg (ppm)**
  - **pH Tanah (Tingkat Keasaman 0 - 14)**
  - **Konduktivitas Listrik / EC (mS/cm)**
- Status koneksi realtime MQTT node ESP8266/ESP32
- Tombol trigger sampling sensor instan
- Riwayat log telemetri sensor tabel
- REST API Endpoint: `/api/iot/telemetry` (GET riwayat, POST snapshot data baru)

### 3. 📚 Manajemen Pembelajaran (LMS)
- **Materi Pembelajaran**: Pembuatan materi oleh guru, lampiran dokumen/link, dan pembacaan materi oleh siswa.
- **Manajemen Tugas**: Pembuatan tugas mandiri dan kelompok, deadline, pengumpulan jawaban siswa, dan grading dengan feedback guru.
- **Ujian Online**: Pembuatan ujian berwaktu, bank soal pilihan ganda, pengerjaan ujian interaktif dengan timer dan auto-grading skor.

### 4. 📢 Push Notifikasi & Broadcast
- Superadmin & Admin dapat menyiarkan notifikasi ke seluruh pengguna, semua guru, atau semua siswa.
- Dropdown notifikasi di header shell + halaman riwayat notifikasi di setiap role.

### 5. 🎫 Tiket Keluhan & Bantuan
- Siswa dan guru dapat mengajukan tiket bantuan kendala teknis sistem atau hardware sensor.
- Admin dan superadmin dapat meninjau, mengubah status (`PENDING`, `IN_PROGRESS`, `RESOLVED`), dan membalas keluhan.

### 6. 📊 Laporan & Export Nilai
- Siswa: Rekapitulasi nilai tugas dan ujian, rata-rata nilai, dan status KKM (≥ 75).
- Pengajar & Admin: Laporan kelas terpusat serta tombol ekspor file spreadsheet Excel (`.xlsx`) via endpoint `/api/export/nilai`.

---

## 🛠️ Stack Teknologi

- **Framework**: Next.js 16.4.6 (App Router, Turbopack, Partial Prerendering)
- **UI Library**: React 19.3, Tailwind CSS v4, Lucide React, Google Material Symbols
- **Database & ORM**: PostgreSQL (Supabase) via Drizzle ORM
- **Authentication**: NextAuth.js (Auth.js v5 beta) dengan bcryptjs
- **Exporting**: ExcelJS

---

## 💻 Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Schema ke Database
```bash
npm run db:push
```

### 3. Seed Data Awal & Akun Demo
```bash
npm run seed
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Akses di browser: `http://localhost:3000`

### 5. Production Build
```bash
npm run build
npm start
```
