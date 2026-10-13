import { criarPlanoPadrao, gerarLancamentosDasNotas, lancar } from "@/lib/contabil";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const clientId = Number((await ctx.params).id);
  const b = await req.json();
  try {
    if (b.acao === "plano") { criarPlanoPadrao(clientId); return Response.json({ ok: true }); }
    if (b.acao === "notas") return Response.json({ ok: true, gerados: gerarLancamentosDasNotas(clientId) });
    const id = lancar(clientId, b.data, b.historico, b.linhas);
    return Response.json({ ok: true, id });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "erro" }, { status: 400 });
  }
}
