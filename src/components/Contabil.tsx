import Link from "next/link";
import { balancete, listarContas, notasPendentes, razao } from "@/lib/contabil";
import { brl } from "@/lib/format";
import Lancamento from "./Lancamento";
import GerarNotasButton from "./GerarNotasButton";
import PlanoButton from "./PlanoButton";

const dt = (d: string) => d.split("-").reverse().join("/");

export default function Contabil({ clientId, conta, de, ate }: { clientId: number; conta?: string; de?: string; ate?: string }) {
  const contas = listarContas(clientId);
  const pend = notasPendentes(clientId);
  if (contas.length === 0)
    return <div className="card space-y-3"><p className="text-sm text-muted">Este cliente ainda não tem plano de contas.</p><PlanoButton clientId={clientId} />{pend > 0 && <GerarNotasButton clientId={clientId} pendentes={pend} />}</div>;

  const analiticas = contas.filter((c) => c.analitica);
  const r = conta ? razao(clientId, Number(conta), de || undefined, ate || undefined) : null;
  const bal = balancete(clientId);
  const tD = bal.reduce((s, b) => s + b.debito, 0), tC = bal.reduce((s, b) => s + b.credito, 0);

  return (
    <div className="space-y-6">
      <GerarNotasButton clientId={clientId} pendentes={pend} />
      <Lancamento clientId={clientId} contas={analiticas} />

      <div className="card space-y-4">
        <h3 className="font-semibold">Livro Razão</h3>
        <form className="flex flex-wrap gap-3">
          <input type="hidden" name="tab" value="contabil" />
          <select name="conta" defaultValue={conta} className="input max-w-sm">
            <option value="">Selecione a conta…</option>
            {analiticas.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nome}</option>)}
          </select>
          <input type="date" name="de" defaultValue={de} className="input w-40" />
          <input type="date" name="ate" defaultValue={ate} className="input w-40" />
          <button className="btn">Ver razão</button>
        </form>
        {r && (
          <table className="w-full text-sm">
            <caption className="mb-2 text-left text-muted">{r.conta.codigo} · {r.conta.nome} (saldo normal {r.conta.natureza === "D" ? "devedor" : "credor"})</caption>
            <thead className="text-left text-muted"><tr><th className="pb-2">Data</th><th>Histórico</th><th className="text-right">Débito</th><th className="text-right">Crédito</th><th className="text-right">Saldo</th></tr></thead>
            <tbody>
              <tr className="border-t border-line text-muted"><td colSpan={4} className="py-2">Saldo inicial</td><td className="text-right">{brl(r.saldoInicial)}</td></tr>
              {r.movs.map((m, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-2">{dt(m.data)}</td><td>{m.historico}</td>
                  <td className="text-right">{m.debito ? brl(m.debito) : ""}</td><td className="text-right">{m.credito ? brl(m.credito) : ""}</td>
                  <td className="text-right">{brl(m.saldo)}</td>
                </tr>
              ))}
              <tr className="border-t border-line font-semibold text-teal"><td colSpan={4} className="py-2">Saldo final</td><td className="text-right">{brl(r.saldoFinal)}</td></tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="card overflow-x-auto">
        <h3 className="mb-3 font-semibold">Balancete de verificação</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-muted"><tr><th className="pb-2">Conta</th><th className="text-right">Débito</th><th className="text-right">Crédito</th></tr></thead>
          <tbody>
            {bal.length === 0 && <tr><td colSpan={3} className="py-3 text-muted">Sem lançamentos.</td></tr>}
            {bal.map((b) => (
              <tr key={b.codigo} className="border-t border-line">
                <td className="py-2"><Link className="hover:text-teal" href={`?tab=contabil&conta=${contas.find((c) => c.codigo === b.codigo)!.id}`}>{b.codigo} · {b.nome}</Link></td>
                <td className="text-right">{brl(b.debito)}</td><td className="text-right">{brl(b.credito)}</td>
              </tr>
            ))}
            <tr className="border-t border-line font-semibold"><td className="py-2">Totais {Math.round(tD * 100) === Math.round(tC * 100) ? "✓" : "✗ não fecha"}</td><td className="text-right">{brl(tD)}</td><td className="text-right">{brl(tC)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
