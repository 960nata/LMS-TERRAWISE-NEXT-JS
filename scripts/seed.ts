import { db } from "../src/lib/db";
import {
  users,
  kelas,
  enrollments,
  materi,
  tugas,
  tugasSoal,
  tugasSubmissions,
  ujian,
  soal,
  ujianAttempts,
  notifications,
  complaints,
} from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Menjalankan Seeding Terrawise.id LMS (30 Siswa, Tugas 2 Bulan, Kerja Kelompok & Penilaian DB)...");

  // 1. Bersihkan data lama
  console.log("🧹 Membersihkan data lama di database...");
  await db.delete(ujianAttempts);
  await db.delete(soal);
  await db.delete(ujian);
  await db.delete(tugasSubmissions);
  await db.delete(tugasSoal);
  await db.delete(tugas);
  await db.delete(materi);
  await db.delete(enrollments);
  await db.delete(complaints);
  await db.delete(notifications);
  await db.delete(kelas);
  await db.delete(users);
  console.log("✅ Data lama berhasil dibersihkan.");

  // 2. Akun Guru & Administrator
  console.log("👥 Meng-hash password dan membuat akun...");
  const superadminPass = await bcrypt.hash("superadmin123", 10);
  const adminPass = await bcrypt.hash("admin123", 10);
  const guruPass = await bcrypt.hash("guru123", 10);
  const siswaPass = await bcrypt.hash("siswa123", 10);

  const [superadmin] = await db
    .insert(users)
    .values({
      name: "Super Administrator",
      email: "superadmin@terrawise.id",
      password: superadminPass,
      role: "SUPERADMIN",
    })
    .returning();

  const [admin] = await db
    .insert(users)
    .values({
      name: "Administrator Sistem",
      email: "admin@terrawise.id",
      password: adminPass,
      role: "ADMIN",
    })
    .returning();

  const [guru] = await db
    .insert(users)
    .values({
      name: "Guru Demo 1",
      email: "gurudemo1@terrawise.id",
      password: guruPass,
      role: "TEACHER",
    })
    .returning();

  const [guru2] = await db
    .insert(users)
    .values({
      name: "Guru Demo 2",
      email: "gurudemo2@terrawise.id",
      password: guruPass,
      role: "TEACHER",
    })
    .returning();

  // 3. DAFTAR 30 SISWA LENGKAP
  const studentDataList = [
    { name: "Ahmad Rizki", email: "siswa@terrawise.id" },
    { name: "Siti Nurhaliza", email: "siswa2@terrawise.id" },
    { name: "Budi Prasetyo", email: "siswa03@terrawise.id" },
    { name: "Citra Dewi Kirana", email: "siswa04@terrawise.id" },
    { name: "Dika Pratama", email: "siswa05@terrawise.id" },
    { name: "Eka Putri Lestari", email: "siswa06@terrawise.id" },
    { name: "Fajar Hidayat", email: "siswa07@terrawise.id" },
    { name: "Gita Permata", email: "siswa08@terrawise.id" },
    { name: "Hendra Wijaya", email: "siswa09@terrawise.id" },
    { name: "Intan Safitri", email: "siswa10@terrawise.id" },
    { name: "Joko Susilo", email: "siswa11@terrawise.id" },
    { name: "Kartika Sari", email: "siswa12@terrawise.id" },
    { name: "Lukman Hakim", email: "siswa13@terrawise.id" },
    { name: "Maya Anggraini", email: "siswa14@terrawise.id" },
    { name: "Naufal Rahman", email: "siswa15@terrawise.id" },
    { name: "Olivia Maharani", email: "siswa16@terrawise.id" },
    { name: "Panji Wicaksono", email: "siswa17@terrawise.id" },
    { name: "Qoriatul Jannah", email: "siswa18@terrawise.id" },
    { name: "Rian Saputra", email: "siswa19@terrawise.id" },
    { name: "Salsabila Putri", email: "siswa20@terrawise.id" },
    { name: "Taufik Ismail", email: "siswa21@terrawise.id" },
    { name: "Utami Ningsih", email: "siswa22@terrawise.id" },
    { name: "Viko Ardiansyah", email: "siswa23@terrawise.id" },
    { name: "Wulan Dari", email: "siswa24@terrawise.id" },
    { name: "Yoga Pratama", email: "siswa25@terrawise.id" },
    { name: "Zahra Amelia", email: "siswa26@terrawise.id" },
    { name: "Aditya Nugraha", email: "siswa27@terrawise.id" },
    { name: "Bella Claudia", email: "siswa28@terrawise.id" },
    { name: "Candra Gunawan", email: "siswa29@terrawise.id" },
    { name: "Dina Mariana", email: "siswa30@terrawise.id" },
  ];

  const insertedStudents = await db
    .insert(users)
    .values(
      studentDataList.map((s) => ({
        name: s.name,
        email: s.email,
        password: siswaPass,
        role: "STUDENT" as const,
      }))
    )
    .returning();

  console.log(`✅ Berhasil membuat ${insertedStudents.length} akun siswa.`);

  // 4. Kelas Pembelajaran
  const [kelasXI] = await db
    .insert(kelas)
    .values({
      name: "XI MIPA 2 - Rekayasa Perangkat Lunak & Logika (Kelas Demo 1)",
      description: "Pengembangan pemikiran komputasi, arsitektur perangkat lunak, algoritma pemrograman, dan basis data terapan (Kelas Binaan Guru Demo 1)",
      teacherId: guru.id,
    })
    .returning();

  const [kelasX] = await db
    .insert(kelas)
    .values({
      name: "X MIPA 1 - Sains & Komputasi Dasar (Kelas Demo 1)",
      description: "Pembelajaran sains terapan, logika algoritma, dan literasi digital dasar (Kelas Binaan Guru Demo 1)",
      teacherId: guru.id,
    })
    .returning();

  const [kelasXII] = await db
    .insert(kelas)
    .values({
      name: "XII MIPA 3 - Bioteknologi & Ilmu Lingkungan (Kelas Demo 2)",
      description: "Kajian bioteknologi modern, dinamika ekosistem, dan sains lingkungan hidup (Kelas Binaan Guru Demo 2)",
      teacherId: guru2.id,
    })
    .returning();

  // Daftarkan ke-30 siswa ke kelas target XI MIPA 2
  await db.insert(enrollments).values(
    insertedStudents.map((s) => ({
      studentId: s.id,
      kelasId: kelasXI.id,
    }))
  );

  // Daftarkan juga 2 siswa utama ke kelas X dan XII untuk cross-testing
  await db.insert(enrollments).values([
    { studentId: insertedStudents[0].id, kelasId: kelasX.id },
    { studentId: insertedStudents[0].id, kelasId: kelasXII.id },
    { studentId: insertedStudents[1].id, kelasId: kelasX.id },
    { studentId: insertedStudents[1].id, kelasId: kelasXII.id },
  ]);

  console.log(`✅ Seluruh ${insertedStudents.length} siswa berhasil didaftarkan ke ${kelasXI.name}.`);

  // 5. Materi Pembelajaran (Bab 1 s/d Bab 4 di Kelas XI MIPA 2)
  await db.insert(materi).values([
    {
      title: "Bab 1: Dasar Arsitektur Sistem Perangkat Lunak & SDLC Modern",
      content:
        "Pembahasan komprehensif mengenai siklus hidup pengembangan perangkat lunak (SDLC), metodologi Agile Scrum, pemodelan use case diagram, activity diagram, serta penyusunan dokumen Software Requirements Specification (SRS) standar industri.",
      fileUrl: "https://drive.google.com/sample/bab1-arsitektur-sdlc.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Bab 2: Desain Basis Data Relasional, ERD, dan Normalisasi 3NF",
      content:
        "Konsep Entity Relationship Diagram (ERD), normalisasi tabel dari 1NF hingga 3NF untuk mencegah redundansi dan anomali, manajemen constraint foreign key, serta perancangan index untuk performa query relasional.",
      fileUrl: "https://drive.google.com/sample/bab2-database-normalisasi.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Bab 3: Pemrograman Berorientasi Objek & Clean Architecture",
      content:
        "Penerapan 4 pilar OOP (Encapsulation, Abstraction, Inheritance, Polymorphism) dan prinsip SOLID. Membangun struktur kode modular, pemisahan layer controller-service-repository, dan unit testing otomatis.",
      fileUrl: "https://drive.google.com/sample/bab3-oop-clean-architecture.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Bab 4: Kolaborasi Tim, Git Flow, dan Manajemen Proyek Agile",
      content:
        "Panduan kerja kolaborasi tim: branching strategy (main, staging, feature branch), pull request review, merge conflict resolution, CI/CD pipeline automation, serta teknik evaluasi sejawat (peer review).",
      fileUrl: "https://drive.google.com/sample/bab4-git-collaboration-agile.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Pengantar Algoritma dan Struktur Data Dasar",
      content: "Memahami konsep efisiensi algoritma, notasi Big-O, tipe data primitif, array, stack, dan queue.",
      fileUrl: "https://example.com/modul-algoritma-dasar.pdf",
      kelasId: kelasX.id,
      authorId: guru.id,
    },
    {
      title: "Bioteknologi Fermentasi & Rekayasa Pangan Tradisional",
      content: "Kajian mikroorganisme dalam fermentasi pangan bernilai gizi tinggi dan teknik kontrol sterilisasi.",
      fileUrl: "https://example.com/bioteknologi-fermentasi.pdf",
      kelasId: kelasXII.id,
      authorId: guru2.id,
    },
  ]);

  console.log("✅ Materi pembelajaran berhasil dibuat.");

  // 6. RENTANG WAKTU 2 BULAN (60 Hari ke Depan)
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const twoMonthsDue = new Date(now + 60 * day); // 2 Bulan dari sekarang

  // =========================================================================
  // TUGAS 1: PROYEK KELOMPOK (Model Asesmen 4 - Pengerjaan 2 Bulan)
  // =========================================================================
  const groupDivisionConfig = {
    groups: [
      {
        id: "grp-1",
        name: "Kelompok 1 (Alpha Dev)",
        leader: "Ahmad Rizki",
        members: "Ahmad Rizki (Ketua), Siti Nurhaliza, Budi Prasetyo, Citra Dewi Kirana, Dika Pratama, Eka Putri Lestari",
        topic: "Modul Autentikasi, Keamanan RBAC, & Audit Log Sistem",
      },
      {
        id: "grp-2",
        name: "Kelompok 2 (Beta Logic)",
        leader: "Fajar Hidayat",
        members: "Fajar Hidayat (Ketua), Gita Permata, Hendra Wijaya, Intan Safitri, Joko Susilo, Kartika Sari",
        topic: "Modul Kurikulum, Manajemen Kelas, & Bank Soal Terpadu",
      },
      {
        id: "grp-3",
        name: "Kelompok 3 (Gamma Core)",
        leader: "Lukman Hakim",
        members: "Lukman Hakim (Ketua), Maya Anggraini, Naufal Rahman, Olivia Maharani, Panji Wicaksono, Qoriatul Jannah",
        topic: "Modul Ujian Berbasis Timer, Engine Acak Soal, & Auto-Grading",
      },
      {
        id: "grp-4",
        name: "Kelompok 4 (Delta Stack)",
        leader: "Rian Saputra",
        members: "Rian Saputra (Ketua), Salsabila Putri, Taufik Ismail, Utami Ningsih, Viko Ardiansyah, Wulan Dari",
        topic: "Modul Penilaian Evaluasi Sejawat (Peer Assessment) & Analitik Belajar",
      },
      {
        id: "grp-5",
        name: "Kelompok 5 (Epsilon Lab)",
        leader: "Yoga Pratama",
        members: "Yoga Pratama (Ketua), Zahra Amelia, Aditya Nugraha, Bella Claudia, Candra Gunawan, Dina Mariana",
        topic: "Modul Pelaporan Rapor Siswa & Ekspor Data Akademik Terstandar",
      },
    ],
    enablePeerAssessment: true,
    scaleItems: [
      { id: "s-1", label: "Tidak Memenuhi", points: 0 },
      { id: "s-2", label: "Kurang Baik", points: 1 },
      { id: "s-3", label: "Cukup Baik", points: 2 },
      { id: "s-4", label: "Baik & Solid", points: 3 },
      { id: "s-5", label: "Sangat Baik & Luar Biasa", points: 4 },
    ],
    criteria: [
      "Kerjasama Tim & Pembagian Tugas",
      "Kualitas Laporan & Metodologi Kerja",
      "Presentasi & Tanggung Jawab Anggota",
    ],
  };

  const [tugasKelompok] = await db
    .insert(tugas)
    .values({
      title: "Proyek Capstone 2 Bulan: Rancang Bangun Sistem Informasi Akademik & E-Learning Terpadu",
      description: `Proyek kolaboratif berskala besar berdurasi 2 bulan untuk 30 siswa yang dibagi ke dalam 5 tim kerja spesialisasi (masing-masing 6 siswa).
Deliverables proyek mencakup:
1. Dokumen Software Requirements Specification (SRS) dan Analisis Masalah
2. Desain Skema Database Relasional Ternormalisasi (ERD 3NF)
3. Implementasi Prototype Aplikasi Web Fullstack Next.js
4. Laporan Akhir Evaluasi Proyek Tim dan Evaluasi Sejawat (Peer Assessment)

Setiap ketua/anggota tim diwajibkan memberikan penilaian objektif antar kelompok lain melalui instrumen evaluasi sejawat yang disediakan.`,
      tipe: "KELOMPOK",
      dueDate: twoMonthsDue,
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  // Simpan konfigurasi 5 kelompok & rubrik peer assessment ke DB
  await db.insert(tugasSoal).values({
    tugasId: tugasKelompok.id,
    type: "ESSAY",
    question: "__GROUP_CONFIG__",
    options: groupDivisionConfig,
    points: 0,
    order: 0,
  });

  // SUBMISSION & PENILAIAN LENGKAP KE-5 KELOMPOK LANGSUNG KE DB
  // Kelompok 1 (Alpha Dev) - Submitted & Graded
  await db.insert(tugasSubmissions).values({
    tugasId: tugasKelompok.id,
    studentId: insertedStudents[0].id, // Ahmad Rizki
    groupName: "Kelompok 1 (Alpha Dev)",
    groupMembers: "Ahmad Rizki (Ketua), Siti Nurhaliza, Budi Prasetyo, Citra Dewi Kirana, Dika Pratama, Eka Putri Lestari",
    answerText: `Laporan Hasil Proyek Kelompok 1 (Alpha Dev):
- Modul autentikasi telah selesai diimplementasikan menggunakan NextAuth.js v5 dengan JWT strategy.
- Menerapkan kontrol akses berbasis peran (RBAC) ketat untuk 4 tingkatan: Superadmin, Admin, Guru, dan Siswa.
- Seluruh password di-hash menggunakan algoritma bcrypt (10 salt rounds).
- Database migration aman dan didukung audit trail login.`,
    fileUrl: "https://github.com/terrawise-org/capstone-alpha-auth-rbac",
    answers: {
      peerEvaluation: {
        targetGroup: "Kelompok 2 (Beta Logic)",
        rating: "Sangat Baik & Luar Biasa",
        points: 4,
        comment: "Struktur manajemen kurikulum dan bank soal Kelompok 2 sangat modular dan mudah diintegrasikan dengan modul auth kami.",
      },
    },
    score: 96,
    feedback: "Luar biasa! Arsitektur keamanan RBAC sangat kokoh dan kode rapi sesuai clean architecture.",
    submittedAt: new Date(now - 3 * day),
    gradedAt: new Date(now - 1 * day),
  });

  // Kelompok 2 (Beta Logic) - Submitted & Graded
  await db.insert(tugasSubmissions).values({
    tugasId: tugasKelompok.id,
    studentId: insertedStudents[6].id, // Fajar Hidayat
    groupName: "Kelompok 2 (Beta Logic)",
    groupMembers: "Fajar Hidayat (Ketua), Gita Permata, Hendra Wijaya, Intan Safitri, Joko Susilo, Kartika Sari",
    answerText: `Laporan Hasil Proyek Kelompok 2 (Beta Logic):
- Desain katalog materi pembelajaran berbasis bab dan urutan kompetensi dasar.
- Manajemen 4 model tugas dan bank soal terpadu.
- Fitur filter kategori dinamis dan preview materi PDF langsung di browser.`,
    fileUrl: "https://github.com/terrawise-org/capstone-beta-curriculum",
    answers: {
      peerEvaluation: {
        targetGroup: "Kelompok 3 (Gamma Core)",
        rating: "Baik & Solid",
        points: 3,
        comment: "Engine ujian Kelompok 3 berjalan lancar, sinkronisasi data butir soal dan kunci jawaban presisi.",
      },
    },
    score: 92,
    feedback: "Struktur kurikulum dan manajemen materi sangat terorganisir dengan baik.",
    submittedAt: new Date(now - 2 * day),
    gradedAt: new Date(now - 1 * day),
  });

  // Kelompok 3 (Gamma Core) - Submitted & Graded
  await db.insert(tugasSubmissions).values({
    tugasId: tugasKelompok.id,
    studentId: insertedStudents[12].id, // Lukman Hakim
    groupName: "Kelompok 3 (Gamma Core)",
    groupMembers: "Lukman Hakim (Ketua), Maya Anggraini, Naufal Rahman, Olivia Maharani, Panji Wicaksono, Qoriatul Jannah",
    answerText: `Laporan Hasil Proyek Kelompok 3 (Gamma Core):
- Implementasi engine ujian online berbasis timer countdown server-side & client-side.
- Fitur auto-grading instan untuk tipe pilihan ganda.
- Mekanisme auto-submit jika batas waktu pengerjaan berakhir.`,
    fileUrl: "https://github.com/terrawise-org/capstone-gamma-exam-engine",
    answers: {
      peerEvaluation: {
        targetGroup: "Kelompok 4 (Delta Stack)",
        rating: "Sangat Baik & Luar Biasa",
        points: 4,
        comment: "Instrumen penilaian evaluasi sejawat dari Kelompok 4 sangat intuitif dan memudahkan penilaian kolaborasi.",
      },
    },
    score: 94,
    feedback: "Sistem timer pengerjaan ujian sangat presisi dan auto-grading bekerja tanpa celah.",
    submittedAt: new Date(now - 2 * day),
    gradedAt: new Date(now - 12 * 60 * 60 * 1000),
  });

  // Kelompok 4 (Delta Stack) - Submitted & Graded
  await db.insert(tugasSubmissions).values({
    tugasId: tugasKelompok.id,
    studentId: insertedStudents[18].id, // Rian Saputra
    groupName: "Kelompok 4 (Delta Stack)",
    groupMembers: "Rian Saputra (Ketua), Salsabila Putri, Taufik Ismail, Utami Ningsih, Viko Ardiansyah, Wulan Dari",
    answerText: `Laporan Hasil Proyek Kelompok 4 (Delta Stack):
- Modul peer assessment dengan skala 5 poin dan input catatan konstruktif.
- Dashboard rekapitulasi penilaian sejawat per kelompok siswa.
- Kalkulasi bobot nilai tim dan transparansi evaluasi kolaboratif.`,
    fileUrl: "https://github.com/terrawise-org/capstone-delta-peer-assessment",
    answers: {
      peerEvaluation: {
        targetGroup: "Kelompok 5 (Epsilon Lab)",
        rating: "Baik & Solid",
        points: 3,
        comment: "Laporan ekspor data nilai dari Kelompok 5 sangat lengkap dan informatif.",
      },
    },
    score: 90,
    feedback: "Sistem rubrik evaluasi tim berfungsi dengan baik dan transparan.",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 6 * 60 * 60 * 1000),
  });

  // Kelompok 5 (Epsilon Lab) - Submitted & Graded
  await db.insert(tugasSubmissions).values({
    tugasId: tugasKelompok.id,
    studentId: insertedStudents[24].id, // Yoga Pratama
    groupName: "Kelompok 5 (Epsilon Lab)",
    groupMembers: "Yoga Pratama (Ketua), Zahra Amelia, Aditya Nugraha, Bella Claudia, Candra Gunawan, Dina Mariana",
    answerText: `Laporan Hasil Proyek Kelompok 5 (Epsilon Lab):
- Modul rekap nilai akademik dan ekspor transkrip nilai siswa ke format CSV dan PDF.
- Dashboard statistik perkembangan belajar siswa per semester.
- Integrasi endpoint API rekapitulasi nilai terstandar.`,
    fileUrl: "https://github.com/terrawise-org/capstone-epsilon-reports",
    answers: {
      peerEvaluation: {
        targetGroup: "Kelompok 1 (Alpha Dev)",
        rating: "Sangat Baik & Luar Biasa",
        points: 4,
        comment: "Autentikasi Kelompok 1 sangat cepat dan memudahkan modul kami mengambil data siswa yang sedang login.",
      },
    },
    score: 89,
    feedback: "Modul pelaporan sudah sangat fungsional, pertahankan kualitas dan tingkatkan performa ekspor data.",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 3 * 60 * 60 * 1000),
  });

  console.log("✅ Tugas Proyek Kelompok 2 Bulan beserta konfigurasi 5 kelompok & penilaian DB berhasil dibuat.");

  // =========================================================================
  // TUGAS 2: TUGAS MANDIRI (Model Asesmen 3 - Pengerjaan 2 Bulan)
  // =========================================================================
  const [tugasMandiri2Bulan] = await db
    .insert(tugas)
    .values({
      title: "Tugas Mandiri Analisis: Studi Kasus Perancangan Schema Database & Normalisasi 3NF",
      description: `Tugas individual komprehensif berdurasi 2 bulan:
Analisis studi kasus sistem manajemen perpustakaan digital modern.
1. Identifikasi seluruh entitas, atribut primer, foreign key, dan relasi cardinalitas (1:1, 1:N, M:N).
2. Gambarkan Entity Relationship Diagram (ERD) lengkap.
3. Lakukan proses normalisasi bertahap dari unnormalized form (UNF), 1NF, 2NF, hingga Third Normal Form (3NF).
4. Kumpulkan hasil analisis berupa ringkasan terstruktur dan tautan dokumen PDF hasil perancangan.`,
      tipe: "MANDIRI",
      dueDate: twoMonthsDue,
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  // Submission & Penilaian Tugas Mandiri oleh Ahmad Rizki
  await db.insert(tugasSubmissions).values({
    tugasId: tugasMandiri2Bulan.id,
    studentId: insertedStudents[0].id,
    answerText: `Hasil Analisis Skema Database Perpustakaan Digital:
1. Teridentifikasi 6 entitas utama: Anggota, Buku, Kategori, Peminjaman, DetailPeminjaman, dan Petugas.
2. Seluruh dependensi transitif pada tabel Peminjaman telah dipecah ke entitas referensi untuk memenuhi standar 3NF.
3. Skema telah diuji bebas dari anomali insertion, deletion, dan update.`,
    fileUrl: "https://drive.google.com/sample/erd-normalisasi-3nf-ahmad.pdf",
    score: 95,
    feedback: "Analisis dependensi fungsional sangat cermat dan perancangan skema memenuhi kaidah 3NF.",
    submittedAt: new Date(now - 2 * day),
    gradedAt: new Date(now - 1 * day),
  });

  // Submission & Penilaian Tugas Mandiri oleh Siti Nurhaliza
  await db.insert(tugasSubmissions).values({
    tugasId: tugasMandiri2Bulan.id,
    studentId: insertedStudents[1].id,
    answerText: `Ringkasan Normalisasi 3NF:
- Berhasil mengeliminasi multi-valued attributes pada 1NF.
- Menghilangkan dependensi parsial terhadap composite key pada 2NF.
- Mengisolasi dependensi transitif pada tabel anggota dan denda ke tabel referensi tarif.`,
    fileUrl: "https://drive.google.com/sample/laporan-erd-siti.pdf",
    score: 92,
    feedback: "Penjelasan tahapan normalisasi sangat runtut dan mudah dipahami.",
    submittedAt: new Date(now - 2 * day),
    gradedAt: new Date(now - 12 * 60 * 60 * 1000),
  });

  // =========================================================================
  // TUGAS 3: SOAL ESSAY (Model Asesmen 2 - Pengerjaan 2 Bulan)
  // =========================================================================
  const [tugasEssay2Bulan] = await db
    .insert(tugas)
    .values({
      title: "Tugas Uraian Komprehensif: Pemodelan UML, Use Case, dan Prinsip SOLID",
      description: `Jawablah butir pertanyaan uraian berikut dengan argumen analitis dan contoh implementasi nyata. Setiap butir soal dinilai berdasarkan rubrik kejelasan konsep dan kedalaman analisis teknis.`,
      tipe: "ESSAY",
      dueDate: twoMonthsDue,
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const [esSoal1, esSoal2, esSoal3, esSoal4] = await db
    .insert(tugasSoal)
    .values([
      {
        tugasId: tugasEssay2Bulan.id,
        type: "ESSAY",
        question: "Jelaskan prinsip Single Responsibility Principle (SRP) dalam SOLID dan berikan contoh refactoring kode class yang melanggar prinsip tersebut!",
        points: 25,
        order: 1,
      },
      {
        tugasId: tugasEssay2Bulan.id,
        type: "ESSAY",
        question: "Bagaimana cara kerja prinsip Dependency Inversion Principle (DIP) dalam memisahkan modul tingkat tinggi (high-level) dari modul tingkat rendah (low-level)?",
        points: 25,
        order: 2,
      },
      {
        tugasId: tugasEssay2Bulan.id,
        type: "ESSAY",
        question: "Uraikan perbedaan fungsional antara relasi 'include' dan 'extend' pada Use Case Diagram UML disertai contoh kasus nyata!",
        points: 25,
        order: 3,
      },
      {
        tugasId: tugasEssay2Bulan.id,
        type: "ESSAY",
        question: "Dalam perancangan RESTful API, jelaskan peran status code HTTP (200, 201, 400, 401, 403, 404, 500) dan best practice pendokumentasian payload!",
        points: 25,
        order: 4,
      },
    ])
    .returning();

  // Submission & Penilaian Soal Essay oleh Ahmad Rizki
  await db.insert(tugasSubmissions).values({
    tugasId: tugasEssay2Bulan.id,
    studentId: insertedStudents[0].id,
    answers: {
      [esSoal1.id]: "SRP menyatakan bahwa sebuah class hanya boleh memiliki satu alasan untuk berubah. Contoh: Memisahkan UserReportGenerator dari UserRepository.",
      [esSoal2.id]: "DIP mengarahkan agar modul tingkat tinggi dan tingkat rendah sama-sama bergantung pada abstraksi/interface, bukan pada implementasi konkrit.",
      [esSoal3.id]: "Relasi 'include' menunjukkan perilaku wajib yang selalu dieksekusi (cth: Checkout include Login), sedangkan 'extend' adalah perilaku opsional kondisional (cth: Checkout extend GunakanVoucherDiskon).",
      [esSoal4.id]: "HTTP status code memberikan standarisasi respons: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, dan 500 Internal Server Error.",
    },
    answerText: "Lembar jawaban essay lengkap telah diisi.",
    score: 98,
    feedback: "Penjelasan prinsip SOLID dan Use Case Diagram sangat sempurna dan aplikatif!",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 5 * 60 * 60 * 1000),
  });

  // =========================================================================
  // TUGAS 4: KUIS PILIHAN GANDA (Model Asesmen 1 - Pengerjaan 2 Bulan)
  // =========================================================================
  const [tugasPG2Bulan] = await db
    .insert(tugas)
    .values({
      title: "Kuis Evaluasi Berkala: Pemahaman Konsep Pemrograman & Algoritma Lanjut",
      description: "Kuis objektif 10 butir soal pilihan ganda untuk mengevaluasi pemahaman logika pemrograman dan algoritma. Sistem akan menghitung skor otomatis secara instan.",
      tipe: "MULTIPLE_CHOICE",
      dueDate: twoMonthsDue,
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const mcSoalList = await db
    .insert(tugasSoal)
    .values([
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Prinsip OOP yang membungkus data (atribut) dan fungsi (method) dalam satu kesatuan unit class disebut...",
        options: ["Enkapsulasi (Encapsulation)", "Pewarisan (Inheritance)", "Polimorfisme (Polymorphism)", "Abstraksi (Abstraction)"],
        correctAnswer: "A",
        points: 10,
        order: 1,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Perintah SQL yang digunakan untuk menambahkan kolom baru ke tabel yang sudah ada adalah...",
        options: ["ALTER TABLE ... ADD COLUMN", "UPDATE TABLE ... ADD", "MODIFY TABLE ... INSERT", "CREATE COLUMN ... IN"],
        correctAnswer: "A",
        points: 10,
        order: 2,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Kompleksitas waktu rata-rata (average time complexity) dari algoritma Quick Sort adalah...",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correctAnswer: "A",
        points: 10,
        order: 3,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Struktur data yang beroperasi berdasarkan prinsip First-In, First-Out (FIFO) adalah...",
        options: ["Queue", "Stack", "Binary Tree", "Hash Map"],
        correctAnswer: "A",
        points: 10,
        order: 4,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Dalam Git, perintah untuk menggabungkan perubahan dari branch lain ke branch saat ini adalah...",
        options: ["git merge", "git push", "git clone", "git status"],
        correctAnswer: "A",
        points: 10,
        order: 5,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Klausul SQL yang digunakan untuk menyaring data berdasarkan fungsi agregasi seperti COUNT() atau AVG() adalah...",
        options: ["HAVING", "WHERE", "ORDER BY", "GROUP BY"],
        correctAnswer: "A",
        points: 10,
        order: 6,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Dalam arsitektur MVC, komponen yang bertanggung jawab untuk menangani logika bisnis dan manipulasi data adalah...",
        options: ["Model", "View", "Controller", "Router"],
        correctAnswer: "A",
        points: 10,
        order: 7,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Protokol keamanan web standar yang mengenkripsi komunikasi antara browser klien dan web server adalah...",
        options: ["HTTPS (TLS/SSL)", "FTP", "HTTP biasa", "Telnet"],
        correctAnswer: "A",
        points: 10,
        order: 8,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Metode HTTP yang bersifat idempoten dan digunakan untuk memperbarui seluruh resource data secara lengkap adalah...",
        options: ["PUT", "POST", "PATCH", "DELETE"],
        correctAnswer: "A",
        points: 10,
        order: 9,
      },
      {
        tugasId: tugasPG2Bulan.id,
        type: "MULTIPLE_CHOICE",
        question: "Indeks basis data yang menjamin tidak adanya duplikasi nilai pada kolom tertentu disebut...",
        options: ["Unique Index", "Clustered Index", "Full-text Index", "Foreign Index"],
        correctAnswer: "A",
        points: 10,
        order: 10,
      },
    ])
    .returning();

  // Submission Kuis PG oleh Siswa 1 (Skor 100)
  await db.insert(tugasSubmissions).values({
    tugasId: tugasPG2Bulan.id,
    studentId: insertedStudents[0].id,
    answers: Object.fromEntries(mcSoalList.map((s) => [s.id, "A"])),
    score: 100,
    feedback: "Sempurna! Seluruh butir kuis pilihan ganda dijawab dengan benar.",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 1 * day),
  });

  // Submission Kuis PG oleh Siswa 2 (Skor 90)
  await db.insert(tugasSubmissions).values({
    tugasId: tugasPG2Bulan.id,
    studentId: insertedStudents[1].id,
    answers: {
      ...Object.fromEntries(mcSoalList.map((s) => [s.id, "A"])),
      [mcSoalList[2].id]: "B", // 1 salah
    },
    score: 90,
    feedback: "Sangat baik! 9 dari 10 soal terjawab dengan tepat.",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 1 * day),
  });

  console.log("✅ 4 Tipe Tugas Berdurasi 2 Bulan lengkap dengan butir soal & penilaian DB berhasil dibuat.");

  // =========================================================================
  // 7. UJIAN AKHIR SEMESTER (UAS CAMPURAN PG & ESSAY - RENTANG 2 BULAN)
  // =========================================================================
  const [uasMixed] = await db
    .insert(ujian)
    .values({
      title: "Ujian Akhir Semester (UAS) Komprehensif Rekayasa Perangkat Lunak",
      tipe: "MIXED",
      startTime: new Date(now - 1 * day),
      endTime: twoMonthsDue,
      durationMinutes: 90,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const uasSoalList = await db
    .insert(soal)
    .values([
      {
        ujianId: uasMixed.id,
        type: "MULTIPLE_CHOICE",
        question: "Prinsip arsitektur perangkat lunak yang memisahkan tanggung jawab penulisan query (Command) dan pembacaan data (Query) adalah...",
        options: ["CQRS (Command Query Responsibility Segregation)", "MVC (Model View Controller)", "Monolithic Layered", "Microkernel"],
        correctAnswer: "A",
        points: 15,
        order: 1,
      },
      {
        ujianId: uasMixed.id,
        type: "MULTIPLE_CHOICE",
        question: "Tingkat isolasi transaksi database yang paling tinggi dan sepenuhnya mencegah fenomena Phantom Read adalah...",
        options: ["Serializable", "Repeatable Read", "Read Committed", "Read Uncommitted"],
        correctAnswer: "A",
        points: 15,
        order: 2,
      },
      {
        ujianId: uasMixed.id,
        type: "MULTIPLE_CHOICE",
        question: "Metode autentikasi stateless berbasis token yang menyematkan payload digital tersignatur kriptografis adalah...",
        options: ["JSON Web Token (JWT)", "Server Session Cookie", "Basic Auth", "OAuth1 MAC"],
        correctAnswer: "A",
        points: 15,
        order: 3,
      },
      {
        ujianId: uasMixed.id,
        type: "MULTIPLE_CHOICE",
        question: "Strategi indexing yang paling efektif untuk mempercepat pencarian teks parsial berskala besar adalah...",
        options: ["Full-Text Index / GIN Index", "B-Tree Index Biasa", "Hash Index", "Bitmap Index"],
        correctAnswer: "A",
        points: 15,
        order: 4,
      },
      {
        ujianId: uasMixed.id,
        type: "ESSAY",
        question: "Uraikan perancangan sistem penanganan konkurensi (Concurrency Control) pada sistem pendaftaran kelas menggunakan Optimistic Locking vs Pessimistic Locking!",
        rubric: "Penjelasan Optimistic Locking via versi data (10 poin), Pessimistic Locking via SELECT FOR UPDATE (10 poin).",
        points: 20,
        order: 5,
      },
      {
        ujianId: uasMixed.id,
        type: "ESSAY",
        question: "Jelaskan arsitektur caching multi-layer (Memory Cache, Redis, HTTP CDN) untuk mereduksi beban query pada database terpusat!",
        rubric: "Kesesuaian strategi cache invalidation (10 poin), contoh kasus data leaderboard/kuis (10 poin).",
        points: 20,
        order: 6,
      },
    ])
    .returning();

  // Attempt Ujian oleh Siswa 1 (Ahmad Rizki)
  await db.insert(ujianAttempts).values({
    ujianId: uasMixed.id,
    studentId: insertedStudents[0].id,
    answers: {
      [uasSoalList[0].id]: "A",
      [uasSoalList[1].id]: "A",
      [uasSoalList[2].id]: "A",
      [uasSoalList[3].id]: "A",
      [uasSoalList[4].id]: "Optimistic locking menggunakan kolom version_number untuk mendeteksi perubahan sebelum commit, sangat efisien untuk operasi baca tinggi. Pessimistic locking menggunakan row lock database untuk mencegah akses paralel pada transaksi kritis.",
      [uasSoalList[5].id]: "Caching multi-layer membagi beban: L1 di memory aplikasi, L2 di Redis terdistribusi, dan L3 di CDN edge. Teknik stale-while-revalidate menjaga ketersediaan data secara instan.",
    },
    score: 96,
    feedback: "Analisis konkurensi database dan strategi caching sangat matang dan mendalam!",
    startedAt: new Date(now - 1 * day),
    submittedAt: new Date(now - 1 * day + 65 * 60 * 1000),
  });

  console.log("✅ Ujian UAS Komprehensif 2 Bulan lengkap dengan bank soal & attempt siswa berhasil dibuat.");

  // =========================================================================
  // 8. NOTIFIKASI & TIKET
  // =========================================================================
  await db.insert(notifications).values([
    {
      userId: insertedStudents[0].id,
      title: "Proyek Kelompok Capstone Diterbitkan",
      message: "Dr. Budi Santoso menerbitkan Proyek Capstone 2 Bulan. Anda tergabung dalam Kelompok 1 (Alpha Dev).",
      isRead: false,
    },
    {
      userId: insertedStudents[0].id,
      title: "Hasil Penilaian Proyek Kelompok",
      message: "Proyek Kelompok 1 (Alpha Dev) telah dinilai guru dengan skor 96/100.",
      isRead: false,
    },
    {
      userId: guru.id,
      title: "Seluruh Kelompok Telah Mengumpulkan Proyek",
      message: "Kelompok 1 s/d Kelompok 5 telah mengirimkan laporan capstone dan evaluasi sejawat.",
      isRead: true,
    },
    {
      userId: admin.id,
      title: "Kelas XI MIPA 2 Siap Digunakan",
      message: "30 Siswa, 4 materi bab, 4 tipe tugas berdurasi 2 bulan, dan ujian telah aktif di database.",
      isRead: true,
    },
  ]);

  await db.insert(complaints).values([
    {
      userId: insertedStudents[0].id,
      title: "Konsultasi Teknis Repositori Proyek Capstone",
      message: "Apakah kelompok diperbolehkan menggunakan library UI Tailwind dan database PostgreSQL lokal untuk modul autentikasi?",
      category: "Tugas & Ujian",
      priority: "MEDIUM",
      status: "RESOLVED",
      reply: "Sangat diperbolehkan! Silakan gunakan stack teknologi modern yang relevan dengan kebutuhan proyek kelompok Anda.",
    },
  ]);

  console.log("\n=======================================================");
  console.log("🎉 SEEDING DATA BERHASIL DENGAN SUKSES! 🎉");
  console.log("=======================================================");
  console.log(`📚 Kelas Target : XI MIPA 2 - Rekayasa Perangkat Lunak & Logika (Kelas Demo 1)`);
  console.log(`👨‍🏫 Guru Pengampu: Guru Demo 1 (gurudemo1@terrawise.id / guru@terrawise.id)`);
  console.log(`👥 Total Siswa  : 30 Siswa Aktif Terdaftar (Password: siswa123)`);
  console.log(`⏱️ Rentang Waktu: 2 BULAN PENUH (Deadline: ${twoMonthsDue.toLocaleDateString("id-ID")})`);
  console.log(`🤝 Kelompok     : 5 Kelompok Proyek (Alpha, Beta, Gamma, Delta, Epsilon)`);
  console.log(`⭐ Peer Review  : Instrumen Evaluasi Sejawat Aktif & Terekam di DB`);
  console.log(`💯 Penilaian    : Nilai Guru, Feedback, & Submissions Masuk ke DB`);
  console.log("=======================================================\n");

  process.exit(0);
}

main().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
