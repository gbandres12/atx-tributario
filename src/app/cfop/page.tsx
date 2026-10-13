import { buscarCfop } from "@/lib/cfop";

export default async function CfopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const rows = buscarCfop(q);
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Consulta CFOP</h1>
      <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Código ou descrição…" className="input" /><button className="btn">Buscar</button></form>
      <div className="card divide-y divide-line p-0">
        {rows.map((c) => (
          <div key={c.codigo} className="flex gap-4 px-5 py-3 text-sm">
            <span className="w-14 font-mono text-teal">{c.codigo}</span>
            <span className="flex-1">{c.descricao}</span>
            <span className="text-muted">{c.tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
