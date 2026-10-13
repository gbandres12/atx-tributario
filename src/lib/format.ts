export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtCnpj = (c: string) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
export const REGIMES: Record<string, string> = { simples: "Simples Nacional", presumido: "Lucro Presumido", real: "Lucro Real" };
