import { XMLParser } from "fast-xml-parser";
import { db } from "./db";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", parseTagValue: false });
const arr = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const num = (v: unknown) => (v === undefined || v === null || v === "" ? 0 : Number(v));

/* eslint-disable @typescript-eslint/no-explicit-any */
function impostoDoItem(imposto: any) {
  const icmsGrupo = imposto?.ICMS ? Object.values(imposto.ICMS)[0] : undefined;
  const pis = imposto?.PIS ? Object.values(imposto.PIS)[0] : undefined;
  const cofins = imposto?.COFINS ? Object.values(imposto.COFINS)[0] : undefined;
  const ipi = imposto?.IPI?.IPITrib;
  return {
    icms: num((icmsGrupo as any)?.vICMS),
    pis: num((pis as any)?.vPIS),
    cofins: num((cofins as any)?.vCOFINS),
    ipi: num(ipi?.vIPI),
  };
}

export function importarXml(clientId: number, cnpjCliente: string, xml: string) {
  const doc = parser.parse(xml);
  const inf = (doc.nfeProc?.NFe ?? doc.NFe)?.infNFe;
  if (!inf) throw new Error("XML não é uma NF-e válida (infNFe ausente)");

  const chave = String(inf["@_Id"] ?? "").replace(/^NFe/, "");
  const emitCnpj = String(inf.emit?.CNPJ ?? "");
  const destCnpj = String(inf.dest?.CNPJ ?? inf.dest?.CPF ?? "");
  const limpo = cnpjCliente.replace(/\D/g, "");
  if (emitCnpj !== limpo && destCnpj !== limpo)
    throw new Error("O CNPJ do cliente não consta como emitente nem destinatário desta nota");
  const direcao = emitCnpj === limpo ? "saida" : "entrada";

  const tot = inf.total?.ICMSTot ?? {};
  const itens = arr<any>(inf.det).map((d) => {
    const imp = impostoDoItem(d.imposto);
    return {
      descricao: d.prod?.xProd, ncm: d.prod?.NCM, cfop: String(d.prod?.CFOP ?? ""),
      v_prod: num(d.prod?.vProd), v_icms: imp.icms, v_pis: imp.pis, v_cofins: imp.cofins, v_ipi: imp.ipi,
    };
  });

  const tx = db.transaction(() => {
    const info = db.prepare(`INSERT INTO notas
      (client_id, chave, numero, serie, emissao, direcao, emitente_cnpj, emitente_nome, dest_cnpj, dest_nome,
       v_nf, v_icms, v_pis, v_cofins, v_ipi, v_st)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      clientId, chave, inf.ide?.nNF, inf.ide?.serie, String(inf.ide?.dhEmi ?? inf.ide?.dEmi ?? "").slice(0, 10),
      direcao, emitCnpj, inf.emit?.xNome, destCnpj, inf.dest?.xNome,
      num(tot.vNF), num(tot.vICMS), num(tot.vPIS), num(tot.vCOFINS), num(tot.vIPI), num(tot.vST));
    const ins = db.prepare(`INSERT INTO nota_itens (nota_id, descricao, ncm, cfop, v_prod, v_icms, v_pis, v_cofins, v_ipi)
      VALUES (?,?,?,?,?,?,?,?,?)`);
    for (const i of itens) ins.run(info.lastInsertRowid, i.descricao, i.ncm, i.cfop, i.v_prod, i.v_icms, i.v_pis, i.v_cofins, i.v_ipi);
    return { chave, direcao, itens: itens.length, valor: num(tot.vNF) };
  });
  return tx();
}

export type Apuracao = {
  competencia: string;
  saidas: number; entradas: number;
  icmsDebito: number; icmsCredito: number; icmsRecolher: number;
  pisDebito: number; pisCredito: number; cofinsDebito: number; cofinsCredito: number;
  ipiDebito: number; ipiCredito: number;
};

/** Apuração mensal pelo método de débito x crédito (não-cumulativo/ICMS). Simples Nacional usa DAS, tratado à parte. */
export function apurar(clientId: number): Apuracao[] {
  const rows = db.prepare(`
    SELECT substr(emissao,1,7) AS competencia, direcao,
      SUM(v_nf) nf, SUM(v_icms) icms, SUM(v_pis) pis, SUM(v_cofins) cofins, SUM(v_ipi) ipi
    FROM notas WHERE client_id = ? GROUP BY competencia, direcao ORDER BY competencia DESC`).all(clientId) as any[];
  const map = new Map<string, Apuracao>();
  for (const r of rows) {
    const a = map.get(r.competencia) ?? {
      competencia: r.competencia, saidas: 0, entradas: 0, icmsDebito: 0, icmsCredito: 0, icmsRecolher: 0,
      pisDebito: 0, pisCredito: 0, cofinsDebito: 0, cofinsCredito: 0, ipiDebito: 0, ipiCredito: 0,
    };
    if (r.direcao === "saida") { a.saidas = r.nf; a.icmsDebito = r.icms; a.pisDebito = r.pis; a.cofinsDebito = r.cofins; a.ipiDebito = r.ipi; }
    else { a.entradas = r.nf; a.icmsCredito = r.icms; a.pisCredito = r.pis; a.cofinsCredito = r.cofins; a.ipiCredito = r.ipi; }
    a.icmsRecolher = a.icmsDebito - a.icmsCredito;
    map.set(r.competencia, a);
  }
  return [...map.values()];
}
