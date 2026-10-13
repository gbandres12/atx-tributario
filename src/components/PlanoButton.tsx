"use client";
import { useRouter } from "next/navigation";

export default function PlanoButton({ clientId }: { clientId: number }) {
  const router = useRouter();
  return (
    <button className="btn" onClick={async () => {
      await fetch(`/api/clients/${clientId}/contabil`, { method: "POST", body: JSON.stringify({ acao: "plano" }) });
      router.refresh();
    }}>Criar plano de contas padrão</button>
  );
}
