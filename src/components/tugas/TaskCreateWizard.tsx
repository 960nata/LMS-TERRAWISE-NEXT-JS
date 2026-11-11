"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, RichTextEditor } from "@/components/ui";

type KelasOption = {
  id: string;
  name: string;
};

type TaskType = "MULTIPLE_CHOICE" | "ESSAY" | "MANDIRI" | "KELOMPOK";

type MultipleChoiceQuestion = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  points: number;
};

type EssayQuestion = {
  id: string;
  question: string;
  rubric: string;
  points: number;
};

type GroupItem = {
  id: string;
  name: string;
  members: string;
};

export function TaskCreateWizard({
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
  const [selectedType, setSelectedType] = useState<TaskType | null>(
    initialTipe === "MULTIPLE_CHOICE" ||
      initialTipe === "ESSAY" ||
      initialTipe === "MANDIRI" ||
      initialTipe === "KELOMPOK"
      ? (initialTipe as TaskType)
      : null
  );

  const [submitting, setSubmitting] = useState(false);

  // Multiple Choice Questions State
  const [mcQuestions, setMcQuestions] = useState<MultipleChoiceQuestion[]>([
    {
      id: "q-1",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      points: 25,
    },
  ]);

  // Essay Questions State
  const [essayQuestions, setEssayQuestions] = useState<EssayQuestion[]>([
    {
      id: "eq-1",
      question: "",
      rubric: "",
      points: 50,
    },
  ]);

  // Group Management State
  const [groups, setGroups] = useState<GroupItem[]>([
    { id: "g-1", name: "Kelompok 1", members: "" },
  ]);

  const addMcQuestion = () => {
    setMcQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        points: 25,
      },
    ]);
  };

  const removeMcQuestion = (id: string) => {
    setMcQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateMcQuestion = (
    id: string,
    field: keyof MultipleChoiceQuestion,
    val: MultipleChoiceQuestion[keyof MultipleChoiceQuestion]
  ) => {
    setMcQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  const addEssayQuestion = () => {
    setEssayQuestions((prev) => [
      ...prev,
      {
        id: `eq-${Date.now()}`,
        question: "",
        rubric: "",
        points: 25,
      },
    ]);
  };

  const removeEssayQuestion = (id: string) => {
    setEssayQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateEssayQuestion = (
    id: string,
    field: keyof EssayQuestion,
    val: EssayQuestion[keyof EssayQuestion]
  ) => {
    setEssayQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  const addGroup = () => {
    setGroups((prev) => [
      ...prev,
      {
        id: `g-${Date.now()}`,
        name: `Kelompok ${prev.length + 1}`,
        members: "",
      },
    ]);
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGroup = (id: string, field: keyof GroupItem, val: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: val } : g))
    );
  };

  // STEP 1: Type Selection Screen
  if (!selectedType) {
    return (
      <div className="mx-auto max-w-5xl">
        <Link
          href={`${basePath}/tugas`}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors"
        >
          <Icon name="arrow_back" size={16} /> Kembali ke Manajemen Tugas
        </Link>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                1
              </div>
              <span className="text-xs md:text-sm font-extrabold uppercase text-black">
                Pilih Tipe Tugas
              </span>
            </div>
            <div className="h-0.5 w-10 md:w-16 bg-gray-200" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                2
              </div>
              <span className="text-xs md:text-sm font-medium uppercase text-gray-400">
                Detail &amp; Soal
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl text-black">
            Pilih Tipe Tugas Pembelajaran
          </h1>
          <p className="mt-1 text-xs md:text-sm text-gray-500 max-w-xl mx-auto">
            Sistem Terra Assessment menyediakan 4 model evaluasi pembelajaran. Tentukan tipe penugasan yang ingin Anda berikan kepada siswa.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1: Pilihan Ganda */}
          <div
            onClick={() => setSelectedType("MULTIPLE_CHOICE")}
            className="group cursor-pointer rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-black flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white group-hover:scale-105 transition-transform">
                  <Icon name="list_alt" size={24} />
                </div>
                <span className="rounded-full bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Auto-Grading
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                1. Pilihan Ganda (Multiple Choice)
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Kuis evaluasi objektif dengan opsi jawaban A, B, C, D dan kunci jawaban benar. Sistem akan menilai hasil pengerjaan siswa secara otomatis dan instan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Model Asesmen 1</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-black group-hover:underline">
                Pilih Tipe Ini <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </div>

          {/* Card 2: Soal Essay */}
          <div
            onClick={() => setSelectedType("ESSAY")}
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
                2. Soal Essay (Uraian)
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Tugas dengan butir pertanyaan uraian mendalam. Dilengkapi rubrik penskoran dan koreksi manual oleh guru pengampu per butir jawaban siswa.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Model Asesmen 2</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-black group-hover:underline">
                Pilih Tipe Ini <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </div>

          {/* Card 3: Tugas Mandiri */}
          <div
            onClick={() => setSelectedType("MANDIRI")}
            className="group cursor-pointer rounded-3xl border border-gray-300 bg-white p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-black flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Icon name="person" size={24} />
                </div>
                <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Individu
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                3. Tugas Mandiri (Individual)
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Tugas pengerjaan mandiri reguler seperti ringkasan materi, laporan studi kasus, atau penyelesaian soal latihan dengan pengumpulan dokumen / file.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Model Asesmen 3</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-black group-hover:underline">
                Pilih Tipe Ini <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </div>

          {/* Card 4: Proyek Kelompok */}
          <div
            onClick={() => setSelectedType("KELOMPOK")}
            className="group cursor-pointer rounded-3xl border border-gray-300 bg-white p-6 md:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-black flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Icon name="groups" size={24} />
                </div>
                <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                  Kolaboratif
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-black">
                4. Proyek Kelompok (Group Task)
              </h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                Penugasan kolaborasi antar siswa. Dilengkapi pembagian nama kelompok, anggota tim, serta opsi evaluasi sejawat (Peer Assessment).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Model Asesmen 4</span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-black group-hover:underline">
                Pilih Tipe Ini <Icon name="arrow_forward" size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Dedicated Form for the Selected Task Type
  const typeConfig = {
    MULTIPLE_CHOICE: {
      title: "Buat Tugas Pilihan Ganda",
      desc: "Lengkapi detail tugas dan tambahkan butir-butir pertanyaan dengan kunci jawaban benar.",
      icon: "list_alt",
      badge: "Pilihan Ganda",
    },
    ESSAY: {
      title: "Buat Tugas Soal Essay",
      desc: "Lengkapi detail tugas dan buat butir pertanyaan uraian beserta rubrik penskorannya.",
      icon: "edit_note",
      badge: "Soal Essay",
    },
    MANDIRI: {
      title: "Buat Tugas Mandiri",
      desc: "Tugas pengerjaan individual dengan instruksi pengerjaan dan opsi pengumpulan dokumen.",
      icon: "person",
      badge: "Tugas Mandiri",
    },
    KELOMPOK: {
      title: "Buat Proyek Kelompok",
      desc: "Penugasan kelompok kolaboratif dengan pembagian tim dan opsi Peer Assessment.",
      icon: "groups",
      badge: "Proyek Kelompok",
    },
  }[selectedType];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Package questionsData
    if (selectedType === "MULTIPLE_CHOICE") {
      formData.set("questionsData", JSON.stringify(mcQuestions));
    } else if (selectedType === "ESSAY") {
      formData.set("questionsData", JSON.stringify(essayQuestions));
    }

    try {
      await formAction(formData);
    } catch (err) {
      console.error(err);
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
          <Icon name="arrow_back" size={16} /> Ganti Tipe Tugas
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
              Detail &amp; Soal
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
          <Icon name={typeConfig.icon} size={28} />
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

        {/* Section 1: Informasi Utama */}
        <div className="rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-black border-b border-gray-100 pb-3 flex items-center gap-2">
            <Icon name="info" size={18} /> Informasi Utama Tugas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Judul Tugas <span className="text-black">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="cth: Evaluasi Pemahaman Bab 3 atau Analisis Algoritma"
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
                Batas Waktu (Deadline) <span className="text-black">*</span>
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                required
                className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Nilai Maksimal
              </label>
              <input
                type="number"
                name="maxScore"
                defaultValue={100}
                required
                className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Instruksi &amp; Petunjuk Pengerjaan <span className="text-black">*</span>
              </label>
              <RichTextEditor
                name="description"
                placeholder="Tuliskan petunjuk pengerjaan tugas secara rinci bagi siswa (bisa format teks &amp; unggah gambar)..."
                minHeight="140px"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: DYNAMIC QUESTION BUILDER */}
        {selectedType === "MULTIPLE_CHOICE" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                  <Icon name="quiz" size={20} /> Bank Soal Pilihan Ganda ({mcQuestions.length} Butir Soal)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tambahkan butir pertanyaan, tentukan 4 pilihan jawaban, dan klik radio button untuk kunci jawaban benar.
                </p>
              </div>
              <button
                type="button"
                onClick={addMcQuestion}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <Icon name="add" size={18} /> + Tambah Soal
              </button>
            </div>

            {mcQuestions.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                <Icon name="quiz" size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Belum ada soal ditambahkan
                </p>
                <button
                  type="button"
                  onClick={addMcQuestion}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-black bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
                >
                  <Icon name="add" size={16} /> Tambah Soal Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {mcQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm space-y-5"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-xs font-black text-white">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xs font-black uppercase tracking-widest text-black">
                          Butir Pertanyaan {idx + 1}
                        </h4>
                      </div>
                      {mcQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMcQuestion(q.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors"
                          title="Hapus Butir Soal"
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
                        onChange={(val) => updateMcQuestion(q.id, "question", val)}
                        placeholder="Ketik teks pertanyaan soal di sini (klik ikon gambar di toolbar untuk mengunggah gambar)..."
                        minHeight="110px"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                        Opsi Jawaban &amp; Kunci Jawaban Benar (Pilih bulatan untuk jawaban yang benar)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(["A", "B", "C", "D"] as const).map((opt) => {
                          const isCorrect = q.correctAnswer === opt;
                          const field = `option${opt}` as keyof MultipleChoiceQuestion;
                          return (
                            <div
                              key={opt}
                              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                                isCorrect ? "border-black bg-neutral-50 ring-1 ring-black" : "border-gray-200 bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={isCorrect}
                                onChange={() => updateMcQuestion(q.id, "correctAnswer", opt)}
                                className="h-4 w-4 text-black focus:ring-black accent-black cursor-pointer"
                              />
                              <span className="font-black text-xs text-black">Opsi {opt}:</span>
                              <input
                                type="text"
                                value={q[field] as string}
                                onChange={(e) => updateMcQuestion(q.id, field, e.target.value)}
                                placeholder={`Teks pilihan ${opt}`}
                                required
                                className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Kunci Terpilih: Opsi {q.correctAnswer}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                          Bobot Poin:
                        </label>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => updateMcQuestion(q.id, "points", Number(e.target.value))}
                          min={1}
                          className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 2: ESSAY QUESTION BUILDER */}
        {selectedType === "ESSAY" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                  <Icon name="quiz" size={20} /> Butir Pertanyaan Essay ({essayQuestions.length} Soal)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tambahkan pertanyaan essay dan tentukan rubrik kriteria penskoran untuk evaluasi manual.
                </p>
              </div>
              <button
                type="button"
                onClick={addEssayQuestion}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <Icon name="add" size={18} /> + Tambah Soal Essay
              </button>
            </div>

            <div className="space-y-6">
              {essayQuestions.map((eq, idx) => (
                <div
                  key={eq.id}
                  className="rounded-3xl border-2 border-black bg-white p-6 md:p-8 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-xs font-black text-white">
                        #{idx + 1}
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-widest text-black">
                        Pertanyaan Essay {idx + 1}
                      </h4>
                    </div>
                    {essayQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEssayQuestion(eq.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-600 hover:text-red-600 transition-colors"
                        title="Hapus Soal"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                      Teks Pertanyaan Essay (Mendukung Rich Text &amp; Gambar) <span className="text-black">*</span>
                    </label>
                    <RichTextEditor
                      value={eq.question}
                      onChange={(val) => updateEssayQuestion(eq.id, "question", val)}
                      placeholder="Tuliskan pertanyaan essay di sini (klik ikon gambar di toolbar untuk menyisipkan diagram/ilustrasi)..."
                      minHeight="110px"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                        Rubrik / Kriteria Penskoran
                      </label>
                      <input
                        type="text"
                        value={eq.rubric}
                        onChange={(e) => updateEssayQuestion(eq.id, "rubric", e.target.value)}
                        placeholder="cth: Menjelaskan 3 pilar utama secara terstruktur"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-black focus:border-black focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                        Bobot Poin
                      </label>
                      <input
                        type="number"
                        value={eq.points}
                        onChange={(e) => updateEssayQuestion(eq.id, "points", Number(e.target.value))}
                        min={1}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-bold text-black focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: MANDIRI OPTIONS */}
        {selectedType === "MANDIRI" && (
          <div className="rounded-3xl border border-black bg-white p-6 md:p-8 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-black border-b border-gray-100 pb-3 flex items-center gap-2">
              <Icon name="assignment" size={18} /> Metode Pengumpulan Siswa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-4 rounded-2xl border border-gray-200 p-5 hover:border-black transition-colors cursor-pointer bg-neutral-50/50">
                <input
                  type="checkbox"
                  name="allowTextInput"
                  defaultChecked
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black accent-black"
                />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-black">
                    Input Teks Langsung
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    Siswa dapat mengetikkan teks jawaban tugas langsung di portal.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-4 rounded-2xl border border-gray-200 p-5 hover:border-black transition-colors cursor-pointer bg-neutral-50/50">
                <input
                  type="checkbox"
                  name="allowFileUpload"
                  defaultChecked
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black accent-black"
                />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-black">
                    Tautan / Upload File Dokumen
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    Siswa dapat melampirkan berkas PDF, Google Drive, atau GitHub link.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Section 2: KELOMPOK OPTIONS */}
        {selectedType === "KELOMPOK" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-black flex items-center gap-2">
                  <Icon name="groups" size={20} /> Pembagian Kelompok &amp; Anggota Tim
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tentukan kelompok kerja atau biarkan siswa membentuk tim kolaborasi mandiri.
                </p>
              </div>
              <button
                type="button"
                onClick={addGroup}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <Icon name="group_add" size={18} /> + Tambah Kelompok
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((g, idx) => (
                <div
                  key={g.id}
                  className="rounded-2xl border border-black bg-white p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-[11px] font-black text-white">
                      {idx + 1}
                    </span>
                    {groups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGroup(g.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Nama Kelompok
                    </label>
                    <input
                      type="text"
                      value={g.name}
                      onChange={(e) => updateGroup(g.id, "name", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-black focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                      Daftar Anggota Tim (Opsional / Siswa dapat mengisi)
                    </label>
                    <input
                      type="text"
                      value={g.members}
                      onChange={(e) => updateGroup(g.id, "members", e.target.value)}
                      placeholder="cth: Ahmad, Budi, Citra"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-black focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
          <Link
            href={`${basePath}/tugas`}
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
            <span>{submitting ? "Menyimpan Tugas..." : "Simpan & Publikasikan Tugas"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
