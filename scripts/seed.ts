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
  iotDevices,
  iotSensorData,
  complaints,
} from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding Terrawise.id database...");

  // Clean existing data
  await db.delete(ujianAttempts);
  await db.delete(soal);
  await db.delete(ujian);
  await db.delete(tugasSubmissions);
  await db.delete(tugas);
  await db.delete(materi);
  await db.delete(enrollments);
  await db.delete(iotSensorData);
  await db.delete(iotDevices);
  await db.delete(complaints);
  await db.delete(notifications);
  await db.delete(kelas);
  await db.delete(users);

  // 1. Users matching DEMO_ACCOUNTS.md
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

  // 2. Classes (Kelas)
  const [kelasX] = await db
    .insert(kelas)
    .values({
      name: "X IPA 1 - Pertanian Presisi & IoT",
      description: "Mata pelajaran Sains Terapan & Penerapan Sensor IoT pada Agrikultur",
      teacherId: guru.id,
    })
    .returning();

  const [kelasXI] = await db
    .insert(kelas)
    .values({
      name: "XI IPA 2 - Edge Computing & Smart Systems",
      description: "Pengembangan mikrokontroler dan telemetri data nirkabel",
      teacherId: guru.id,
    })
    .returning();

  // Enrollments
  await db.insert(enrollments).values([
    { studentId: siswa1.id, kelasId: kelasX.id },
    { studentId: siswa1.id, kelasId: kelasXI.id },
    { studentId: siswa2.id, kelasId: kelasX.id },
  ]);

  // 3. Materi Pembelajaran
  await db.insert(materi).values([
    {
      title: "Arsitektur Sensor NPK & Pengukuran Kesuburan Tanah",
      content:
        "Sensor NPK (Nitrogen, Fosfor, Kalium) menggunakan metode spektrometri atau konduktivitas optik tanah untuk mengukur kandungan unsur hara makro utama yang dibutuhkan tanaman secara real-time.",
      fileUrl: "https://example.com/materi-npk-iot.pdf",
      kelasId: kelasX.id,
      authorId: guru.id,
    },
    {
      title: "Telemetri ESP8266 & Protokol MQTT ke ThingsBoard",
      content:
        "Modul ESP8266 NodeMCU mengirim data sensor setiap 5 detik melalui WiFi lokal menggunakan protokol MQTT yang ringan dan hemat daya ke server platform Terrawise.",
      fileUrl: "https://example.com/esp8266-telemetry.pdf",
      kelasId: kelasX.id,
      authorId: guru.id,
    },
    {
      title: "Kalibrasi Sensor Kelembaban & pH Tanah",
      content:
        "Panduan langkah demi langkah dalam melakukan kalibrasi sensor analog capacitive soil moisture dan elektroda pH probe menggunakan larutan buffer standar.",
      fileUrl: "https://example.com/kalibrasi-sensor.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
  ]);

  // 4. Tugas
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [tugas1] = await db
    .insert(tugas)
    .values({
      title: "Laporan Analisis Kandungan NPK Lahan Greenhouse A",
      description:
        "Lakukan pengambilan sampel data telemetri dari perangkat sensor Terra-NPK-01 selama 24 jam. Hitung nilai rata-rata nitrogen dan berikan rekomendasi pemupukan.",
      dueDate: nextWeek,
      maxScore: 100,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas2] = await db
    .insert(tugas)
    .values({
      title: "Diagram Rangkaian Node Sensor Suhu & Kelembaban",
      description:
        "Buat skema rangkaian mikrokontroler ESP8266 yang terhubung dengan sensor DHT22 dan solar panel mini.",
      dueDate: nextWeek,
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  // Submission for tugas 1 by siswa 1
  await db.insert(tugasSubmissions).values({
    tugasId: tugas1.id,
    studentId: siswa1.id,
    answerText:
      "Data sensor tercatat stabil pada rata-rata N: 45.2 mg/kg, P: 32.1 mg/kg, K: 84.7 mg/kg. Disarankan penambahan pupuk urea 15% pada fase vegetatif.",
    score: 92,
    feedback: "Analisis sangat baik dan rekomendasi tepat sasaran!",
    gradedAt: new Date(),
  });

  // 5. Ujian
  const startTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const endTime = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const [exam1] = await db
    .insert(ujian)
    .values({
      title: "Ujian Tengah Semester - IoT & Diagnostik Tanah",
      startTime,
      endTime,
      durationMinutes: 60,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam1.id,
      question: "Unsur hara makro utama tanah yang disingkat dalam NPK adalah...",
      options: [
        "Natrium, Fosfor, Kalsium",
        "Nitrogen, Fosfor, Kalium",
        "Nitrogen, Fluorin, Karbon",
        "Nikel, Platinum, Kobalt",
      ],
      correctAnswer: "Nitrogen, Fosfor, Kalium",
      points: 25,
      order: 1,
    },
    {
      ujianId: exam1.id,
      question: "Rentang pH tanah ideal untuk sebagian besar tanaman hortikultura adalah...",
      options: ["3.0 - 4.5", "6.0 - 7.0", "8.5 - 10.0", "12.0 - 14.0"],
      correctAnswer: "6.0 - 7.0",
      points: 25,
      order: 2,
    },
    {
      ujianId: exam1.id,
      question: "Protokol transmisi data IoT yang paling hemat bandwidth dan daya untuk mikrokontroler adalah...",
      options: ["HTTP/1.1", "FTP", "MQTT", "Telnet"],
      correctAnswer: "MQTT",
      points: 25,
      order: 3,
    },
    {
      ujianId: exam1.id,
      question: "Satuan standar pengukuran Electrical Conductivity (EC) tanah adalah...",
      options: ["µS/cm (microSiemens per cm)", "Watt per meter", "Lux", "Joule"],
      correctAnswer: "µS/cm (microSiemens per cm)",
      points: 25,
      order: 4,
    },
  ]);

  // Attempt for exam 1 by siswa 1
  await db.insert(ujianAttempts).values({
    ujianId: exam1.id,
    studentId: siswa1.id,
    answers: {
      "1": "Nitrogen, Fosfor, Kalium",
      "2": "6.0 - 7.0",
      "3": "MQTT",
      "4": "µS/cm (microSiemens per cm)",
    },
    score: 100,
    submittedAt: new Date(),
  });

  // 6. IoT Devices
  const [device1] = await db
    .insert(iotDevices)
    .values({
      name: "Terra-NPK-01 (Sensor 7-in-1 Tanah)",
      deviceCode: "TW-NPK-001",
      status: "ONLINE",
      location: "Greenhouse Pertanian Presisi A",
      kelasId: kelasX.id,
    })
    .returning();

  const [device2] = await db
    .insert(iotDevices)
    .values({
      name: "Terra-Soil-02 (Node Kelembaban & pH)",
      deviceCode: "TW-SOIL-002",
      status: "ONLINE",
      location: "Lahan Percobaan Terbuka B",
      kelasId: kelasX.id,
    })
    .returning();

  const [device3] = await db
    .insert(iotDevices)
    .values({
      name: "Terra-Climate-03 (Stasiun Cuaca Edge)",
      deviceCode: "TW-ENV-003",
      status: "ONLINE",
      location: "Rooftop Laboratorium Smart Farming",
      kelasId: kelasXI.id,
    })
    .returning();

  // 7. IoT Sensor Telemetry Data
  const telemetryHistory = [
    {
      deviceId: device1.id,
      kelasId: kelasX.id,
      userId: siswa1.id,
      soilTemperature: 27.4,
      soilMoisture: 68.5,
      nitrogen: 45.2,
      phosphorus: 32.1,
      potassium: 84.7,
      ph: 6.8,
      ec: 1.45,
      measuredAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      deviceId: device1.id,
      kelasId: kelasX.id,
      userId: siswa1.id,
      soilTemperature: 27.6,
      soilMoisture: 67.8,
      nitrogen: 46.0,
      phosphorus: 31.9,
      potassium: 85.1,
      ph: 6.75,
      ec: 1.46,
      measuredAt: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      deviceId: device2.id,
      kelasId: kelasX.id,
      userId: siswa2.id,
      soilTemperature: 28.2,
      soilMoisture: 62.3,
      nitrogen: 38.5,
      phosphorus: 28.4,
      potassium: 76.2,
      ph: 6.5,
      ec: 1.32,
      measuredAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      deviceId: device3.id,
      kelasId: kelasXI.id,
      userId: guru.id,
      soilTemperature: 29.1,
      soilMoisture: 58.9,
      nitrogen: 41.0,
      phosphorus: 29.5,
      potassium: 79.8,
      ph: 6.9,
      ec: 1.38,
      measuredAt: new Date(Date.now() - 45 * 60 * 1000),
    },
  ];

  await db.insert(iotSensorData).values(telemetryHistory);

  // 8. Notifications
  await db.insert(notifications).values([
    {
      userId: siswa1.id,
      title: "Tugas Baru: Analisis Kandungan NPK",
      message: "Dr. Budi Santoso menambahkan tugas baru untuk kelas X IPA 1.",
      isRead: false,
    },
    {
      userId: siswa1.id,
      title: "Nilai Tugas Diperbarui",
      message: "Tugas Analisis NPK Anda telah dinilai dengan skor 92/100.",
      isRead: false,
    },
    {
      userId: guru.id,
      title: "Pengumpulan Tugas Baru",
      message: "Ahmad Rizki telah mengumpulkan tugas Analisis Kandungan NPK.",
      isRead: true,
    },
    {
      userId: admin.id,
      title: "Sistem Terrawise Beroperasi Normal",
      message: "3 Node IoT aktif mengirimkan telemetri ke server.",
      isRead: true,
    },
  ]);

  // 9. Complaints / Keluhan
  await db.insert(complaints).values([
    {
      userId: siswa1.id,
      title: "Sensor TW-SOIL-002 Fluktuasi Nilai pH",
      message:
        "Pada pengujian siang hari pukul 12.00, nilai pH di probe 2 melonjak dari 6.5 ke 8.1. Mohon dibantu pengecekan kalibrasi elektroda.",
      category: "IoT Hardware",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      reply:
        "Tim teknis laboratorium telah menjadwalkan kalibrasi ulang probe sensor pada hari Rabu.",
    },
  ]);

  console.log("✅ Seeding completed successfully!");
  console.log("\n--- AKUN DEMO TERRAWISE.ID (sesuai Laravel DEMO_ACCOUNTS.md) ---");
  console.log("1. Superadmin: superadmin@terrawise.id | password: superadmin123");
  console.log("2. Admin:      admin@terrawise.id      | password: admin123");
  console.log("3. Guru:       guru@terrawise.id       | password: guru123");
  console.log("4. Siswa:      siswa@terrawise.id      | password: siswa123");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
