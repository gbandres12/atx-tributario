import { db } from "./db";

export type Conta = { id: number; codigo: string; nome: string; natureza: "D" | "C"; analitica: number };

// [código, nome, natureza, analítica]
const PLANO: [string, string, "D" | "C", number][] = [
  ["1", "ATIVO", "D", 0], ["1.1", "Ativo Circulante", "D", 0],
  ["1.1.01", "Caixa", "D", 1], ["1.1.02", "Bancos Conta Movimento", "D", 1],
  ["1.1.03", "Clientes", "D", 1], ["1.1.04", "Estoques", "D", 1], ["1.1.05", "Impostos a Recuperar", "D", 1],
  ["1.2", "Ativo Não Circulante", "D", 0], ["1.2.01", "Imobilizado", "D", 1], ["1.2.02", "(-) Depreciação Acumulada", "C", 1],
  ["2", "PASSIVO", "C", 0], ["2.1", "Passivo Circulante", "C", 0],
  ["2.1.01", "Fornecedores", "C", 1], ["2.1.02", "Obrigações Trabalhistas", "C", 1],
  ["2.1.03", "Impostos a Recolher", "C", 1], ["2.1.04", "Empréstimos", "C", 1],
  ["2.3", "Patrimônio Líquido", "C", 0], ["2.3.01", "Capital Social", "C", 1], ["2.3.02", "Lucros/Prejuízos Acumulados", "C", 1],
  ["3", "RECEITAS", "C", 0], ["3.1.01", "Receita de Vendas", "C", 1], ["3.1.02", "Receita de Serviços", "C", 1],
  ["3.2.01", "(-) Deduções e Impostos sobre Vendas", "D", 1],
  ["4", "CUSTOS E DESPESAS", "D", 0], ["4.1.01", "Custo das Mercadorias Vendidas", "D", 1],
  ["4.2.01", "Despesas com Pessoal", "D", 1], ["4.2.02", "Despesas Administrativas", "D", 1],
  ["4.2.03", "Despesas Financeiras", "D", 1],
];

export function criarPlanoPadrao(clientId: number) {
  const ins = db.prepare("INSERT OR IGNORE INTO contas (client_id, codigo, nome, natureza, analitica) VALUES (?,?,?,?,?)");
  db.transaction(() => PLANO.forEach(([c, n, nat, a]) => ins.run(clientId, c, n, nat, a)))();
}

export const listarContas = (clientId: number) =>
  db.prepare("SELECT id, codigo, nome, natureza, analitica FROM contas WHERE client_id = ? ORDER BY codigo").all(clientId) as Conta[];

export type Linha = { conta_id: number; debito: number; credito: number };

export function lancar(clientId: number, data: string, historico: string, linhas: Linha[]) {
  const ls = linhas.filter((l) => l.debito || l.credito);
  if (!data || !historico.trim()) throw new Error("Data e histórico são obrigatórios");
  if (ls.length < 2) throw new Error("Informe ao menos duas linhas");
  if (ls.some((l) => l.debito < 0 || l.credito < 0 || (l.debito && l.credito)))
    throw new Error("Cada linha deve ter só débito ou só crédito, com valor positivo");
  const r = (n: number) => Math.round(n * 100);
  const d = ls.reduce((s, l) => s + r(l.debito), 0), c = ls.reduce((s, l) => s + r(l.credito), 0);
  if (d !== c) throw new Error(`Partidas dobradas não fecham: débito ${d / 100} ≠ crédito ${c / 100}`);
  const ids = new Set((db.prepare("SELECT id FROM contas WHERE client_id = ? AND analitica = 1").all(clientId) as { id: number }[]).map((x) => x.id));
  if (ls.some((l) => !ids.has(l.conta_id))) throw new Error("Conta inválida ou sintética");

  return db.transaction(() => {
    const id = db.prepare("INSERT INTO lancamentos (client_id, data, historico) VALUES (?,?,?)").run(clientId, data, historico.trim()).lastInsertRowid;
    const ins = db.prepare("INSERT INTO lancamento_linhas (lancamento_id, conta_id, debito, credito) VALUES (?,?,?,?)");
    ls.forEach((l) => ins.run(id, l.conta_id, l.debito, l.credito));
    return Number(id);
  })();
}

export type Movimento = { data: string; historico: string; debito: number; credito: number; saldo: number };

