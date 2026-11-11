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
  iotDevices,
  iotSensorData,
  notifications,
  complaints,
} from "../src/lib/db/schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Menjalankan Seeding Terrawise.id LMS & IoT...");

  // 1. Bersihkan data lama
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

  // 2. Akun Pengguna (Sesuai Demo Credentials)
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
      name: "X IPA 1 - Pertanian Presisi & IoT",
      description: "Mata pelajaran Sains Terapan & Penerapan Sensor IoT pada Agrikultur",
      teacherId: guru.id,
    })
    .returning();

  const [kelasXI] = await db
    .insert(kelas)
    .values({
      name: "XI IPA 2 - Edge Computing & Smart Systems",
      description: "Pengembangan mikrokontroler ESP32/ESP8266 dan telemetri data nirkabel",
      teacherId: guru.id,
    })
    .returning();

  const [kelasXII] = await db
    .insert(kelas)
    .values({
      name: "XII Agrikultur Modern - Diagnostik NPK & pH Tanah",
      description: "Riset analisis unsur hara tanah makro dan otomatisasi nutrisi fertigasi",
      teacherId: guru2.id,
    })
    .returning();

  // 4. Enrollments (Daftarkan semua siswa ke seluruh kelas agar tidak kosongan!)
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
      title: "Kalibrasi Sensor Kelembaban Kapasitif & pH Elektroda",
      content:
        "Panduan langkah demi langkah dalam melakukan kalibrasi sensor analog capacitive soil moisture dan elektroda pH probe menggunakan larutan buffer standar pH 4.01 dan pH 6.86.",
      fileUrl: "https://example.com/kalibrasi-sensor.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Pengenalan Salinitas & Konduktivitas Elektrik (EC) Tanah",
      content:
        "Konduktivitas elektrik (EC) mencerminkan konsentrasi garam terlarut dalam larutan tanah. Nilai EC berlebih dapat merusak akar tanaman akibat tekanan osmotik balik.",
      fileUrl: "https://example.com/ec-salinitas-tanah.pdf",
      kelasId: kelasXII.id,
      authorId: guru2.id,
    },
    {
      title: "Sistem Fertigasi Otomatis dengan Solenoid Valve & Relay",
      content:
        "Otomatisasi pengairan pupuk cair (fertigasi) berbasis ambang batas kelembaban tanah dan EC tanah menggunakan aktuator solenoid valve bertegangan 12V DC.",
      fileUrl: "https://example.com/fertigasi-otomatis.pdf",
      kelasId: kelasXII.id,
      authorId: guru2.id,
    },
    {
      title: "Pengolahan Citra Spektral NDVI Tanaman Menggunakan Drone",
      content:
        "Indeks Vegetasi Selisih Ternormalisasi (NDVI) menghitung rasio pantulan cahaya inframerah dekat (NIR) dan merah tampak untuk memetakan kesehatan kanopi klorofil.",
      fileUrl: "https://example.com/ndvi-drone-mapping.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Arsitektur Edge Computing & Offline-First Sensor Node",
      content:
        "Strategi penyimpanan lokal di mikrokontroler menggunakan SPI Flash / MicroSD saat koneksi WiFi putus, lalu sinkronisasi otomatis ketika jaringan pulih.",
      fileUrl: "https://example.com/edge-computing-offline.pdf",
      kelasId: kelasXI.id,
      authorId: guru.id,
    },
    {
      title: "Manajemen Kualitas Tanah untuk Pertanian Berkelanjutan",
      content:
        "Strategi remediasi tanah asam dan tanah basa menggunakan kapur pertanian (dolomit) atau bahan organik guna mempertahankan kestabilan pH mikroorganisme.",
      fileUrl: "https://example.com/tanah-berkelanjutan.pdf",
      kelasId: kelasX.id,
      authorId: guru.id,
    },
  ]);

  // 6. Tugas-Tugas Pembelajaran (6 Tugas Lengkap)
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const [tugas1] = await db
    .insert(tugas)
    .values({
      title: "Laporan Analisis Kandungan NPK Lahan Greenhouse A",
      description:
        "Lakukan pengambilan sampel data telemetri dari perangkat sensor Terra-NPK-01 selama 24 jam. Hitung nilai rata-rata nitrogen dan berikan rekomendasi pemupukan.",
      dueDate: new Date(now + 7 * day),
      maxScore: 100,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas2] = await db
    .insert(tugas)
    .values({
      title: "Diagram Rangkaian Node Sensor Suhu & Kelembaban ESP8266",
      description:
        "Buat skema rangkaian mikrokontroler ESP8266 yang terhubung dengan sensor DHT22, probe kapasitif, dan solar panel mini pengisi daya baterai Li-Ion 18650.",
      dueDate: new Date(now + 5 * day),
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas3] = await db
    .insert(tugas)
    .values({
      title: "Studi Komparasi Sensor EC Tanah Analog vs Digital RS485",
      description:
        "Bandingkan akurasi pembacaan sinyal tegangan analog dengan sensor standar industri RS485 Modbus RTU pada kondisi salinitas pupuk 1.2 mS/cm hingga 2.5 mS/cm.",
      dueDate: new Date(now + 6 * day),
      maxScore: 100,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas4] = await db
    .insert(tugas)
    .values({
      title: "Perancangan Jadwal Fertigasi Otomatis Berdasarkan pH Tanah",
      description:
        "Buat algoritma logika (flowchart atau pseudocode) yang mengatur kapan pompa nutrisi A dan nutrisi B harus menyala saat pH tanah berada di bawah ambang batas 5.8.",
      dueDate: new Date(now + 9 * day),
      maxScore: 100,
      kelasId: kelasXII.id,
      authorId: guru2.id,
    })
    .returning();

  const [tugas5] = await db
    .insert(tugas)
    .values({
      title: "Analisis Anomali Suhu Ruang Inkubator Bibit Tanaman",
      description:
        "Unduh riwayat data sensor suhu dari stasiun cuaca edge TW-ENV-003, lalu identifikasi jam-jam terjadinya lonjakan panas di atas 34°C.",
      dueDate: new Date(now + 12 * day),
      maxScore: 100,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  const [tugas6] = await db
    .insert(tugas)
    .values({
      title: "Laporan Akhir Praktikum Kalibrasi Probe Sensor 7-in-1",
      description:
        "Susun laporan praktikum lengkap berisi tabel regresi linier sebelum dan sesudah kalibrasi elektroda kaca serta perhitungan ralat pengukuran standar.",
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
      "Data sensor tercatat stabil pada rata-rata N: 45.2 mg/kg, P: 32.1 mg/kg, K: 84.7 mg/kg. Disarankan penambahan pupuk urea 15% pada fase vegetatif tanaman selada.",
    fileUrl: "https://drive.google.com/sample/laporan-npk-ahmad.pdf",
    score: 92,
    feedback: "Analisis data telemetri sangat komprehensif dan interpretasi agronomisnya tepat sasaran!",
    submittedAt: new Date(now - 1 * day),
    gradedAt: new Date(now - 12 * 60 * 60 * 1000),
  });

  // Siswa 2 mengumpulkan tugas 2 (Belum dinilai, siap untuk dinilai oleh Guru/Admin!)
  await db.insert(tugasSubmissions).values({
    tugasId: tugas2.id,
    studentId: siswa2.id,
    answerText:
      "Skema rangkaian dirancang menggunakan Fritzing. Pin data DHT22 terhubung ke GPIO4 (D2) dengan resistor pull-up 4.7k ohm, sensor soil moisture kapasitif ke pin ADC A0 melalui voltage divider 3.3V.",
    fileUrl: "https://github.com/example/esp8266-soil-schematic",
    score: null,
    feedback: null,
    submittedAt: new Date(now - 4 * 60 * 60 * 1000),
  });

  // 8. Ujian-Ujian (4 Ujian Lengkap dengan Soal Pilihan Ganda)
  // Ujian 1: UTS IoT Tanah (Ahmad Rizki sudah selesai nilai 100, Siti Nurhaliza belum)
  const [exam1] = await db
    .insert(ujian)
    .values({
      title: "Ujian Tengah Semester - IoT & Diagnostik Tanah",
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

  // Attempt Ujian 1 oleh Ahmad Rizki
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
    startedAt: new Date(now - 1 * day),
    submittedAt: new Date(now - 1 * day + 35 * 60 * 1000),
  });

  // Ujian 2: Kuis Harian 01 (SEDANG AKTIF / LIVE! Belum dikerjakan oleh siapapun, siap dikerjakan!)
  const [exam2] = await db
    .insert(ujian)
    .values({
      title: "Kuis Harian 01 - Pengenalan Sensor NPK dan pH Elektroda",
      startTime: new Date(now - 1 * 60 * 60 * 1000),
      endTime: new Date(now + 10 * day),
      durationMinutes: 45,
      kelasId: kelasX.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam2.id,
      question: "Unsur kimia tanah yang berfungsi utama mempercepat pertumbuhan vegetatif daun dan batang tanaman adalah...",
      options: ["Nitrogen (N)", "Kalium (K)", "Kalsium (Ca)", "Belerang (S)"],
      correctAnswer: "Nitrogen (N)",
      points: 20,
      order: 1,
    },
    {
      ujianId: exam2.id,
      question: "Prinsip kerja elektroda kaca pada sensor probe pH didasarkan pada pengukuran...",
      options: [
        "Potensiometrik perbedaan potensial ion H+ membran",
        "Resonansi frekuensi gelombang ultrasonik",
        "Penyerapan spektrum inframerah dekat",
        "Resistansi konduktivitas arus bolak-balik",
      ],
      correctAnswer: "Potensiometrik perbedaan potensial ion H+ membran",
      points: 20,
      order: 2,
    },
    {
      ujianId: exam2.id,
      question: "Larutan buffer standar yang lazim digunakan untuk kalibrasi titik asam probe sensor pH adalah...",
      options: ["Buffer pH 4.01", "Buffer pH 9.18", "Air suling murni pH 5.00", "Larutan NaCl 10%"],
      correctAnswer: "Buffer pH 4.01",
      points: 20,
      order: 3,
    },
    {
      ujianId: exam2.id,
      question: "Gejala menguning pada tepi daun tua tanaman (daun terbakar) umumnya mengindikasikan defisiensi hara...",
      options: ["Kalium (K)", "Nitrogen (N)", "Boron (B)", "Magnesium (Mg)"],
      correctAnswer: "Kalium (K)",
      points: 20,
      order: 4,
    },
    {
      ujianId: exam2.id,
      question: "Sensor probe tanah 7-in-1 industri umumnya berkomunikasi dengan mikrokontroler menggunakan protokol fisik...",
      options: ["RS485 Modbus RTU", "I2C 100kHz", "Serial SPI 10MHz", "Bluetooth Low Energy"],
      correctAnswer: "RS485 Modbus RTU",
      points: 20,
      order: 5,
    },
  ]);

  // Ujian 3: Simulasi Ujian Akhir Edge Computing (SEDANG AKTIF / LIVE! Belum dikerjakan!)
  const [exam3] = await db
    .insert(ujian)
    .values({
      title: "Simulasi Ujian Akhir - Arsitektur Edge Computing & MQTT",
      startTime: new Date(now - 30 * 60 * 1000),
      endTime: new Date(now + 12 * day),
      durationMinutes: 50,
      kelasId: kelasXI.id,
      authorId: guru.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam3.id,
      question: "Struktur topik pesan (topic) pada broker MQTT dirancang menggunakan pemisah karakter...",
      options: ["Garis miring (/) cth: sensor/greenhouse/suhu", "Titik dua (:) cth: sensor:greenhouse", "Koma (,) cth: sensor,data", "Titik (.) cth: sensor.data"],
      correctAnswer: "Garis miring (/) cth: sensor/greenhouse/suhu",
      points: 20,
      order: 1,
    },
    {
      ujianId: exam3.id,
      question: "Keuntungan utama pemrosesan Edge Computing di dekat probe sensor mikrokontroler adalah...",
      options: [
        "Memfilter data anomali dan tetap berjalan saat internet down",
        "Menghilangkan kebutuhan baterai perangkat",
        "Meningkatkan resolusi kamera ponsel",
        "Mempercepat pertumbuhan mikroba tanah",
      ],
      correctAnswer: "Memfilter data anomali dan tetap berjalan saat internet down",
      points: 20,
      order: 2,
    },
    {
      ujianId: exam3.id,
      question: "Port standar default yang digunakan broker MQTT tanpa enkripsi SSL adalah...",
      options: ["1883", "80", "443", "8080"],
      correctAnswer: "1883",
      points: 20,
      order: 3,
    },
    {
      ujianId: exam3.id,
      question: "Komponen mikrokontroler yang berfungsi menerjemahkan sinyal tegangan analog sensor ke angka digital adalah...",
      options: ["ADC (Analog-to-Digital Converter)", "PWM (Pulse Width Modulation)", "DAC (Digital-to-Analog)", "RTC (Real Time Clock)"],
      correctAnswer: "ADC (Analog-to-Digital Converter)",
      points: 20,
      order: 4,
    },
    {
      ujianId: exam3.id,
      question: "Tingkat QoS 1 pada protokol MQTT menjamin bahwa pesan yang dikirimkan...",
      options: [
        "Terkirim setidaknya satu kali (At least once)",
        "Terkirim maksimal satu kali (At most once)",
        "Terkirim tepat satu kali tanpa duplikasi (Exactly once)",
        "Tidak dijamin sampai sama sekali",
      ],
      correctAnswer: "Terkirim setidaknya satu kali (At least once)",
      points: 20,
      order: 5,
    },
  ]);

  // Ujian 4: Kuis Praktikum Kalibrasi & Salinitas (SEDANG AKTIF / LIVE! Belum dikerjakan!)
  const [exam4] = await db
    .insert(ujian)
    .values({
      title: "Kuis Praktikum - Kalibrasi Sensor Analog & Salinitas EC",
      startTime: new Date(now - 10 * 60 * 1000),
      endTime: new Date(now + 8 * day),
      durationMinutes: 30,
      kelasId: kelasXII.id,
      authorId: guru2.id,
    })
    .returning();

  await db.insert(soal).values([
    {
      ujianId: exam4.id,
      question: "Satuan 1 mS/cm (milliSiemens per cm) pada pengukuran EC tanah setara dengan...",
      options: ["1000 µS/cm", "100 µS/cm", "10 µS/cm", "10000 µS/cm"],
      correctAnswer: "1000 µS/cm",
      points: 25,
      order: 1,
    },
    {
      ujianId: exam4.id,
      question: "Mengapa sensor kelembaban kapasitif lebih tahan lama dibandingkan sensor tipe resistif kuningan?",
      options: [
        "Jalur tembaga dilapisi bahan isolasi sehingga mencegah korosi elektrolisis",
        "Membutuhkan tegangan tinggi 220V",
        "Menghasilkan gelombang radio khusus",
        "Tidak memerlukan sambungan ground",
      ],
      correctAnswer: "Jalur tembaga dilapisi bahan isolasi sehingga mencegah korosi elektrolisis",
      points: 25,
      order: 2,
    },
    {
      ujianId: exam4.id,
      question: "Tingginya nilai EC pada media tanam mengindikasikan tingginya konsentrasi...",
      options: [
        "Garam dan ion pupuk terlarut dalam larutan tanah",
        "Oksigen terlarut dalam rongga pori tanah",
        "Keasaman gas karbon monoksida",
        "Partikel pasir kuarsa tanah",
      ],
      correctAnswer: "Garam dan ion pupuk terlarut dalam larutan tanah",
      points: 25,
      order: 3,
    },
    {
      ujianId: exam4.id,
      question: "Tindakan agronomis cepat saat sensor mendeteksi pH tanah turun di bawah 5.0 (terlalu asam) adalah pemberian...",
      options: ["Kapur pertanian (Dolomit / CaCO3)", "Belerang murni (Sulfur)", "Pupuk Ammonium Sulfat berlebih", "Air asin berkadar garam tinggi"],
      correctAnswer: "Kapur pertanian (Dolomit / CaCO3)",
      points: 25,
      order: 4,
    },
  ]);

  // 9. Perangkat IoT
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

  // 10. Data Telemetri Realtime
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
      measuredAt: new Date(now - 5 * 60 * 1000),
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
      measuredAt: new Date(now - 15 * 60 * 1000),
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
      measuredAt: new Date(now - 30 * 60 * 1000),
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
      measuredAt: new Date(now - 45 * 60 * 1000),
    },
  ];

  await db.insert(iotSensorData).values(telemetryHistory);

  // 11. Notifikasi Sistem
  await db.insert(notifications).values([
    {
      userId: siswa1.id,
      title: "Kuis Harian 01 Tersedia",
      message: "Dr. Budi Santoso telah mengaktifkan Kuis Harian 01 untuk kelas X IPA 1. Silakan kerjakan sebelum tenggat.",
      isRead: false,
    },
    {
      userId: siswa1.id,
      title: "Nilai Tugas Diperbarui",
      message: "Tugas Laporan Analisis NPK Anda telah dinilai dengan skor 92/100.",
      isRead: false,
    },
    {
      userId: siswa2.id,
      title: "Simulasi Ujian Akhir Siap Dikerjakan",
      message: "Simulasi Ujian Akhir Edge Computing & MQTT telah dibuka di kelas XI IPA 2.",
      isRead: false,
    },
    {
      userId: guru.id,
      title: "Pengumpulan Tugas Baru Masuk",
      message: "Siti Nurhaliza telah mengumpulkan tugas Diagram Rangkaian ESP8266.",
      isRead: false,
    },
    {
      userId: admin.id,
      title: "Sistem Terrawise Beroperasi Normal",
      message: "3 Node IoT aktif mengirimkan telemetri ke database secara stabil.",
      isRead: true,
    },
  ]);

  // 12. Tiket Keluhan
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

  console.log("✅ Seeding Terrawise.id berhasil!");
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
