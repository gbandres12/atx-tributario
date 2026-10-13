"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type R = { arquivo: string; ok: boolean; erro?: string; direcao?: string; valor?: number };

export default function XmlUpload({ clientId }: { clientId: number }) {
  const [res, setRes] = useState<R[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function send(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const fd = new FormData();
    [...files].forEach((f) => fd.append("xml", f));
    const r = await fetch(`/api/clients/${clientId}/xml`, { method: "POST", body: fd });
    setRes(await r.json());
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="card space-y-3">
      <h3 className="font-semibold">Importar XML de NF-e</h3>
      <input type="file" accept=".xml" multiple disabled={busy} onChange={(e) => send(e.target.files)} className="text-sm" />
      {busy && <p className="text-sm text-muted">Processando…</p>}
      <ul className="space-y-1 text-sm">
        {res.map((r, i) => (
          <li key={i} className={r.ok ? "text-teal" : "text-red-400"}>
            {r.arquivo}: {r.ok ? `importada (${r.direcao})` : r.erro}
          </li>
        ))}
      </ul>
    </div>
  );
}