/** Livro Razão: movimentos da conta com saldo corrente conforme a natureza da conta. */
export function razao(clientId: number, contaId: number, de?: string, ate?: string) {
  const conta = db.prepare("SELECT * FROM contas WHERE id = ? AND client_id = ?").get(contaId, clientId) as Conta | undefined;
  if (!conta) return null;
  const sinal = (d: number, c: number) => (conta.natureza === "D" ? d - c : c - d);
  const ant = db.prepare(`SELECT COALESCE(SUM(l.debito),0) d, COALESCE(SUM(l.credito),0) c FROM lancamento_linhas l
    JOIN lancamentos x ON x.id = l.lancamento_id WHERE l.conta_id = ? AND x.data < ?`).get(contaId, de ?? "0000-00-00") as { d: number; c: number };
  let saldo = sinal(ant.d, ant.c);
  const saldoInicial = saldo;
  const rows = db.prepare(`SELECT x.data, x.historico, l.debito, l.credito FROM lancamento_linhas l
    JOIN lancamentos x ON x.id = l.lancamento_id
    WHERE l.conta_id = ? AND x.data >= ? AND x.data <= ? ORDER BY x.data, x.id, l.id`).all(contaId, de ?? "0000-00-00", ate ?? "9999-99-99") as Omit<Movimento, "saldo">[];
  const movs: Movimento[] = rows.map((m) => ({ ...m, saldo: (saldo += sinal(m.debito, m.credito)) }));
  return { conta, saldoInicial, movs, saldoFinal: saldo };
}

export function balancete(clientId: number) {
  return db.prepare(`SELECT c.codigo, c.nome, c.natureza, COALESCE(SUM(l.debito),0) debito, COALESCE(SUM(l.credito),0) credito
    FROM contas c LEFT JOIN lancamento_linhas l ON l.conta_id = c.id
    WHERE c.client_id = ? AND c.analitica = 1 GROUP BY c.id HAVING debito > 0 OR credito > 0 ORDER BY c.codigo`).all(clientId) as
    { codigo: string; nome: string; natureza: string; debito: number; credito: number }[];
}

type NotaRow = { id: number; numero: string; emissao: string; direcao: string; emitente_nome: string; dest_nome: string;
  v_nf: number; v_icms: number; v_pis: number; v_cofins: number; v_ipi: number };

export function notasPendentes(clientId: number) {
  return (db.prepare(`SELECT COUNT(*) n FROM notas WHERE client_id = ? AND id NOT IN (SELECT nota_id FROM lancamentos WHERE nota_id IS NOT NULL)`)
    .get(clientId) as { n: number }).n;
}

/**
 * Gera um lançamento por NF-e ainda não contabilizada.
 * Saída:  D Clientes / C Receita  e, fora do Simples, D Deduções / C Impostos a Recolher (ICMS+PIS+COFINS+IPI).
 * Entrada: D Estoques + D Impostos a Recuperar / C Fornecedores. Créditos: Simples nenhum; Presumido ICMS+IPI;
 * Real ICMS+IPI+PIS+COFINS. Não baixa estoque/CMV (custo não consta no XML de venda).
 */
export function gerarLancamentosDasNotas(clientId: number) {
  const cli = db.prepare("SELECT regime, atividade FROM clients WHERE id = ?").get(clientId) as { regime: string; atividade: string };
  if (listarContas(clientId).length === 0) criarPlanoPadrao(clientId);
  const cid = (codigo: string) => (db.prepare("SELECT id FROM contas WHERE client_id = ? AND codigo = ?").get(clientId, codigo) as { id: number } | undefined)?.id;
  const C = { clientes: cid("1.1.03"), estoque: cid("1.1.04"), recup: cid("1.1.05"), forn: cid("2.1.01"), recolher: cid("2.1.03"),
    recVenda: cid("3.1.01"), recServ: cid("3.1.02"), deducao: cid("3.2.01") };
  if (Object.values(C).some((v) => !v)) throw new Error("Plano de contas incompleto: faltam contas padrão (1.1.03, 1.1.04, 1.1.05, 2.1.01, 2.1.03, 3.1.01, 3.1.02, 3.2.01)");
  const c2 = (n: number) => Math.round(n * 100) / 100;

  const notas = db.prepare(`SELECT * FROM notas WHERE client_id = ? AND id NOT IN (SELECT nota_id FROM lancamentos WHERE nota_id IS NOT NULL) ORDER BY emissao, id`)
    .all(clientId) as NotaRow[];

  return db.transaction(() => {
    let gerados = 0;
    for (const n of notas) {
      const linhas: Linha[] = [];
      if (n.direcao === "saida") {
        linhas.push({ conta_id: C.clientes!, debito: n.v_nf, credito: 0 });
        linhas.push({ conta_id: cli.atividade === "servico" ? C.recServ! : C.recVenda!, debito: 0, credito: n.v_nf });
        const imp = cli.regime === "simples" ? 0 : c2(n.v_icms + n.v_pis + n.v_cofins + n.v_ipi);
        if (imp > 0) {
          linhas.push({ conta_id: C.deducao!, debito: imp, credito: 0 });
          linhas.push({ conta_id: C.recolher!, debito: 0, credito: imp });
        }
      } else {
        const cred = cli.regime === "simples" ? 0 : cli.regime === "presumido" ? c2(n.v_icms + n.v_ipi) : c2(n.v_icms + n.v_ipi + n.v_pis + n.v_cofins);
        linhas.push({ conta_id: C.estoque!, debito: c2(n.v_nf - cred), credito: 0 });
        if (cred > 0) linhas.push({ conta_id: C.recup!, debito: cred, credito: 0 });
        linhas.push({ conta_id: C.forn!, debito: 0, credito: n.v_nf });
      }
      const hist = `NF-e ${n.numero} - ${n.direcao === "saida" ? `venda a ${n.dest_nome || "cliente"}` : `compra de ${n.emitente_nome || "fornecedor"}`}`;
      const id = lancar(clientId, n.emissao, hist, linhas);
      db.prepare("UPDATE lancamentos SET nota_id = ? WHERE id = ?").run(n.id, id);
      gerados++;
    }
    return gerados;
  })();
}

