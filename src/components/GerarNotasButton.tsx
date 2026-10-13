"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GerarNotasButton({ clientId, pendentes }: { clientId: number; pendentes: number }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  return (
    <div className="card flex items-center gap-4">
      <div className="flex-1 text-sm">
        <div className="font-semibold">Lançamentos automáticos das NF-e</div>
        <div className="text-muted">{pendentes ? `${pendentes} nota(s) ainda não contabilizada(s).` : "Todas as notas importadas já foram contabilizadas."}</div>
        {msg && <div className="mt-1 text-teal">{msg}</div>}
      </div>
      <button className="btn disabled:opacity-40" disabled={!pendentes} onClick={async () => {
        const r = await fetch(`/api/clients/${clientId}/contabil`, { method: "POST", body: JSON.stringify({ acao: "notas" }) });
        const j = await r.json();
        setMsg(r.ok ? `${j.gerados} lançamento(s) gerado(s)` : j.error);
        router.refresh();
      }}>Gerar lançamentos</button>
    </div>
  );
}
