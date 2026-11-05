import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nexum Fiscal · ATX Tributário" };

export default function NexumFiscal() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 pt-8">
      <span className="rounded-full border border-line px-3 py-1 text-xs tracking-widest text-muted">UM SISTEMA DA ATX TRIBUTÁRIO</span>
      <h1 className="text-4xl font-bold"><span className="text-violet">Nexum</span> <span className="text-teal">Fiscal</span></h1>
      <p className="text-lg text-muted">
        Temos um sistema interno próprio para gerenciar o desempenho contábil dos clientes e emitir notas fiscais.
      </p>
    </div>
  );
}
