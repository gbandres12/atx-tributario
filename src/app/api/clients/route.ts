import { db } from "@/lib/db";

export async function POST(req: Request) {
  const f = await req.formData();
  const g = (k: string) => String(f.get(k) ?? "").trim();
  const cnpj = g("cnpj").replace(/\D/g, "");
  if (!g("razao_social") || cnpj.length !== 14)
    return Response.json({ error: "Razão social e CNPJ (14 dígitos) são obrigatórios" }, { status: 400 });
  try {
    const r = db.prepare(`INSERT INTO clients
      (razao_social, nome_fantasia, cnpj, regime, atividade, email, telefone, honorario, vencimento_dia, servicos, observacoes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      g("razao_social"), g("nome_fantasia"), cnpj, g("regime") || "simples", g("atividade") || "comercio",
      g("email"), g("telefone"), Number(g("honorario")) || 0, Number(g("vencimento_dia")) || 10,
      f.getAll("servicos").join(",") || "fiscal,contabil", g("observacoes"));
    return Response.redirect(new URL(`/clients/${r.lastInsertRowid}`, req.url), 303);
  } catch {
    return Response.json({ error: "CNPJ já cadastrado" }, { status: 409 });
  }
}
