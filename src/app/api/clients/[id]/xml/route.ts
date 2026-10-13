import { db } from "@/lib/db";
import { importarXml } from "@/lib/nfe";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const c = db.prepare("SELECT id, cnpj FROM clients WHERE id = ?").get(Number(id)) as { id: number; cnpj: string } | undefined;
  if (!c) return Response.json({ error: "Cliente não encontrado" }, { status: 404 });

  const files = (await req.formData()).getAll("xml").filter((x): x is File => x instanceof File);
  const resultado = [];
  for (const file of files) {
    try {
      resultado.push({ arquivo: file.name, ok: true, ...importarXml(c.id, c.cnpj, await file.text()) });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "erro";
      resultado.push({ arquivo: file.name, ok: false, erro: msg.includes("UNIQUE") ? "Nota já importada" : msg });
    }
  }
  return Response.json(resultado);
}
