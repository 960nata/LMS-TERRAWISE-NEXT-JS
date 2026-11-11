import Link from "next/link";

export function Icon({
  name,
  className = "",
  size,
  filled,
}: {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? "fill-1" : ""} ${className}`}
      style={size ? { fontSize: size } : undefined}
    >
      {name}
    </span>
  );
}

/** Header halaman manajemen (judul + deskripsi + aksi di kanan). */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col items-start justify-between gap-4 md:mb-8 md:flex-row md:items-end lg:mb-12">
      <div>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="text-sm font-medium text-gray-500 md:text-base">{description}</p>}
      </div>
      {action}
    </header>
  );
}

/** Header sambutan di dashboard (ikon hitam besar + judul). */
export function WelcomeHeader({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <header className="mb-6 border-b border-gray-100 pb-6 md:mb-8 md:pb-8 lg:mb-12 lg:pb-12">
      <div className="flex flex-col items-start gap-4 md:flex-row md:gap-6 lg:gap-8">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-black text-white md:h-14 md:w-14 md:rounded-2xl lg:h-16 lg:w-16">
          <span className="material-symbols-outlined" style={{ fontSize: "clamp(20px, 4vw, 32px)" }}>
            school
          </span>
        </div>
        <div>
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight md:mb-3 md:text-3xl lg:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-relaxed font-light text-gray-500 md:text-base lg:text-lg">{children}</p>
        </div>
      </div>
    </header>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-6 lg:mb-12 lg:grid-cols-4">{children}</div>;
}

export function StatCard({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 md:rounded-2xl md:p-8">
      <p className="mb-2 text-2xl font-extrabold md:text-3xl lg:text-4xl">{value}</p>
      <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase md:text-xs">{label}</p>
    </div>
  );
}

/** Kartu menu di dashboard guru. */
export function MenuCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-black md:rounded-[32px] md:p-6 lg:p-8"
    >
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 transition-colors group-hover:bg-black group-hover:text-white md:mb-6 md:h-10 md:w-10 md:rounded-xl">
        <Icon name={icon} size={18} />
      </div>
      <h3 className="mb-1 text-sm font-bold md:mb-2 md:text-base">{title}</h3>
      <p className="text-[10px] leading-relaxed font-medium text-gray-500">{description}</p>
    </Link>
  );
}

/** Panel putih ber-border dengan judul ikon (dipakai untuk statistik & list). */
export function Panel({
  icon,
  title,
  badge,
  action,
  children,
  bodyClassName = "p-4 md:p-6",
}: {
  icon: string;
  title: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:rounded-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={18} className="text-gray-400" />
          <h3 className="text-sm font-bold md:text-base">{title}</h3>
        </div>
        {badge && <span className="rounded bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-400">{badge}</span>}
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function SectionTitle({ icon, title, right }: { icon: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between md:mb-6">
      <div className="flex items-center gap-2">
        <Icon name={icon} filled />
        <h2 className="text-lg font-bold md:text-xl">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[9px] font-bold tracking-widest text-gray-400 uppercase md:text-[10px]"
    >
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border-none bg-gray-50 px-3 py-2 text-xs font-medium outline-none placeholder:text-gray-400 focus:ring-1 focus:ring-black md:py-2.5";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-gray-800 md:py-2.5";

export function FormCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:mb-8 md:rounded-2xl md:p-6">
      <div className="mb-4 flex items-center gap-2 md:mb-6">
        <Icon name={icon} size={18} className="text-gray-400" />
        <h3 className="text-xs font-bold tracking-tight md:text-sm">{title}</h3>
      </div>
      {children}
    </section>
  );
}

type BadgeTone = "green" | "orange" | "red" | "gray" | "black";
const BADGE: Record<BadgeTone, string> = {
  green: "text-green-600 bg-green-50",
  orange: "text-orange-600 bg-orange-50",
  red: "text-red-600 bg-red-50",
  gray: "text-gray-500 bg-gray-100",
  black: "text-white bg-black",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`rounded px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${BADGE[tone]}`}>{children}</span>;
}

export function EmptyState({ icon = "inbox", text }: { icon?: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-gray-400">
      <Icon name={icon} size={32} className="text-gray-300" />
      <p className="text-xs font-medium">{text}</p>
    </div>
  );
}

/** Tabel gaya terrawise (header abu, kolom uppercase kecil). */
export function DataTable({
  columns,
  children,
}: {
  columns: { label: string; className?: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.label}
                  className={`px-4 py-3 text-[9px] font-black tracking-widest text-gray-400 uppercase md:px-6 md:py-5 md:text-[10px] lg:px-8 ${c.className ?? ""}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export const tdClass = "px-4 py-4 text-xs md:px-6 md:text-sm lg:px-8";

export function formatDate(d: Date | string, withTime = true) {
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function StatRows({ rows }: { rows: [string, number, string][] }) {
  return (
    <div className="space-y-2">
      {rows.map(([label, value, tone], i) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{label}</span>
          <span className={i === 0 ? "text-lg font-bold" : `text-sm font-medium ${tone}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export { ActionModal } from "./ui/Modal";
