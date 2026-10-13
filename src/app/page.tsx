import Link from "next/link";
import { db } from "@/lib/db";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Home() {
  const k = db.prepare(`SELECT
    (SELECT COUNT(*) FROM clients) clientes,
    (SELECT COALESCE(SUM(honorario),0) FROM clients) receita,
    (SELECT COUNT(*) FROM notas) notas,
    (SELECT COALESCE(SUM(v_icms),0) FROM notas WHERE direcao='saida') icms`).get() as Record<string, number>;
  const cards = [
    ["Clientes ativos", String(k.clientes)],
    ["Honorários / mês", brl(k.receita)],
    ["Notas importadas", String(k.notas)],
    ["ICMS nas saídas", brl(k.icms)],
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel</h1>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="card">
            <div className="text-sm text-muted">{l}</div>
            <div className="mt-1 text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <Link href="/clients/new" className="btn inline-block">+ Novo cliente</Link>
    </div>
  );
}
