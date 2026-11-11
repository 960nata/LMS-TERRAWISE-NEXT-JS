"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BOTTOM_NAV, ROLE_INITIAL, ROLE_TITLE, SIDEBAR, isActive, type Role } from "./nav";

export type ShellNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type Props = {
  user: { name: string; email: string; role: Role };
  notifications: ShellNotification[];
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
};

function Icon({ name, className = "", size }: { name: string; className?: string; size?: number }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={size ? { fontSize: size } : undefined}>
      {name}
    </span>
  );
}

function formatTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Baru saja";
  if (diff < 60) return `${diff} menit yang lalu`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} jam yang lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari yang lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

export default function DashboardShell({ user, notifications, logoutAction, children }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  // Tutup sidebar & dropdown setiap pindah halaman.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setSidebarOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const roleTitle = ROLE_TITLE[user.role];
  const initial = ROLE_INITIAL[user.role];
  const unread = notifications.filter((n) => !n.isRead).length;
  const sections = SIDEBAR[user.role];
  const bottomNav = BOTTOM_NAV[user.role];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 flex h-screen w-[260px] max-w-[80vw] flex-shrink-0 flex-col border-r border-gray-100 bg-white shadow-[2px_0_10px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out sm:w-[280px] sm:max-w-[85vw] lg:sticky lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 pb-4 md:p-6 md:pb-4">
            <Link href="/" className="block">
              <h1 className="text-xl leading-none font-extrabold tracking-tighter text-black md:text-2xl">terrawise.id</h1>
              <p className="mt-1 text-[9px] font-medium tracking-widest text-gray-400 uppercase md:text-[10px]">
                CREATIVE PROBLEM SOLVING
              </p>
            </Link>
          </div>

          <nav className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-4 md:space-y-8 md:px-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-300 uppercase md:mb-4 md:text-[11px]">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(pathname, item);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                            active
                              ? "bg-black font-medium text-white"
                              : "text-gray-500 transition-all hover:bg-gray-50 hover:text-black"
                          }`}
                        >
                          <Icon name={item.icon} className={active ? "" : "text-gray-400"} />
                          <span className="text-xs md:text-sm">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-gray-100 p-4 md:p-6">
            <div className="flex items-center gap-2 px-2 md:gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white md:h-8 md:w-8 md:text-[10px]">
                  {initial}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[11px] font-bold md:text-xs">{roleTitle}</p>
                  <p className="truncate text-[9px] text-gray-400 md:text-[10px]">{user.email}</p>
                </div>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Logout"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="logout" size={16} />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-white">
          {/* Header */}
          <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 md:h-20 md:px-6 lg:px-12">
            <div className="flex items-center gap-4">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
                <Icon name="menu" className="text-gray-400 hover:text-black" />
              </button>
            </div>

            <div className="relative mx-4 hidden w-96 lg:block">
              <Icon
                name="search"
                size={18}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full rounded-full border-none bg-gray-50 py-2.5 pr-4 pl-11 text-xs font-medium outline-none placeholder:text-gray-400 focus:ring-1 focus:ring-black"
                placeholder="Cari materi atau tugas..."
                type="text"
                autoComplete="off"
              />
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              {/* Notifikasi */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative flex h-10 w-10 items-center justify-center text-gray-400 transition-colors hover:text-black"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setProfileOpen(false);
                  }}
                  aria-label="Notifikasi"
                >
                  <Icon name="notifications" />
                  {unread > 0 && (
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-black ring-2 ring-white" />
                  )}
                </button>
                {notifOpen && (
                  <div className="animate-slide-down fixed inset-0 z-[1000] flex flex-col bg-white lg:absolute lg:inset-auto lg:top-full lg:right-0 lg:mt-2 lg:w-80 lg:rounded-lg lg:border lg:border-gray-200 lg:shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-100 p-4 lg:hidden">
                      <span className="text-xs font-black tracking-widest uppercase">Notifikasi</span>
                      <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-black">
                        <Icon name="close" />
                      </button>
                    </div>
                    <div className="hidden items-center justify-between border-b border-gray-100 p-4 lg:flex">
                      <h4 className="text-sm font-bold">Notifikasi</h4>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">
                          <Icon name="notifications_off" />
                          <span className="mt-2 block">Tidak ada notifikasi</span>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex gap-3 border-b border-gray-50 px-4 py-3 last:border-0 ${n.isRead ? "" : "bg-gray-50"}`}
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
                              <Icon name="notifications" size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold">{n.title}</p>
                              <p className="line-clamp-2 text-xs text-gray-500">{n.message}</p>
                              <p className="mt-1 text-[10px] text-gray-400">{formatTime(n.createdAt)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-100" />

              {/* Profil */}
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center gap-3 transition-opacity hover:opacity-70"
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-100 bg-black text-[10px] font-bold text-white">
                    {initial}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-xs leading-none font-bold">{user.name}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{roleTitle}</p>
                  </div>
                  <Icon name="keyboard_arrow_down" size={16} className="text-gray-400" />
                </button>
                {profileOpen && (
                  <div className="animate-slide-down fixed inset-0 z-[1000] flex flex-col bg-white lg:absolute lg:inset-auto lg:top-full lg:right-0 lg:mt-2 lg:w-64 lg:rounded-lg lg:border lg:border-gray-200 lg:shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-100 p-4 lg:hidden">
                      <span className="text-xs font-black tracking-widest uppercase">Menu Profil</span>
                      <button onClick={() => setProfileOpen(false)} className="text-gray-400 hover:text-black">
                        <Icon name="close" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-black text-xs font-bold text-white">
                        {initial}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{user.name}</div>
                        <div className="text-xs text-gray-400">{roleTitle}</div>
                      </div>
                    </div>
                    <div className="p-2">
                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Icon name="logout" size={18} />
                          <span>Logout</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 pb-[120px] md:p-6 md:pb-[120px] lg:p-12">{children}</div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed right-0 bottom-0 left-0 z-[999] lg:hidden">
        <div className="mx-4 mb-6">
          <div className="relative flex items-center justify-around overflow-hidden rounded-[32px] border border-white/20 bg-white/80 px-2 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
            {bottomNav.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link key={item.href} href={item.href} className="group relative flex flex-1 flex-col items-center gap-1 py-1">
                  <div
                    className={`absolute inset-0 mx-auto h-8 w-14 rounded-full transition-all duration-300 ${active ? "bg-black/5" : "bg-transparent"}`}
                  />
                  <Icon
                    name={item.icon}
                    className={`relative z-10 transition-all duration-300 ${active ? "fill-1 text-black" : "text-gray-400"}`}
                  />
                  <span
                    className={`relative z-10 text-[9px] font-bold tracking-tight uppercase ${active ? "text-black" : "text-gray-400"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
