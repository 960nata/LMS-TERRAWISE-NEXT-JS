import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = pgEnum("role", [
  "SUPERADMIN",
  "ADMIN",
  "TEACHER",
  "STUDENT",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("STUDENT"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const kelas = pgTable("kelas", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  teacherId: text("teacher_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const enrollments = pgTable(
  "enrollments",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    studentId: text("student_id").notNull().references(() => users.id),
    kelasId: text("kelas_id").notNull().references(() => kelas.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniqEnrollment: uniqueIndex("uniq_enrollment").on(t.studentId, t.kelasId),
  })
);

export const materi = pgTable("materi", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  kelasId: text("kelas_id").notNull().references(() => kelas.id),
  authorId: text("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tugas = pgTable("tugas", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  maxScore: integer("max_score").notNull().default(100),
  kelasId: text("kelas_id").notNull().references(() => kelas.id),
  authorId: text("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tugasSubmissions = pgTable(
  "tugas_submissions",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    tugasId: text("tugas_id").notNull().references(() => tugas.id),
    studentId: text("student_id").notNull().references(() => users.id),
    fileUrl: text("file_url"),
    answerText: text("answer_text"),
    score: integer("score"),
    feedback: text("feedback"),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    gradedAt: timestamp("graded_at"),
  },
  (t) => ({
    uniqSubmission: uniqueIndex("uniq_submission").on(t.tugasId, t.studentId),
  })
);

export const ujian = pgTable("ujian", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  kelasId: text("kelas_id").notNull().references(() => kelas.id),
  authorId: text("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const soal = pgTable("soal", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  ujianId: text("ujian_id").notNull().references(() => ujian.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  points: integer("points").notNull().default(1),
  order: integer("order").notNull().default(0),
});

export const ujianAttempts = pgTable(
  "ujian_attempts",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    ujianId: text("ujian_id").notNull().references(() => ujian.id),
    studentId: text("student_id").notNull().references(() => users.id),
    answers: jsonb("answers").notNull(),
    score: integer("score"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    submittedAt: timestamp("submitted_at"),
  },
  (t) => ({
    uniqAttempt: uniqueIndex("uniq_attempt").on(t.ujianId, t.studentId),
  })
);

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  taughtKelas: many(kelas),
  materiAuthored: many(materi),
  tugasAuthored: many(tugas),
  ujianAuthored: many(ujian),
  enrollments: many(enrollments),
  tugasSubmissions: many(tugasSubmissions),
  ujianAttempts: many(ujianAttempts),
  notifications: many(notifications),
}));

export const kelasRelations = relations(kelas, ({ one, many }) => ({
  teacher: one(users, { fields: [kelas.teacherId], references: [users.id] }),
  enrollments: many(enrollments),
  materi: many(materi),
  tugas: many(tugas),
  ujian: many(ujian),
}));

export const tugasRelations = relations(tugas, ({ one, many }) => ({
  kelas: one(kelas, { fields: [tugas.kelasId], references: [kelas.id] }),
  author: one(users, { fields: [tugas.authorId], references: [users.id] }),
  submissions: many(tugasSubmissions),
}));

export const ujianRelations = relations(ujian, ({ one, many }) => ({
  kelas: one(kelas, { fields: [ujian.kelasId], references: [kelas.id] }),
  author: one(users, { fields: [ujian.authorId], references: [users.id] }),
  soal: many(soal),
  attempts: many(ujianAttempts),
}));

export const soalRelations = relations(soal, ({ one }) => ({
  ujian: one(ujian, { fields: [soal.ujianId], references: [ujian.id] }),
}));
