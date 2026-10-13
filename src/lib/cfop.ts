export type Cfop = { codigo: string; descricao: string; tipo: "entrada" | "saida" };

// Seleção dos CFOPs mais usados. Ampliar conforme a necessidade da carteira.
export const CFOPS: Cfop[] = [
  { codigo: "1102", tipo: "entrada", descricao: "Compra para comercialização (dentro do estado)" },
  { codigo: "1101", tipo: "entrada", descricao: "Compra para industrialização (dentro do estado)" },
  { codigo: "1152", tipo: "entrada", descricao: "Transferência para comercialização (dentro do estado)" },
  { codigo: "1202", tipo: "entrada", descricao: "Devolução de venda de mercadoria adquirida de terceiros" },
  { codigo: "1403", tipo: "entrada", descricao: "Compra para comercialização em operação com ST" },
  { codigo: "1556", tipo: "entrada", descricao: "Compra de material para uso ou consumo" },
  { codigo: "1933", tipo: "entrada", descricao: "Aquisição de serviço tributado pelo ISSQN" },
  { codigo: "2102", tipo: "entrada", descricao: "Compra para comercialização (de outro estado)" },
  { codigo: "2101", tipo: "entrada", descricao: "Compra para industrialização (de outro estado)" },
  { codigo: "2403", tipo: "entrada", descricao: "Compra para comercialização em operação com ST (outro estado)" },
  { codigo: "5102", tipo: "saida", descricao: "Venda de mercadoria adquirida de terceiros (dentro do estado)" },
  { codigo: "5101", tipo: "saida", descricao: "Venda de produção do estabelecimento (dentro do estado)" },
  { codigo: "5403", tipo: "saida", descricao: "Venda de mercadoria sujeita a ST, como substituto tributário" },
  { codigo: "5405", tipo: "saida", descricao: "Venda de mercadoria sujeita a ST, como substituído" },
  { codigo: "5202", tipo: "saida", descricao: "Devolução de compra para comercialização" },
  { codigo: "5949", tipo: "saida", descricao: "Outra saída de mercadoria não especificada" },
  { codigo: "5933", tipo: "saida", descricao: "Prestação de serviço tributado pelo ISSQN (NF-e)" },
  { codigo: "6102", tipo: "saida", descricao: "Venda de mercadoria adquirida de terceiros (para outro estado)" },
  { codigo: "6101", tipo: "saida", descricao: "Venda de produção do estabelecimento (para outro estado)" },
  { codigo: "6108", tipo: "saida", descricao: "Venda a não contribuinte (outro estado)" },
  { codigo: "6404", tipo: "saida", descricao: "Venda de mercadoria sujeita a ST (outro estado)" },
  { codigo: "7102", tipo: "saida", descricao: "Venda para o exterior de mercadoria adquirida de terceiros" },
];

export function buscarCfop(q: string): Cfop[] {
  const t = q.trim().toLowerCase();
  if (!t) return CFOPS;
  return CFOPS.filter((c) => c.codigo.startsWith(t) || c.descricao.toLowerCase().includes(t));
}

/** CFOP começando em 1/2/3 = entrada; 5/6/7 = saída. */
export const direcaoDoCfop = (cfop: string): "entrada" | "saida" =>
  "123".includes(cfop[0]) ? "entrada" : "saida";
