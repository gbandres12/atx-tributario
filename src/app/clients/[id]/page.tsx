import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { apurar } from "@/lib/nfe";
import { brl, fmtCnpj, REGIMES } from "@/lib/format";
import XmlUpload from "@/components/XmlUpload";
import Demonstrativos from "@/components/Demonstrativos";
import Contabil from "@/components/Contabil";
import BiChart from "@/components/BiChart";

export const dynamic = "force-dynamic";

const TABS = [["cadastro", "Cadastro"], ["fiscal", "Fiscal"], ["contabil", "Contábil"], ["demonstrativos", "DRE e Balanço"], ["bi", "BI"]] as const;

export default async function ClientPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; conta?: string; de?: string; ate?: string }>;
}) {
  const { id } = await params;
  const { tab = "cadastro", conta, de, ate } = await searchParams;
  const c = db.prepare("SELECT * FROM clients WHERE id = ?").get(Number(id)) as Record<string, string | number> | undefined;
  if (!c) notFound();
  const cid = Number(id);
  const apur = apurar(cid);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{c.razao_social}</h1>
        <p className="text-sm text-muted">{fmtCnpj(String(c.cnpj))} · {REGIMES[String(c.regime)]}</p>
      </div>
      <div className="flex gap-2">
        {TABS.map(([k, l]) => (
          <Link key={k} href={`/clients/${id}?tab=${k}`}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === k ? "bg-gradient-to-r from-teal to-cyan-600 font-semibold text-black" : "border border-line text-muted"}`}>
            {l}
          </Link>
        ))}
      </div>

      {tab === "cadastro" && (
        <div className="card grid max-w-2xl grid-cols-2 gap-4 text-sm">
          {[["Nome fantasia", c.nome_fantasia], ["Atividade", c.atividade], ["E-mail", c.email], ["Telefone", c.telefone],
            ["Honorário", brl(Number(c.honorario))], ["Vencimento", `dia ${c.vencimento_dia}`], ["Serviços", c.servicos], ["Observações", c.observacoes]]
            .map(([l, v]) => (<div key={String(l)}><div className="text-muted">{l}</div><div>{v || "—"}</div></div>))}
        </div>
      )}

      {tab === "fiscal" && (
        <div className="space-y-6">
          <XmlUpload clientId={cid} />
          <div className="card overflow-x-auto">
            <h3 className="mb-3 font-semibold">Apuração mensal (débito x crédito)</h3>
            {c.regime === "simples" && <p className="mb-3 text-xs text-muted">Simples Nacional recolhe via DAS; os valores abaixo são informativos.</p>}
            <table className="w-full text-sm">
              <thead className="text-left text-muted"><tr>
                {["Competência", "Saídas", "Entradas", "ICMS déb.", "ICMS créd.", "ICMS a recolher", "PIS déb.", "COFINS déb."].map((h) => <th key={h} className="pb-2 pr-4">{h}</th>)}
              </tr></thead>
              <tbody>
                {apur.length === 0 && <tr><td colSpan={8} className="py-3 text-muted">Importe XMLs para ver a apuração.</td></tr>}
                {apur.map((a) => (
                  <tr key={a.competencia} className="border-t border-line">
                    <td className="py-2 pr-4">{a.competencia}</td><td>{brl(a.saidas)}</td><td>{brl(a.entradas)}</td>
                    <td>{brl(a.icmsDebito)}</td><td>{brl(a.icmsCredito)}</td>
                    <td className="font-semibold text-teal">{brl(a.icmsRecolher)}</td>
                    <td>{brl(a.pisDebito)}</td><td>{brl(a.cofinsDebito)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {c.atividade === "servico" && (
            <div className="card text-sm text-muted">Cliente de serviço: a emissão de NFS-e será configurada em módulo próprio (município/prefeitura).</div>
          )}
        </div>
      )}

      {tab === "contabil" && <Contabil clientId={cid} conta={conta} de={de} ate={ate} />}

      {tab === "demonstrativos" && <Demonstrativos clientId={cid} de={de} ate={ate} />}

      {tab === "bi" && (
        <div className="card">
          <h3 className="mb-3 font-semibold">Entradas x Saídas por mês</h3>
          <BiChart data={[...apur].reverse().map((a) => ({ mes: a.competencia, saidas: a.saidas, entradas: a.entradas }))} />
        </div>
      )}
    </div>
  );
}
