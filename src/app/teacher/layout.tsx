import RoleShell from "@/components/shell/RoleShell";

export const instant = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleShell>{children}</RoleShell>;
}
