import { db } from "../src/lib/db";
import {
  users,
  kelas,
  enrollments,
  materi,
  tugas,
  tugasSubmissions,
  ujian,
  soal,
  ujianAttempts,
  notifications,
  complaints,
} from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Menjalankan Seeding Terrawise.id LMS murni...");

  // 1. Bersihkan data lama
  await db.delete(ujianAttempts);
  await db.delete(soal);
  await db.delete(ujian);
  await db.delete(tugasSubmissions);
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

  // 4. Enrollments (Daftarkan siswa ke seluruh kelas agar tidak kosongan)
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

  // 6. Tugas Pembelajaran (6 Tugas Lengkap)
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const [tugas1] = await db
    .insert(tugas)
    .values({
      title: "Laporan Praktikum Titrasi Asam Basa dan Perhitungan pH",
      description:
        "Susun laporan praktikum titrasi larutan HCl menggunakan larutan standar NaOH 0.1 M. Cantumkan kurva titrasi, titik ekuivalen, dan perhitungan konsentrasi sampel.",
      dueDate: new Date(now + 7 * day),
      maxScore: 100,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas2] = await db
    .insert(tugas)
    .values({
      title: "Implementasi Algoritma Sorting dan Searching Menggunakan TypeScript",
      description:
        "Buat fungsi algoritma Quick Sort dan Binary Search. Sertakan analisis kompleksitas waktu (Big-O) dan pengujian dengan 10.000 data acak.",
      dueDate: new Date(now + 5 * day),
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas3] = await db
    .insert(tugas)
    .values({
      title: "Makalah Analisis Dampak Perubahan Iklim Terhadap Keanekaragaman Hayati",
      description:
        "Kaji literatur ilmiah mengenai korelasi peningkatan suhu global terhadap pola migrasi fauna lokal. Minimal 5 halaman dengan sitasi ilmiah valid.",
      dueDate: new Date(now + 6 * day),
      maxScore: 100,
      kelasId: kelasXII.id,
      authorId: guru2.id,
    })
    .returning();

  const [tugas4] = await db
    .insert(tugas)
    .values({
      title: "Desain ERD dan Skema Database Relasional Sistem Informasi Sekolah",
      description:
        "Rancang diagram relasi entitas untuk modul guru, kelas, siswa, tugas, dan nilai. Pastikan skema tabel telah memenuhi bentuk normal ketiga (3NF).",
      dueDate: new Date(now + 9 * day),
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas5] = await db
    .insert(tugas)
    .values({
      title: "Studi Kasus Hukum Kekekalan Energi Mekanik pada Lintasan Miring",
      description:
        "Hitung kecepatan teoritis benda meluncur tanpa gesekan dibandingkan hasil eksperimen fisik di laboratorium. Tuliskan analisis ralat persentase kesalahan.",
      dueDate: new Date(now + 12 * day),
      maxScore: 100,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas6] = await db
    .insert(tugas)
    .values({
      title: "Proposal Penelitian Bioteknologi Fermentasi Pangan Lokal",
      description:
        "Rancang proposal ilmiah inovasi pangan fermentasi memanfaatkan bahan baku lokal. Tuliskan latar belakang, hipotesis, dan metodologi eksperimen terinci.",
      dueDate: new Date(now + 14 * day),
      maxScore: 100,
      kelasId: kelasXII.id,
      authorId: guru2.id,
    })
    .returning();

  // 7. Pengumpulan Tugas (Submissions)
  // Siswa 1 telah mengumpulkan tugas 1 (Sudah dinilai oleh guru)
  await db.insert(tugasSubmissions).values({
    tugasId: tugas1.id,
    studentId: siswa1.id,
    answerText:
      "Titrasi dilakukan sebanyak 3 kali pengulangan (triplo). Rata-rata volume NaOH yang dibutuhkan untuk mencapai titik akhir fenolftalein adalah 18.4 mL. Konsentrasi HCl terhitung sebesar 0.092 M.",
    fileUrl: "https://drive.google.com/sample/laporan-titrasi-ahmad.pdf",
    score: 92,
    feedback: "Metodologi eksperimen sangat rapi dan perhitungan stoikiometri akurat!",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 12 * 60 * 60 * 1000),
  });

  // Siswa 2 mengumpulkan tugas 2 (Belum dinilai, siap dinilai Guru/Admin)
  await db.insert(tugasSubmissions).values({
    tugasId: tugas2.id,
    studentId: siswa2.id,
    answerText:
      "Kode program telah diuji menggunakan Node.js. Algoritma Quick Sort menunjukkan rata-rata eksekusi 4.2ms untuk 10.000 elemen, sedangkan Binary Search mampu menemukan data dalam 14 iterasi maksimal.",
    fileUrl: "https://github.com/example/ts-algorithms-sorting",
    score: null,
    feedback: null,
    submittedAt: new Date(now - 3 * 60 * 60 * 1000),
  });

  // 8. Ujian-Ujian (4 Ujian Lengkap dengan Soal Pilihan Ganda)
  // Ujian 1: UTS Sains Terapan (Ahmad Rizki sudah selesai nilai 100, Siti Nurhaliza belum)
  const [exam1] = await db
    .insert(ujian)
    .values({
      title: "Ujian Tengah Semester - Sains Terapan & Logika",
      startTime: new Date(now - 2 * 60 * 60 * 1000),
      endTime: new Date(now + 14 * day),
      durationMinutes: 60,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam1.id,
      question: "Variabel dalam eksperimen sains yang sengaja diubah-ubah oleh peneliti untuk menguji hipotesis disebut...",
      options: ["Variabel bebas (independen)", "Variabel terikat (dependen)", "Variabel kontrol", "Variabel pengganggu"],
      correctAnswer: "Variabel bebas (independen)",
      points: 25,
      order: 1,
    },
    {
      ujianId: exam1.id,
      question: "Rentang nilai pH untuk larutan yang bersifat asam kuat adalah...",
      options: ["pH 1 - 3", "pH 6 - 8", "pH 9 - 11", "pH 12 - 14"],
      correctAnswer: "pH 1 - 3",
      points: 25,
      order: 2,
    },
    {
      ujianId: exam1.id,
      question: "Kompleksitas waktu rata-rata (average time complexity) dari algoritma Binary Search adalah...",
      options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"],
      correctAnswer: "O(log n)",
      points: 25,
      order: 3,
    },
    {
      ujianId: exam1.id,
      question: "Satuan standar Sistem Internasional (SI) untuk besaran gaya adalah...",
      options: ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"],
      correctAnswer: "Newton (N)",
      points: 25,
      order: 4,
    },
  ]);

  // Attempt Ujian 1 oleh Ahmad Rizki
  await db.insert(ujianAttempts).values({
    ujianId: exam1.id,
    studentId: siswa1.id,
    answers: {
      "1": "Variabel bebas (independen)",
      "2": "pH 1 - 3",
      "3": "O(log n)",
      "4": "Newton (N)",
    },
    score: 100,
    startedAt: new Date(now - 1 * day),
    submittedAt: new Date(now - 1 * day + 32 * 60 * 1000),
  });

  // Ujian 2: Kuis Harian 01 (SEDANG AKTIF / LIVE! Belum dikerjakan, siap dikerjakan siswa!)
  const [exam2] = await db
    .insert(ujian)
    .values({
      title: "Kuis Harian 01 - Struktur Data dan Algoritma Dasar",
      startTime: new Date(now - 1 * 60 * 60 * 1000),
      endTime: new Date(now + 10 * day),
      durationMinutes: 45,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam2.id,
      question: "Prinsip operasi struktur data Stack (Tumpukan) adalah...",
      options: ["LIFO (Last In First Out)", "FIFO (First In First Out)", "LILO (Last In Last Out)", "Random Access"],
      correctAnswer: "LIFO (Last In First Out)",
      points: 20,
      order: 1,
    },
    {
      ujianId: exam2.id,
      question: "Struktur data yang beroperasi dengan prinsip antrean First In First Out (FIFO) adalah...",
      options: ["Queue", "Stack", "Binary Tree", "Heap"],
      correctAnswer: "Queue",
      points: 20,
      order: 2,
    },
    {
      ujianId: exam2.id,
      question: "Keuntungan utama menggunakan Linked List dibandingkan Array statis adalah...",
      options: [
        "Ukuran memori dinamis dan fleksibel saat penambahan elemen",
        "Akses elemen acak (random access) sangat cepat O(1)",
        "Menggunakan memori lebih sedikit tanpa pointer",
        "Elemen selalu tersimpan berurutan dalam memori fisik",
      ],
      correctAnswer: "Ukuran memori dinamis dan fleksibel saat penambahan elemen",
      points: 20,
      order: 3,
    },
    {
      ujianId: exam2.id,
      question: "Algoritma pencarian yang mengharuskan kumpulan data sudah terurut (sorted) terlebih dahulu adalah...",
      options: ["Binary Search", "Linear Search", "Breadth First Search", "Depth First Search"],
      correctAnswer: "Binary Search",
      points: 20,
      order: 4,
    },
    {
      ujianId: exam2.id,
      question: "Teknik optimasi algoritma yang menyimpan hasil sub-masalah agar tidak dihitung ulang disebut...",
      options: ["Memoization / Dynamic Programming", "Brute Force", "Greedy Algorithm", "Backtracking"],
      correctAnswer: "Memoization / Dynamic Programming",
      points: 20,
      order: 5,
    },
  ]);

  // Ujian 3: Simulasi Ujian Akhir (SEDANG AKTIF / LIVE! Belum dikerjakan!)
  const [exam3] = await db
    .insert(ujian)
    .values({
      title: "Simulasi Ujian Akhir - Keseimbangan Kimia & Termodinamika",
      startTime: new Date(now - 30 * 60 * 1000),
      endTime: new Date(now + 12 * day),
      durationMinutes: 50,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam3.id,
      question: "Menurut Asas Le Chatelier, jika tekanan pada sistem kesetimbangan gas diperbesar, maka kesetimbangan akan bergeser ke arah...",
      options: [
        "Jumlah koefisien gas yang lebih kecil",
        "Jumlah koefisien gas yang lebih besar",
        "Reaksi endoterm",
        "Tidak mengalami pergeseran sama sekali",
      ],
      correctAnswer: "Jumlah koefisien gas yang lebih kecil",
      points: 20,
      order: 1,
    },
    {
      ujianId: exam3.id,
      question: "Hukum Termodinamika Pertama pada dasarnya menyatakan prinsip...",
      options: [
        "Hukum Kekekalan Energi",
        "Peningkatan Entropi Semesta",
        "Ketiadaan Nol Mutlak",
        "Percepatan Gravitasi Universal",
      ],
      correctAnswer: "Hukum Kekekalan Energi",
      points: 20,
      order: 2,
    },
    {
      ujianId: exam3.id,
      question: "Reaksi kimia yang menyerap kalor dari lingkungan ke dalam sistem sehingga suhu lingkungan turun disebut...",
      options: ["Reaksi endoterm", "Reaksi eksoterm", "Reaksi redoks", "Reaksi pembakaran"],
      correctAnswer: "Reaksi endoterm",
      points: 20,
      order: 3,
    },
    {
      ujianId: exam3.id,
      question: "Zat yang berfungsi mempercepat laju reaksi kimia tanpa ikut terkonsumsi secara permanen adalah...",
      options: ["Katalisator", "Inhibitor", "Reaktan pembatas", "Indikator universal"],
      correctAnswer: "Katalisator",
      points: 20,
      order: 4,
    },
    {
      ujianId: exam3.id,
      question: "Nilai tetapan kesetimbangan (Kc) hanya dipengaruhi secara langsung oleh perubahan...",
      options: ["Suhu sistem", "Konsentrasi reaktan", "Tekanan total", "Volume wadah"],
      correctAnswer: "Suhu sistem",
      points: 20,
      order: 5,
    },
  ]);

  // Ujian 4: Kuis Praktikum (SEDANG AKTIF / LIVE! Belum dikerjakan!)
  const [exam4] = await db
    .insert(ujian)
    .values({
      title: "Kuis Praktikum - Genetika & Hereditas Mendel",
      startTime: new Date(now - 15 * 60 * 1000),
      endTime: new Date(now + 8 * day),
      durationMinutes: 30,
      kelasId: kelasXII.id,
      authorId: guru2.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam4.id,
      question: "Rasio fenotip persilangan monohibrid dominan penuh pada generasi F2 menurut Hukum Mendel I adalah...",
      options: ["3 : 1", "1 : 2 : 1", "9 : 3 : 3 : 1", "1 : 1"],
      correctAnswer: "3 : 1",
      points: 25,
      order: 1,
    },
    {
      ujianId: exam4.id,
      question: "Basa nitrogen penyusun molekul DNA yang berpasangan dengan Adenin melalui dua ikatan hidrogen adalah...",
      options: ["Timin", "Guanin", "Sitosin", "Urasil"],
      correctAnswer: "Timin",
      points: 25,
      order: 2,
    },
    {
      ujianId: exam4.id,
      question: "Peristiwa perubahan struktur atau urutan nukleotida pada materi genetik suatu organisme disebut...",
      options: ["Mutasi", "Transkripsi", "Translasi", "Replikasi"],
      correctAnswer: "Mutasi",
      points: 25,
      order: 3,
    },
    {
      ujianId: exam4.id,
      question: "Enzim yang berfungsi memotong pita DNA pada sekuens spesifik dalam teknologi rekayasa genetika adalah...",
      options: ["Enzim Endonuklease Restriksi", "Enzim DNA Ligase", "Enzim Amilase", "Enzim Polimerase"],
      correctAnswer: "Enzim Endonuklease Restriksi",
      points: 25,
      order: 4,
    },
  ]);

  // 9. Notifikasi Sistem
  await db.insert(notifications).values([
    {
      userId: siswa1.id,
      title: "Kuis Harian 01 Tersedia",
      message: "Dr. Budi Santoso telah menerbitkan Kuis Harian 01 untuk kelas XI MIPA 2. Silakan kerjakan sebelum tenggat.",
      isRead: false,
    },
    {
      userId: siswa1.id,
      title: "Nilai Tugas Diperbarui",
      message: "Tugas Laporan Praktikum Titrasi Anda telah dinilai dengan skor 92/100.",
      isRead: false,
    },
    {
      userId: siswa2.id,
      title: "Simulasi Ujian Akhir Siap Dikerjakan",
      message: "Simulasi Ujian Akhir Keseimbangan Kimia telah dibuka di kelas X MIPA 1.",
      isRead: false,
    },
    {
      userId: guru.id,
      title: "Pengumpulan Tugas Baru Masuk",
      message: "Siti Nurhaliza telah mengumpulkan tugas Implementasi Algoritma Sorting.",
      isRead: false,
    },
    {
      userId: admin.id,
      title: "Sistem Terrawise Beroperasi Normal",
      message: "Seluruh modul pembelajaran, tugas, dan ujian aktif terhubung ke database.",
      isRead: true,
    },
  ]);

  // 10. Tiket Keluhan & Bantuan
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

  console.log("✅ Seeding Terrawise.id LMS murni (Bebas IoT) berhasil!");
  console.log("\n--- AKUN DEMO TERRAWISE.ID (PERSIS DENGAN LARAVEL) ---");
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
