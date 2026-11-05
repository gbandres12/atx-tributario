import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nexum Fiscal · ATX Tributário" };

const recursos = [
  ["Conciliação de informações", "Cruza notas emitidas, entradas, faturamento e recebimentos para apontar divergências antes do fechamento."],
  ["Imposto sobre faturamento", "Mostra o percentual de imposto sobre o faturamento do cliente, mês a mês, para decisões mais seguras."],
  ["Apuração e obrigações", "Apuração mensal, calendário de obrigações e fechamento organizados por cliente."],
  ["Notas e folha em um só lugar", "Emissão e entrada de notas, equipe e folha de pagamento integradas ao mesmo painel."],
];

// Dados ilustrativos: não correspondem a nenhum cliente real.
const barras = [38, 52, 44, 61, 57, 70];
const meses = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"];

export default function NexumFiscal() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-3">
        <span className="rounded-full border border-line px-3 py-1 text-xs tracking-widest text-muted">UM SISTEMA DA ATX TRIBUTÁRIO</span>
        <h1 className="text-4xl font-bold"><span className="text-violet">Nexum</span> <span className="text-teal">Fiscal</span></h1>
        <p className="max-w-2xl text-lg text-muted">
          Nosso sistema próprio de gestão fiscal: concilia as informações do seu negócio e mostra, de forma clara,
          quanto de imposto pesa sobre o seu faturamento.
        </p>
      </header>

      <section aria-label="Demonstração ilustrativa" className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Visão do cliente</h2>
          <span className="rounded-full bg-background px-3 py-1 text-xs text-muted">Dados ilustrativos</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[["Faturamento", "R$ 000.000,00"], ["Imposto sobre faturamento", "0,0%"], ["Divergências conciliadas", "100%"]].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-line bg-background/50 p-4">
              <div className="text-xs text-muted">{l}</div>
              <div className="mt-1 text-2xl font-semibold text-teal">{v}</div>
            </div>
          ))}
        </div>
        <div className="flex h-44 items-end gap-3 rounded-xl border border-line bg-background/50 p-4">
          {barras.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-md bg-gradient-to-t from-violet to-teal" style={{ height: `${h * 1.3}px` }} />
              <span className="text-xs text-muted">{meses[i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {recursos.map(([t, d]) => (
          <div key={t} className="card">
            <h3 className="font-semibold text-teal">{t}</h3>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