type Saldo = { codigo: string; nome: string; valor: number };

function somas(clientId: number, de: string, ate: string) {
  return db.prepare(`SELECT c.codigo, c.nome, COALESCE(SUM(l.debito),0) d, COALESCE(SUM(l.credito),0) c
    FROM contas c JOIN lancamento_linhas l ON l.conta_id = c.id JOIN lancamentos x ON x.id = l.lancamento_id
    WHERE c.client_id = ? AND c.analitica = 1 AND x.data >= ? AND x.data <= ? GROUP BY c.id ORDER BY c.codigo`)
    .all(clientId, de, ate) as { codigo: string; nome: string; d: number; c: number }[];
}
const soma = (xs: Saldo[]) => Math.round(xs.reduce((s, x) => s + x.valor, 0) * 100) / 100;
const r2 = (n: number) => Math.round(n * 100) / 100;

export function dre(clientId: number, de: string, ate: string) {
  const all = somas(clientId, de, ate);
  const cred = (p: string): Saldo[] => all.filter((a) => a.codigo.startsWith(p)).map((a) => ({ codigo: a.codigo, nome: a.nome, valor: r2(a.c - a.d) }));
  const deb = (p: string): Saldo[] => all.filter((a) => a.codigo.startsWith(p)).map((a) => ({ codigo: a.codigo, nome: a.nome, valor: r2(a.d - a.c) }));
  const receita = cred("3.1"), deducoes = deb("3.2"), cmv = deb("4.1");
  const despesas = deb("4.2").filter((a) => a.codigo !== "4.2.03"), financeiras = deb("4.2.03");
  const rb = soma(receita), ded = soma(deducoes), rl = r2(rb - ded);
  const lb = r2(rl - soma(cmv)), ro = r2(lb - soma(despesas)), res = r2(ro - soma(financeiras));
  return { receita, deducoes, cmv, despesas, financeiras, rb, ded, rl, lb, ro, res };
}

export function balanco(clientId: number, ate: string) {
  const all = somas(clientId, "0000-00-00", ate);
  const ativo = (p: string): Saldo[] => all.filter((a) => a.codigo.startsWith(p)).map((a) => ({ codigo: a.codigo, nome: a.nome, valor: r2(a.d - a.c) }));
  const passivo = (p: string): Saldo[] => all.filter((a) => a.codigo.startsWith(p)).map((a) => ({ codigo: a.codigo, nome: a.nome, valor: r2(a.c - a.d) }));
  const circ = ativo("1.1"), ncirc = ativo("1.2"), pc = passivo("2.1"), pl = passivo("2.3");
  // Resultado acumulado ainda não encerrado (receitas - despesas) entra no PL.
  const resultado = r2(all.filter((a) => /^[34]/.test(a.codigo)).reduce((s, a) => s + (a.c - a.d), 0));
  const totalAtivo = r2(soma(circ) + soma(ncirc));
  const totalPassivo = r2(soma(pc) + soma(pl) + resultado);
  return { circ, ncirc, pc, pl, resultado, totalAtivo, totalPassivo, fecha: totalAtivo === totalPassivo };
}
