export type Role = "SUPERADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Path prefixes yang membuat item ini aktif (default: href). */
  match?: string[];
  exact?: boolean;
};

export type NavSection = { title: string; items: NavItem[] };

export const ROLE_TITLE: Record<Role, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  TEACHER: "Guru",
  STUDENT: "Siswa",
};

export const ROLE_INITIAL: Record<Role, string> = {
  SUPERADMIN: "SA",
  ADMIN: "AD",
  TEACHER: "GU",
  STUDENT: "SI",
};

export const SIDEBAR: Record<Role, NavSection[]> = {
  SUPERADMIN: [
    {
      title: "Menu Utama",
      items: [
        { href: "/superadmin", label: "Dashboard", icon: "grid_view", exact: true },
        { href: "/superadmin/notifikasi", label: "Push Notifikasi", icon: "notifications" },
      ],
    },
    {
      title: "Akademik & Pembelajaran",
      items: [
        { href: "/superadmin/materi", label: "Manajemen Materi", icon: "description" },
        { href: "/superadmin/tugas", label: "Manajemen Tugas", icon: "assignment" },
        { href: "/superadmin/ujian", label: "Manajemen Ujian", icon: "quiz" },
      ],
    },
    {
      title: "Manajemen Sekolah",
      items: [
        { href: "/superadmin/pengguna", label: "Manajemen Pengguna", icon: "groups" },
        { href: "/superadmin/kelas", label: "Manajemen Kelas", icon: "meeting_room" },
        { href: "/superadmin/keluhan", label: "Keluhan & Bantuan", icon: "chat_bubble" },
      ],
    },
    {
      title: "Analitik",
      items: [{ href: "/superadmin/laporan", label: "Laporan & Nilai", icon: "analytics" }],
    },
  ],
  ADMIN: [
    {
      title: "Menu Utama",
      items: [
        { href: "/admin", label: "Dashboard", icon: "grid_view", exact: true },
        { href: "/admin/notifikasi", label: "Push Notifikasi", icon: "notifications" },
      ],
    },
    {
      title: "Akademik & Pembelajaran",
      items: [
        { href: "/admin/materi", label: "Manajemen Materi", icon: "description" },
        { href: "/admin/tugas", label: "Manajemen Tugas", icon: "assignment" },
        { href: "/admin/ujian", label: "Manajemen Ujian", icon: "quiz" },
      ],
    },
    {
      title: "Manajemen Sekolah",
      items: [
        { href: "/admin/pengguna", label: "Manajemen Pengguna", icon: "groups" },
        { href: "/admin/kelas", label: "Manajemen Kelas", icon: "meeting_room" },
        { href: "/admin/keluhan", label: "Keluhan & Bantuan", icon: "chat_bubble" },
      ],
    },
    {
      title: "Analitik",
      items: [{ href: "/admin/laporan", label: "Laporan & Nilai", icon: "analytics" }],
    },
  ],
  TEACHER: [
    {
      title: "Menu Utama",
      items: [
        { href: "/teacher", label: "Dashboard", icon: "grid_view", exact: true },
        { href: "/teacher/notifikasi", label: "Notifikasi", icon: "notifications" },
      ],
    },
    {
      title: "Manajemen Pembelajaran",
      items: [
        { href: "/teacher/materi", label: "Manajemen Materi", icon: "description" },
        { href: "/teacher/tugas", label: "Manajemen Tugas", icon: "assignment" },
        { href: "/teacher/ujian", label: "Manajemen Ujian", icon: "quiz" },
        { href: "/teacher/keluhan", label: "Keluhan & Bantuan", icon: "chat_bubble" },
      ],
    },
    {
      title: "Laporan & Evaluasi",
      items: [{ href: "/teacher/laporan", label: "Laporan Nilai Siswa", icon: "analytics" }],
    },
  ],
  STUDENT: [
    {
      title: "Menu Utama",
      items: [
        { href: "/student", label: "Dashboard", icon: "grid_view", exact: true },
        { href: "/student/notifikasi", label: "Notifikasi", icon: "notifications" },
      ],
    },
    {
      title: "Pembelajaran",
      items: [
        { href: "/student/materi", label: "Materi Belajar", icon: "description" },
        { href: "/student/tugas", label: "Tugas Saya", icon: "assignment" },
        { href: "/student/ujian", label: "Ujian & Kuis", icon: "quiz" },
      ],
    },
    {
      title: "Bantuan & Evaluasi",
      items: [
        { href: "/student/laporan", label: "Riwayat Nilai", icon: "analytics" },
        { href: "/student/keluhan", label: "Keluhan & Bantuan", icon: "chat_bubble" },
      ],
    },
  ],
};

export const BOTTOM_NAV: Record<Role, NavItem[]> = {
  SUPERADMIN: [
    { href: "/superadmin", label: "Home", icon: "home", exact: true },
    { href: "/superadmin/materi", label: "Materi", icon: "description" },
    { href: "/superadmin/tugas", label: "Tugas", icon: "assignment" },
    { href: "/superadmin/ujian", label: "Ujian", icon: "quiz" },
    { href: "/superadmin/laporan", label: "Laporan", icon: "analytics" },
  ],
  ADMIN: [
    { href: "/admin", label: "Home", icon: "home", exact: true },
    { href: "/admin/materi", label: "Materi", icon: "description" },
    { href: "/admin/tugas", label: "Tugas", icon: "assignment" },
    { href: "/admin/ujian", label: "Ujian", icon: "quiz" },
    { href: "/admin/laporan", label: "Laporan", icon: "analytics" },
  ],
  TEACHER: [
    { href: "/teacher", label: "Home", icon: "home", exact: true },
    { href: "/teacher/materi", label: "Materi", icon: "description" },
    { href: "/teacher/tugas", label: "Tugas", icon: "assignment" },
    { href: "/teacher/ujian", label: "Ujian", icon: "quiz" },
    { href: "/teacher/laporan", label: "Nilai", icon: "analytics" },
  ],
  STUDENT: [
    { href: "/student", label: "Home", icon: "home", exact: true },
    { href: "/student/materi", label: "Materi", icon: "description" },
    { href: "/student/tugas", label: "Tugas", icon: "assignment" },
    { href: "/student/ujian", label: "Ujian", icon: "quiz" },
    { href: "/student/laporan", label: "Nilai", icon: "analytics" },
  ],
};

export function isActive(pathname: string, item: NavItem) {
  const prefixes = item.match ?? [item.href];
  return prefixes.some((p) =>
    item.exact ? pathname === p : pathname === p || pathname.startsWith(p + "/"),
  );
}
