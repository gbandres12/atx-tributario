import Link from "next/link";
import { db } from "@/lib/db";
import { brl, fmtCnpj, REGIMES } from "@/lib/format";

export const dynamic = "force-dynamic";

type C = { id: number; razao_social: string; cnpj: string; regime: string; honorario: number };

export default function Clients() {
  const rows = db.prepare("SELECT id, razao_social, cnpj, regime, honorario FROM clients ORDER BY razao_social").all() as C[];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link href="/clients/new" className="btn">+ Novo cliente</Link>
      </div>
      <div className="card divide-y divide-line p-0">
        {rows.length === 0 && <p className="p-5 text-sm text-muted">Nenhum cliente cadastrado ainda.</p>}
        {rows.map((c) => (
          <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-background/40">
            <div>
              <div className="font-medium">{c.razao_social}</div>
              <div className="text-xs text-muted">{fmtCnpj(c.cnpj)} · {REGIMES[c.regime]}</div>
            </div>
            <div className="text-sm text-teal">{brl(c.honorario)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
