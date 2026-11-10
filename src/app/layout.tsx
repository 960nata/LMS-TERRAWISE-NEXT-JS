import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terrawise Clone",
  description: "LMS berbasis Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
