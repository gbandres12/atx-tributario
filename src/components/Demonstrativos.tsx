import { balanco, dre, listarContas } from "@/lib/contabil";
import { brl } from "@/lib/format";

type S = { codigo: string; nome: string; valor: number };

const Grupo = ({ itens }: { itens: S[] }) => (
  <>{itens.filter((i) => i.valor !== 0).map((i) => (
    <tr key={i.codigo} className="text-muted"><td className="py-1 pl-6">{i.codigo} · {i.nome}</td><td className="text-right">{brl(i.valor)}</td></tr>
  ))}</>
);
const Total = ({ l, v, forte }: { l: string; v: number; forte?: boolean }) => (
  <tr className={`border-t border-line ${forte ? "font-bold text-teal" : "font-semibold"}`}><td className="py-2">{l}</td><td className="text-right">{brl(v)}</td></tr>
);

export default function Demonstrativos({ clientId, de, ate }: { clientId: number; de?: string; ate?: string }) {
  if (listarContas(clientId).length === 0) return <div className="card text-sm text-muted">Crie o plano de contas na aba Contábil primeiro.</div>;
  const hoje = new Date().toISOString().slice(0, 10);
  const fim = ate || hoje, ini = de || `${fim.slice(0, 4)}-01-01`;
  const d = dre(clientId, ini, fim), b = balanco(clientId, fim);

  return (
    <div className="space-y-6">
      <form className="card flex flex-wrap items-end gap-3">
        <input type="hidden" name="tab" value="demonstrativos" />
        <label className="text-sm"><span className="mb-1 block text-muted">De</span><input type="date" name="de" defaultValue={ini} className="input" /></label>
        <label className="text-sm"><span className="mb-1 block text-muted">Até (data do balanço)</span><input type="date" name="ate" defaultValue={fim} className="input" /></label>
        <button className="btn">Atualizar</button>
      </form>

      <div className="card">
        <h3 className="mb-3 font-semibold">DRE — {ini.split("-").reverse().join("/")} a {fim.split("-").reverse().join("/")}</h3>
        <table className="w-full text-sm"><tbody>
          <Total l="(+) Receita Bruta" v={d.rb} /><Grupo itens={d.receita} />
          <Total l="(−) Deduções e Impostos" v={d.ded} /><Grupo itens={d.deducoes} />
          <Total l="(=) Receita Líquida" v={d.rl} />
          <Total l="(−) Custo das Mercadorias/Serviços" v={d.cmv.reduce((s, x) => s + x.valor, 0)} /><Grupo itens={d.cmv} />
          <Total l="(=) Lucro Bruto" v={d.lb} />
          <Total l="(−) Despesas Operacionais" v={d.despesas.reduce((s, x) => s + x.valor, 0)} /><Grupo itens={d.despesas} />
          <Total l="(=) Resultado Operacional" v={d.ro} />
          <Total l="(−) Despesas Financeiras" v={d.financeiras.reduce((s, x) => s + x.valor, 0)} /><Grupo itens={d.financeiras} />
          <Total l="(=) Resultado do Período" v={d.res} forte />
        </tbody></table>
        <p className="mt-3 text-xs text-muted">IRPJ/CSLL do Lucro Presumido/Real ainda não são provisionados nesta DRE.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 font-semibold">Balanço — Ativo em {fim.split("-").reverse().join("/")}</h3>
          <table className="w-full text-sm"><tbody>
            <Total l="Ativo Circulante" v={b.circ.reduce((s, x) => s + x.valor, 0)} /><Grupo itens={b.circ} />
            <Total l="Ativo Não Circulante" v={b.ncirc.reduce((s, x) => s + x.valor, 0)} /><Grupo itens={b.ncirc} />
            <Total l="TOTAL DO ATIVO" v={b.totalAtivo} forte />
          </tbody></table>
        </div>
        <div className="card">
          <h3 className="mb-3 font-semibold">Passivo e Patrimônio Líquido</h3>
          <table className="w-full text-sm"><tbody>
            <Total l="Passivo Circulante" v={b.pc.reduce((s, x) => s + x.valor, 0)} /><Grupo itens={b.pc} />
            <Total l="Patrimônio Líquido" v={b.pl.reduce((s, x) => s + x.valor, 0) + b.resultado} /><Grupo itens={b.pl} />
            <tr className="text-muted"><td className="py-1 pl-6">Resultado acumulado (não encerrado)</td><td className="text-right">{brl(b.resultado)}</td></tr>
            <Total l="TOTAL DO PASSIVO + PL" v={b.totalPassivo} forte />
          </tbody></table>
        </div>
      </div>
      <p className={`text-sm ${b.fecha ? "text-teal" : "text-red-400"}`}>{b.fecha ? "✓ Ativo = Passivo + PL" : "✗ O balanço não fecha: verifique os lançamentos."}</p>
    </div>
  );
}
