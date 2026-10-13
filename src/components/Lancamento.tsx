"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Conta = { id: number; codigo: string; nome: string };
type L = { conta_id: string; debito: string; credito: string };
const vazia = (): L => ({ conta_id: "", debito: "", credito: "" });

export default function Lancamento({ clientId, contas }: { clientId: number; contas: Conta[] }) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [historico, setHistorico] = useState("");
  const [linhas, setLinhas] = useState<L[]>([vazia(), vazia()]);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const router = useRouter();

  const n = (v: string) => Number(v.replace(",", ".")) || 0;
  const dif = linhas.reduce((s, l) => s + n(l.debito) - n(l.credito), 0);
  const set = (i: number, k: keyof L, v: string) => setLinhas(linhas.map((l, j) => (j === i ? { ...l, [k]: v } : l)));

  async function salvar() {
    const r = await fetch(`/api/clients/${clientId}/contabil`, {
      method: "POST",
      body: JSON.stringify({ data, historico, linhas: linhas.map((l) => ({ conta_id: Number(l.conta_id), debito: n(l.debito), credito: n(l.credito) })) }),
    });
    const j = await r.json();
    if (r.ok) { setMsg({ ok: true, t: "Lançamento registrado" }); setHistorico(""); setLinhas([vazia(), vazia()]); router.refresh(); }
    else setMsg({ ok: false, t: j.error });
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Novo lançamento</h3>
      <div className="grid grid-cols-[10rem_1fr] gap-3">
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input" />
        <input placeholder="Histórico" value={historico} onChange={(e) => setHistorico(e.target.value)} className="input" />
      </div>
      {linhas.map((l, i) => (
        <div key={i} className="grid grid-cols-[1fr_8rem_8rem] gap-3">
          <select value={l.conta_id} onChange={(e) => set(i, "conta_id", e.target.value)} className="input">
            <option value="">Conta…</option>
            {contas.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nome}</option>)}
          </select>
          <input placeholder="Débito" value={l.debito} onChange={(e) => set(i, "debito", e.target.value)} className="input" />
          <input placeholder="Crédito" value={l.credito} onChange={(e) => set(i, "credito", e.target.value)} className="input" />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setLinhas([...linhas, vazia()])} className="text-sm text-teal">+ linha</button>
        <span className={`text-sm ${Math.abs(dif) < 0.005 ? "text-teal" : "text-red-400"}`}>
          {Math.abs(dif) < 0.005 ? "Partidas fecham" : `Diferença: ${dif.toFixed(2)}`}
        </span>
        <button onClick={salvar} className="btn ml-auto">Lançar</button>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-teal" : "text-red-400"}`}>{msg.t}</p>}
    </div>
  );
}
