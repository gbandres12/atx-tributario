import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const metadata: Metadata = { title: "ATX Contábil" };

const nav = [
  { href: "/", label: "Painel" },
  { href: "/clients", label: "Clientes" },
  { href: "/cfop", label: "Consulta CFOP" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="flex min-h-screen font-sans antialiased">
        <aside className="w-56 shrink-0 border-r border-line p-5">
          <div className="mb-8 text-lg font-bold text-teal">ATX Contábil</div>
          <nav className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-panel hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}
