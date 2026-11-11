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
  console.log("🌱 Menjalankan Seeding Terrawise.id LMS murni (4 Tipe Tugas & 3 Tipe Ujian)...");

  // 1. Bersihkan data lama
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

  // 2. Akun Pengguna (Sesuai Demo Credentials Laravel Terrawise)
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
      name: "Dr. Budi Santoso, M.T.",
      email: "guru@terrawise.id",
      password: guruPass,
      role: "TEACHER",
    })
    .returning();

  const [guru2] = await db
    .insert(users)
    .values({
      name: "Ir. Siti Rahmawati, M.Sc.",
      email: "guru2@terrawise.id",
      password: guruPass,
      role: "TEACHER",
    })
    .returning();

  const [siswa1] = await db
    .insert(users)
    .values({
      name: "Ahmad Rizki",
      email: "siswa@terrawise.id",
      password: siswaPass,
      role: "STUDENT",
    })
    .returning();

  const [siswa2] = await db
    .insert(users)
    .values({
      name: "Siti Nurhaliza",
      email: "siswa2@terrawise.id",
      password: siswaPass,
      role: "STUDENT",
    })
    .returning();

  // 3. Kelas Pembelajaran
  const [kelasX] = await db
    .insert(kelas)
    .values({
      name: "X MIPA 1 - Sains & Komputasi Dasar",
      description: "Pembelajaran sains terapan, logika algoritma, dan literasi digital",
      teacherId: guru.id,
    })
    .returning();

  const [kelasXI] = await db
    .insert(kelas)
    .values({
      name: "XI MIPA 2 - Rekayasa Perangkat Lunak & Logika",
      description: "Pengembangan pemikiran komputasi, algoritma pemrograman, dan basis data",
      teacherId: guru.id,
    })
    .returning();

  const [kelasXII] = await db
    .insert(kelas)
    .values({
      name: "XII MIPA 3 - Bioteknologi & Ilmu Lingkungan",
      description: "Kajian bioteknologi modern, dinamika ekosistem, dan sains lingkungan hidup",
      teacherId: guru2.id,
    })
    .returning();

  // 4. Enrollments (Daftarkan siswa ke seluruh kelas)
  await db.insert(enrollments).values([
    { studentId: siswa1.id, kelasId: kelasX.id },
    { studentId: siswa1.id, kelasId: kelasXI.id },
    { studentId: siswa1.id, kelasId: kelasXII.id },
    { studentId: siswa2.id, kelasId: kelasX.id },
    { studentId: siswa2.id, kelasId: kelasXI.id },
    { studentId: siswa2.id, kelasId: kelasXII.id },
  ]);

  // 5. Materi Pembelajaran (8 Materi Lengkap)
  await db.insert(materi).values([
    {
      title: "Pengantar Algoritma dan Struktur Data Dasar",
      content:
        "Memahami konsep efisiensi algoritma, notasi Big-O, tipe data primitif, array, serta struktur linier seperti stack dan queue dalam pemecahan masalah komputasi.",
      fileUrl: "https://example.com/modul-algoritma-dasar.pdf",
      kelasId: kelasX.id,
      authorId: guru.id,
    },
    {
      title: "Metode Ilmiah dan Perancangan Eksperimen Sains",
      content:
        "Langkah-langkah sistematis penelitian: identifikasi variabel bebas, terikat, dan kontrol, serta teknik pengumpulan data terukur yang valid.",
      fileUrl: "https://example.com/metode-ilmiah-sains.pdf",
      kelasId: kelasX.id,
      authorId: guru.id,
    },
    {
      title: "Konsep Dasar Kimia Larutan dan Keseimbangan Asam-Basa",
      content:
        "Teori Arrhenius, Bronsted-Lowry, dan Lewis tentang reaksi asam-basa, perhitungan derajat keasaman (pH/pOH), serta prinsip larutan penyangga (buffer).",
      fileUrl: "https://example.com/asam-basa-larutan.pdf",
      kelasId: kelasX.id,
      authorId: guru.id,
    },
    {
      title: "Sistem Basis Data Relasional dan Normalisasi Data",
      content:
        "Prinsip desain database relational: Entity Relationship Diagram (ERD), kunci primer (primary key), foreign key, dan tahapan normalisasi 1NF hingga 3NF.",
      fileUrl: "https://example.com/database-normalisasi.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Pemrograman Berorientasi Objek (OOP) & Clean Code",
      content:
        "Empat pilar OOP: Enkapsulasi, Abstraksi, Pewarisan (Inheritance), dan Polimorfisme, disertai best practice penulisan kode modular yang mudah diuji.",
      fileUrl: "https://example.com/oop-clean-code.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Bioteknologi Fermentasi & Rekayasa Pangan Tradisional",
      content:
        "Peran mikroorganisme (ragi Saccharomyces, bakteri Lactobacillus) dalam proses fermentasi pangan bernilai gizi tinggi dan teknik kontrol sterilisasi.",
      fileUrl: "https://example.com/bioteknologi-fermentasi.pdf",
      kelasId: kelasXII.id,
      authorId: guru2.id,
    },
    {
      title: "Dinamika Ekosistem dan Siklus Biogeokimia Lingkungan",
      content:
        "Aliran energi trofik pada jaring makanan, siklus nitrogen, fosfor, karbon, serta evaluasi dampak pencemaran terhadap daya dukung lingkungan hidup.",
      fileUrl: "https://example.com/ekosistem-biogeokimia.pdf",
      kelasId: kelasXII.id,
      authorId: guru2.id,
    },
    {
      title: "Etika Akademik dan Metodologi Penulisan Karya Ilmiah",
      content:
        "Panduan sitasi baku (APA Style), teknik parafrase untuk menghindari plagiarisme, serta tata cara penyusunan abstrak dan bab kesimpulan laporan penelitian.",
      fileUrl: "https://example.com/penulisan-karya-ilmiah.pdf",
      kelasId: kelasXII.id,
      authorId: guru2.id,
    },
  ]);

  // 6. Tugas Pembelajaran (Lengkap 4 TIPE TUGAS)
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // TIPE 1: Pilihan Ganda (MULTIPLE_CHOICE)
  const [tugasPG] = await db
    .insert(tugas)
    .values({
      title: "Kuis Pilihan Ganda: Logika Algoritma & Tipe Data",
      description:
        "Uji pemahaman mandiri materi logika komputasi dan struktur kontrol percabangan. Pilihlah opsi jawaban yang paling tepat. Nilai akan terhitung otomatis.",
      tipe: "MULTIPLE_CHOICE",
      dueDate: new Date(now + 7 * day),
      maxScore: 100,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  const [tugasPGSoal1, tugasPGSoal2, tugasPGSoal3, tugasPGSoal4] = await db
    .insert(tugasSoal)
    .values([
      {
        tugasId: tugasPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Manakah di bawah ini yang merupakan tipe data bilangan bulat pada sebagian besar bahasa pemrograman?",
        options: ["Integer", "Float", "Boolean", "String"],
        correctAnswer: "A",
        points: 25,
        order: 1,
      },
      {
        tugasId: tugasPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Simbol flowchart yang digunakan untuk menyatakan kondisi keputusan (decision) adalah...",
        options: ["Belah Ketupat (Diamond)", "Persegi Panjang", "Oval / Elips", "Jajar Genjang"],
        correctAnswer: "A",
        points: 25,
        order: 2,
      },
      {
        tugasId: tugasPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Operasi logika yang menghasilkan nilai TRUE jika hanya salah satu operand bernilai TRUE adalah...",
        options: ["XOR", "AND", "OR", "NOT"],
        correctAnswer: "A",
        points: 25,
        order: 3,
      },
      {
        tugasId: tugasPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Struktur perulangan yang pasti dijalankan minimal satu kali sebelum pengecekan kondisi adalah...",
        options: ["do-while", "for", "while", "foreach"],
        correctAnswer: "A",
        points: 25,
        order: 4,
      },
    ])
    .returning();

  // Submission untuk Tugas PG (Siswa 1 sudah mengerjakan dengan auto-grade 100)
  await db.insert(tugasSubmissions).values({
    tugasId: tugasPG.id,
    studentId: siswa1.id,
    answers: {
      [tugasPGSoal1.id]: "A",
      [tugasPGSoal2.id]: "A",
      [tugasPGSoal3.id]: "A",
      [tugasPGSoal4.id]: "A",
    },
    score: 100,
    feedback: "Sangat baik! Seluruh jawaban kuis pilihan ganda benar.",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 1 * day),
  });

  // TIPE 2: Essay (ESSAY)
  const [tugasEssay] = await db
    .insert(tugas)
    .values({
      title: "Tugas Soal Essay: Analisis Arsitektur OOP & Normalisasi Database",
      description:
        "Jawab pertanyaan essay berikut dengan argumentasi teknis, contoh kode atau skema relevan. Jawaban akan dinilai langsung oleh guru pengampu.",
      tipe: "ESSAY",
      dueDate: new Date(now + 8 * day),
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const [tugasEssaySoal1, tugasEssaySoal2, tugasEssaySoal3] = await db
    .insert(tugasSoal)
    .values([
      {
        tugasId: tugasEssay.id,
        type: "ESSAY",
        question: "Jelaskan konsep Polymorphism dalam OOP dan berikan studi kasus penggunaannya dalam sistem perbankan!",
        points: 35,
        order: 1,
      },
      {
        tugasId: tugasEssay.id,
        type: "ESSAY",
        question: "Apa perbedaan mendasar antara First Normal Form (1NF) dan Second Normal Form (2NF)?",
        points: 35,
        order: 2,
      },
      {
        tugasId: tugasEssay.id,
        type: "ESSAY",
        question: "Mengapa dependensi transitif harus dihilangkan pada Third Normal Form (3NF)? Berikan dampaknya terhadap integritas data!",
        points: 30,
        order: 3,
      },
    ])
    .returning();

  // Submission Tugas Essay (Siswa 2 sudah mengumpulkan, sudah dinilai guru)
  await db.insert(tugasSubmissions).values({
    tugasId: tugasEssay.id,
    studentId: siswa2.id,
    answers: {
      [tugasEssaySoal1.id]:
        "Polymorphism memungkinkan satu interface merepresentasikan aksi yang berbeda. Contoh perbankan: class Rekening memiliki method hitungBunga() yang di-override oleh RekeningTabungan, RekeningGiro, dan Deposito.",
      [tugasEssaySoal2.id]:
        "1NF mensyaratkan setiap kolom bernilai atomik. 2NF mensyaratkan telah memenuhi 1NF dan tidak ada dependensi parsial terhadap primary key komposit.",
      [tugasEssaySoal3.id]:
        "Dependensi transitif menyebabkan anomali update dan redundansi data. Dengan 3NF, setiap atribut non-kunci hanya bergantung langsung pada primary key.",
    },
    answerText: "Jawaban essay lengkap telah dicantumkan per pertanyaan.",
    score: 95,
    feedback: "Penjelasan mengenai dependensi fungsional dan contoh perbankan sangat komprehensif!",
    submittedAt: new Date(now - 12 * 60 * 60 * 1000),
    gradedAt: new Date(now - 2 * 60 * 60 * 1000),
  });

  // TIPE 3: Mandiri (MANDIRI)
  const [tugasMandiri] = await db
    .insert(tugas)
    .values({
      title: "Tugas Mandiri: Laporan Praktikum Titrasi Asam Basa & Kimia Larutan",
      description:
        "Susun laporan praktikum titrasi larutan HCl menggunakan larutan standar NaOH 0.1 M. Cantumkan kurva titrasi, titik ekuivalen, dan perhitungan konsentrasi sampel. Pengumpulan berupa uraian ringkasan dan tautan PDF laporan.",
      tipe: "MANDIRI",
      dueDate: new Date(now + 6 * day),
      maxScore: 100,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  // Submission Tugas Mandiri oleh Siswa 1
  await db.insert(tugasSubmissions).values({
    tugasId: tugasMandiri.id,
    studentId: siswa1.id,
    answerText:
      "Titrasi dilakukan sebanyak 3 kali pengulangan (triplo). Rata-rata volume NaOH yang dibutuhkan untuk mencapai titik akhir fenolftalein adalah 18.4 mL. Konsentrasi HCl terhitung sebesar 0.092 M.",
    fileUrl: "https://drive.google.com/sample/laporan-titrasi-ahmad.pdf",
    score: 92,
    feedback: "Metodologi eksperimen sangat rapi dan perhitungan stoikiometri akurat!",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 12 * 60 * 60 * 1000),
  });

  // TIPE 4: Kelompok (KELOMPOK)
  const [tugasKelompok] = await db
    .insert(tugas)
    .values({
      title: "Proyek Kelompok: Riset Rekayasa Bioteknologi & Pangan Berkelanjutan",
      description:
        "Bentuk kelompok beranggotakan 2-4 siswa. Buat proposal karya ilmiah inovasi produk fermentasi pangan lokal berdaya saing tinggi. Cantumkan nama kelompok, daftar anggota, dan link repository/dokumen.",
      tipe: "KELOMPOK",
      dueDate: new Date(now + 14 * day),
      maxScore: 100,
      kelasId: kelasXII.id,
      authorId: guru2.id,
    })
    .returning();

  // Submission Tugas Kelompok oleh Siswa 1 & Siswa 2
  await db.insert(tugasSubmissions).values({
    tugasId: tugasKelompok.id,
    studentId: siswa1.id,
    groupName: "Kelompok Alpha - BioSains",
    groupMembers: "1. Ahmad Rizki (Ketua), 2. Siti Nurhaliza (Peneliti), 3. Budi Setiawan (Dokumentasi)",
    answerText:
      "Kelompok kami meneliti optimasi fermentasi tempe gembus menggunakan inokulum Rhizopus oligosporus terkontrol untuk meningkatkan profil asam amino esensial.",
    fileUrl: "https://github.com/terrawise-bio/proposal-bioteknologi-alpha",
    score: null, // Belum dinilai guru (siap dinilai!)
    feedback: null,
    submittedAt: new Date(now - 4 * 60 * 60 * 1000),
  });

  // Tugas Mandiri Tambahan
  await db.insert(tugas).values({
    title: "Tugas Mandiri: Implementasi Algoritma Sorting Menggunakan TypeScript",
    description:
      "Buat implementasi Quick Sort dan Merge Sort. Tuliskan analisis efisiensi waktu eksekusi terhadap 5.000 elemen data acak.",
    tipe: "MANDIRI",
    dueDate: new Date(now + 10 * day),
    maxScore: 100,
    kelasId: kelasXI.id,
    authorId: guru.id,
  });

  // 7. UJIAN-UJIAN (Lengkap 3 TIPE UJIAN)
  // UJIAN TIPE 1: Pilihan Ganda (MULTIPLE_CHOICE)
  const [examPG] = await db
    .insert(ujian)
    .values({
      title: "UTS Pilihan Ganda - Sains Terapan & Logika Komputasi",
      tipe: "MULTIPLE_CHOICE",
      startTime: new Date(now - 2 * 60 * 60 * 1000),
      endTime: new Date(now + 14 * day),
      durationMinutes: 60,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  const [examPGSoal1, examPGSoal2, examPGSoal3, examPGSoal4] = await db
    .insert(soal)
    .values([
      {
        ujianId: examPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Variabel dalam eksperimen sains yang sengaja diubah-ubah oleh peneliti untuk menguji hipotesis disebut...",
        options: ["Variabel bebas (independen)", "Variabel terikat (dependen)", "Variabel kontrol", "Variabel pengganggu"],
        correctAnswer: "A",
        points: 25,
        order: 1,
      },
      {
        ujianId: examPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Rentang nilai pH untuk larutan yang bersifat asam kuat adalah...",
        options: ["pH 1 - 3", "pH 6 - 8", "pH 9 - 11", "pH 12 - 14"],
        correctAnswer: "A",
        points: 25,
        order: 2,
      },
      {
        ujianId: examPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Kompleksitas waktu rata-rata (average time complexity) dari algoritma Binary Search adalah...",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
        correctAnswer: "A",
        points: 25,
        order: 3,
      },
      {
        ujianId: examPG.id,
        type: "MULTIPLE_CHOICE",
        question: "Satuan standar Sistem Internasional (SI) untuk besaran gaya adalah...",
        options: ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"],
        correctAnswer: "A",
        points: 25,
        order: 4,
      },
    ])
    .returning();

  // Attempt Ujian PG oleh Ahmad Rizki
  await db.insert(ujianAttempts).values({
    ujianId: examPG.id,
    studentId: siswa1.id,
    answers: {
      [examPGSoal1.id]: "A",
      [examPGSoal2.id]: "A",
      [examPGSoal3.id]: "A",
      [examPGSoal4.id]: "A",
    },
    score: 100,
    startedAt: new Date(now - 1 * day),
    submittedAt: new Date(now - 1 * day + 32 * 60 * 1000),
  });

  // UJIAN TIPE 2: Essay (ESSAY)
  const [examEssay] = await db
    .insert(ujian)
    .values({
      title: "Ujian Essay Teori - Rekayasa Algoritma & Perancangan Basis Data",
      tipe: "ESSAY",
      startTime: new Date(now - 1 * 60 * 60 * 1000),
      endTime: new Date(now + 10 * day),
      durationMinutes: 75,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: examEssay.id,
      type: "ESSAY",
      question: "Bandingkan kelebihan dan kekurangan antara struktur data Stack dan Queue dalam implementasi sistem antrean server!",
      rubric: "Kesesuaian prinsip LIFO/FIFO (15 poin), contoh kasus sistem server (15 poin), efisiensi memori (10 poin).",
      points: 40,
      order: 1,
    },
    {
      ujianId: examEssay.id,
      type: "ESSAY",
      question: "Jelaskan langkah demi langkah proses penyeimbangan pohon biner (AVL Tree Rotation) ketika terjadi ketidakseimbangan faktor!",
      rubric: "Ketepatan penjelasan Single Rotation vs Double Rotation (20 poin), ilustrasi skematis (10 poin).",
      points: 30,
      order: 2,
    },
    {
      ujianId: examEssay.id,
      type: "ESSAY",
      question: "Mengapa transaksi database harus mematuhi prinsip ACID? Jelaskan risiko jika sifat 'Isolation' dilanggar!",
      rubric: "Uraian 4 komponen ACID (15 poin), penjelasan dirty read / race condition (15 poin).",
      points: 30,
      order: 3,
    },
  ]);

  // UJIAN TIPE 3: Campuran (MIXED: PG + Essay)
  const [examMixed] = await db
    .insert(ujian)
    .values({
      title: "Ujian Komprehensif (Campuran PG & Essay) - Keseimbangan Kimia & Termodinamika",
      tipe: "MIXED",
      startTime: new Date(now - 30 * 60 * 1000),
      endTime: new Date(now + 12 * day),
      durationMinutes: 90,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    // Bagian Pilihan Ganda
    {
      ujianId: examMixed.id,
      type: "MULTIPLE_CHOICE",
      question: "Menurut Asas Le Chatelier, jika tekanan pada sistem kesetimbangan gas diperbesar, maka kesetimbangan akan bergeser ke arah...",
      options: [
        "Jumlah koefisien gas yang lebih kecil",
        "Jumlah koefisien gas yang lebih besar",
        "Reaksi endoterm",
        "Tidak mengalami pergeseran sama sekali",
      ],
      correctAnswer: "A",
      points: 20,
      order: 1,
    },
    {
      ujianId: examMixed.id,
      type: "MULTIPLE_CHOICE",
      question: "Hukum Termodinamika Pertama pada dasarnya menyatakan prinsip...",
      options: [
        "Hukum Kekekalan Energi",
        "Peningkatan Entropi Semesta",
        "Ketiadaan Nol Mutlak",
        "Percepatan Gravitasi Universal",
      ],
      correctAnswer: "A",
      points: 20,
      order: 2,
    },
    {
      ujianId: examMixed.id,
      type: "MULTIPLE_CHOICE",
      question: "Zat yang berfungsi mempercepat laju reaksi kimia tanpa ikut terkonsumsi permanen adalah...",
      options: ["Katalisator", "Inhibitor", "Reaktan pembatas", "Indikator universal"],
      correctAnswer: "A",
      points: 20,
      order: 3,
    },
    // Bagian Essay
    {
      ujianId: examMixed.id,
      type: "ESSAY",
      question: "Hitung perubahan entalpi pembentukan standar (ΔHf°) dan jelaskan diagram energi reaksi endoterm berikut!",
      rubric: "Rumus hukum Hess (10 poin), perhitungan angka benar (10 poin).",
      points: 20,
      order: 4,
    },
    {
      ujianId: examMixed.id,
      type: "ESSAY",
      question: "Uraikan penerapan prinsip kesetimbangan kimia dalam proses Haber-Bosch untuk sintesis amonia industri!",
      rubric: "Kondisi suhu kompromi (10 poin), pengaruh katalis besi (10 poin).",
      points: 20,
      order: 5,
    },
  ]);

  // 8. Notifikasi Sistem
  await db.insert(notifications).values([
    {
      userId: siswa1.id,
      title: "Tugas Baru: Kuis Pilihan Ganda",
      message: "Dr. Budi Santoso telah menambahkan Kuis Pilihan Ganda untuk kelas X MIPA 1.",
      isRead: false,
    },
    {
      userId: siswa1.id,
      title: "Nilai Tugas Diperbarui",
      message: "Kuis Pilihan Ganda Anda telah dinilai otomatis dengan skor 100/100.",
      isRead: false,
    },
    {
      userId: siswa2.id,
      title: "Ujian Campuran Siap Dikerjakan",
      message: "Ujian Komprehensif (Campuran PG & Essay) telah dibuka di kelas X MIPA 1.",
      isRead: false,
    },
    {
      userId: guru.id,
      title: "Pengumpulan Tugas Masuk",
      message: "Kelompok Alpha - BioSains telah mengumpulkan proposal tugas kelompok.",
      isRead: false,
    },
    {
      userId: admin.id,
      title: "Sistem Terrawise Beroperasi Penuh",
      message: "4 Tipe Tugas dan 3 Tipe Ujian telah aktif dan terkonfigurasi pada basis data.",
      isRead: true,
    },
  ]);

  // 9. Tiket Keluhan & Bantuan
  await db.insert(complaints).values([
    {
      userId: siswa1.id,
      title: "Kendala Mengunggah Lampiran Tugas Format PDF",
      message:
        "Saat mencoba mengunggah dokumen PDF ukuran 3 MB, proses upload memakan waktu lebih dari 2 menit. Mohon informasi batasan ukuran file.",
      category: "Tugas & Ujian",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      reply:
        "Batas ukuran upload file telah dioptimalkan hingga 10 MB per dokumen. Silakan coba kembali mengunggah berkas Anda.",
    },
  ]);

  console.log("✅ Seeding Terrawise.id LMS murni (4 Tipe Tugas & 3 Tipe Ujian) BERHASIL!");
  console.log("\n--- AKUN DEMO TERRAWISE.ID ---");
  console.log("👑 Super Admin : superadmin@terrawise.id | password: superadmin123");
  console.log("⚙️ Admin       : admin@terrawise.id      | password: admin123");
  console.log("👨‍🏫 Guru        : guru@terrawise.id       | password: guru123");
  console.log("🎓 Siswa 1     : siswa@terrawise.id      | password: siswa123");
  console.log("🎓 Siswa 2     : siswa2@terrawise.id     | password: siswa123");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
