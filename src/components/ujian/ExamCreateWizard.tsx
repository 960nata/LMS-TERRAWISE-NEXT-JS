"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, RichTextEditor } from "@/components/ui";

type KelasOption = {
  id: string;
  name: string;
};

type ExamType = "MULTIPLE_CHOICE" | "ESSAY" | "MIXED";

type ExamQuestion = {
  id: string;
  type: "MULTIPLE_CHOICE" | "ESSAY";
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  rubric?: string;
  points: number;
};

export function ExamCreateWizard({
  kelas,
  basePath,
  initialTipe,
  formAction,
}: {
  kelas: KelasOption[];
  basePath: string;
  initialTipe?: string;
  formAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedType, setSelectedType] = useState<ExamType | null>(
    initialTipe === "MULTIPLE_CHOICE" ||
      initialTipe === "ESSAY" ||
      initialTipe === "MIXED"
      ? (initialTipe as ExamType)
      : null
  );

  const [submitting, setSubmitting] = useState(false);

  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      id: "eq-1",
      type: initialTipe === "ESSAY" ? "ESSAY" : "MULTIPLE_CHOICE",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      rubric: "",
      points: 10,
    },
  ]);

  const addQuestion = (type?: "MULTIPLE_CHOICE" | "ESSAY") => {
    const qType =
      type ??
      (selectedType === "ESSAY"
        ? "ESSAY"
        : selectedType === "MIXED"
        ? "MULTIPLE_CHOICE"
        : "MULTIPLE_CHOICE");

    setQuestions((prev) => [
      ...prev,
      {
        id: `eq-${Date.now()}`,
        type: qType,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        rubric: "",
        points: qType === "MULTIPLE_CHOICE" ? 5 : 20,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (
    id: string,
    field: keyof ExamQuestion,
    val: ExamQuestion[keyof ExamQuestion]
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  // STEP 1: Type Selection Screen
  if (!selectedType) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          href={`${basePath}/ujian`}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors"
        >
          <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Ujian
        </Link>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                1
              </div>
              <span className="text-xs md:text-sm font-extrabold uppercase text-black">
                Pilih Tipe Ujian
              </span>
            </div>
            <div className="h-0.5 w-10 md:w-16 bg-gray-200" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                2
              </div>
              <span className="text-xs md:text-sm font-medium uppercase text-gray-400">
                Jadwal &amp; Butir Soal
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl text-black">
            Pilih Model Ujian Sekolah
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-500 max-w-xl mx-auto">
            Sistem evaluasi ujian terpadu Terra Assessment dilengkapi timer pengerjaan otomatis dan acak butir soal. Tentukan model ujian yang akan dijadwalkan.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Card 1: Pilihan Ganda */}
          <div
            onClick={() => {
              setSelectedType("MULTIPLE_CHOICE");
              setQuestions([
                {
                  id: "eq-1",
                  type: "MULTIPLE_CHOICE",
                  question: "",
                  optionA: "",
                  optionB: "",
                  optionC: "",
                  optionD: "",
                  correctAnswer: "A",
                  points: 5,
                },
              ]);
            }}
            className="group cursor-pointer rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-black flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white group-hover:scale-105 transition-transform">
                  <Icon name="quiz" size={24} />
                </div>
                <span className="rounded-full bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Auto-Grading
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                1. Ujian Pilihan Ganda
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Ujian dengan timer durasi dan penilaian instan otomatis. Dilengkapi opsi jawaban A, B, C, D dan kunci jawaban terpusat.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Tipe 1</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-black group-hover:underline">
                Pilih Tipe Ini <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </div>

          {/* Card 2: Essay */}
          <div
            onClick={() => {
              setSelectedType("ESSAY");
              setQuestions([
                {
                  id: "eq-1",
                  type: "ESSAY",
                  question: "",
                  optionA: "",
                  optionB: "",
                  optionC: "",
                  optionD: "",
                  correctAnswer: "A",
                  rubric: "",
                  points: 25,
                },
              ]);
            }}
            className="group cursor-pointer rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-black flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white group-hover:scale-105 transition-transform">
                  <Icon name="edit_note" size={24} />
                </div>
                <span className="rounded-full bg-neutral-800 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Koreksi Guru
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                2. Ujian Soal Essay
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Ujian uraian analitis dengan waktu hitung mundur. Dilengkapi pedoman penskoran/rubrik untuk penilaian komprehensif oleh penguji.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Tipe 2</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-black group-hover:underline">
                Pilih Tipe Ini <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </div>

          {/* Card 3: Campuran */}
          <div
            onClick={() => {
              setSelectedType("MIXED");
              setQuestions([
                {
                  id: "eq-1",
                  type: "MULTIPLE_CHOICE",
                  question: "",
                  optionA: "",
                  optionB: "",
                  optionC: "",
                  optionD: "",
                  correctAnswer: "A",
                  points: 5,
                },
              ]);
            }}
            className="group cursor-pointer rounded-3xl border border-gray-300 bg-white p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-black flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Icon name="splitscreen" size={24} />
                </div>
                <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Kombinasi
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                3. Ujian Campuran (PG + Essay)
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Model asesmen UTS/UAS terintegrasi yang menggabungkan butir pilihan ganda objektif dengan butir studi kasus essay dalam satu sesi ujian.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Tipe 3</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-black group-hover:underline">
                Pilih Tipe Ini <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Dedicated Form for Selected Exam Type
  const typeConfig = {
    MULTIPLE_CHOICE: {
      title: "Jadwalkan Ujian Pilihan Ganda",
      desc: "Jadwalkan ujian online dengan opsi jawaban A-D dan penilaian otomatis.",
      badge: "Pilihan Ganda",
    },
    ESSAY: {
      title: "Jadwalkan Ujian Soal Essay",
      desc: "Jadwalkan ujian uraian dengan timer dan rubrik penskoran pengajar.",
      badge: "Soal Essay",
    },
    MIXED: {
      title: "Jadwalkan Ujian Campuran",
      desc: "Jadwalkan ujian komprehensif kombinasi butir pilihan ganda dan essay.",
      badge: "Campuran (PG + Essay)",
    },
  }[selectedType];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set("questionsData", JSON.stringify(questions));

    try {
      await formAction(formData);
    } catch (err: unknown) {
      const e = err as { digest?: string; message?: string };
      if (e?.digest?.startsWith("NEXT_REDIRECT") || e?.message === "NEXT_REDIRECT") {
        throw err;
      }
      console.error("Exam submission error:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back button */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelectedType(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors"
        >
          <Icon name="arrow_back" size={16} /> Ganti Model Ujian
        </button>
        <span className="rounded-full bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
          {typeConfig.badge}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
              1
            </div>
            <span className="text-xs md:text-sm font-extrabold uppercase text-black">
              Jadwal &amp; Soal
            </span>
          </div>
          <div className="h-0.5 w-10 md:w-16 bg-gray-200" />
          <div className="flex items-center gap-2 opacity-40">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
              2
            </div>
            <span className="text-xs md:text-sm font-medium uppercase text-gray-400">
              Selesai Terbit
            </span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <header className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
          <Icon name="quiz" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl text-black">
            {typeConfig.title}
          </h1>
          <p className="mt-1 text-xs md:text-sm font-medium text-gray-500">
            {typeConfig.desc}
          </p>
        </div>
      </header>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="tipe" value={selectedType} />

        {/* Section 1: Informasi Ujian */}
        <div className="rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-black border-b border-gray-100 pb-3 flex items-center gap-2">
            <Icon name="event" size={18} /> Informasi &amp; Jadwal Ujian
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Judul Ujian <span className="text-black">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="cth: Evaluasi Tengah Semester - Matematika & Logika"
                className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Kelas Tujuan <span className="text-black">*</span>
              </label>
              <select
                name="kelasId"
                required
                className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Pilih Kelas</option>
                {kelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Durasi Pengerjaan (Menit) <span className="text-black">*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                defaultValue={60}
                min={1}
                max={360}
                required
                className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Waktu Mulai <span className="text-black">*</span>
              </label>
              <input
                type="datetime-local"
                name="startTime"
                required
                className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Waktu Selesai <span className="text-black">*</span>
              </label>
              <input
                type="datetime-local"
                name="endTime"
                required
                className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* Section 2: DYNAMIC EXAM QUESTION BUILDER */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                <Icon name="quiz" size={20} /> Bank Butir Soal Ujian ({questions.length} Butir Soal)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Tambahkan butir-butir pertanyaan soal ujian langsung di halaman pembuatan ini.
              </p>
            </div>
            {selectedType === "MIXED" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addQuestion("MULTIPLE_CHOICE")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-2 text-xs font-bold uppercase text-white hover:bg-neutral-800"
                >
                  <Icon name="add" size={16} /> + Butir PG
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion("ESSAY")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-black bg-white px-3.5 py-2 text-xs font-bold uppercase text-black hover:bg-black hover:text-white"
                >
                  <Icon name="add" size={16} /> + Butir Essay
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addQuestion()}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <Icon name="add" size={18} /> + Tambah Soal Ujian
              </button>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const isMC = q.type === "MULTIPLE_CHOICE";
              return (
                <div
                  key={q.id}
                  className="rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-xs font-black text-white">
                        #{idx + 1}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                        {isMC ? "Pilihan Ganda" : "Soal Essay"}
                      </span>
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors"
                        title="Hapus Soal"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                      Teks Pertanyaan Soal (Mendukung Rich Text &amp; Gambar) <span className="text-black">*</span>
                    </label>
                    <RichTextEditor
                      value={q.question}
                      onChange={(val) => updateQuestion(q.id, "question", val)}
                      placeholder="Tuliskan teks pertanyaan soal ujian di sini (tekan tombol gambar pada toolbar untuk menyisipkan diagram)..."
                      minHeight="110px"
                      required
                    />
                  </div>

                  {isMC ? (
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                        Opsi Jawaban &amp; Kunci Jawaban Benar (Pilih bulatan radio untuk kunci)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const isCorrect = q.correctAnswer === opt;
                          const field = `option${opt}` as keyof ExamQuestion;
                          return (
                            <div
                              key={opt}
                              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                                isCorrect
                                  ? "border-black bg-neutral-50 ring-1 ring-black"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`exam-correct-${q.id}`}
                                checked={isCorrect}
                                onChange={() => updateQuestion(q.id, "correctAnswer", opt)}
                                className="h-4 w-4 text-black focus:ring-black accent-black cursor-pointer"
                              />
                              <span className="font-black text-xs text-black">Opsi {opt}:</span>
                              <input
                                type="text"
                                value={q[field] as string}
                                onChange={(e) => updateQuestion(q.id, field, e.target.value)}
                                placeholder={`Teks pilihan ${opt}`}
                                required
                                className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                        Rubrik Penilaian / Kunci Poin Essay
                      </label>
                      <input
                        type="text"
                        value={q.rubric}
                        onChange={(e) => updateQuestion(q.id, "rubric", e.target.value)}
                        placeholder="cth: Menyebutkan 3 tahapan siklus secara urut"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-black focus:border-black focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {isMC ? `Kunci: Opsi ${q.correctAnswer}` : "Ujian Essay"}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Bobot Poin:
                      </label>
                      <input
                        type="number"
                        value={q.points}
                        onChange={(e) => updateQuestion(q.id, "points", Number(e.target.value))}
                        min={1}
                        className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
          <Link
            href={`${basePath}/ujian`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-600 hover:border-black hover:text-black transition-colors"
          >
            <Icon name="arrow_back" size={16} /> Batal
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-black px-10 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
          >
            <Icon name="save" size={18} />
            <span>{submitting ? "Menjadwalkan Ujian..." : "Simpan & Publikasikan Jadwal Ujian"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
