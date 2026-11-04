import Image from "next/image";

export const PERFIL = { nome: "Gabriel Andres", cargo: "Estrategista de Negócios", foto: "/gabriel-andres.webp" };

export default function Perfil({ grande = false }: { grande?: boolean }) {
  const px = grande ? 96 : 40;
  return (
    <div className={`flex items-center gap-3 ${grande ? "gap-5" : ""}`}>
      <Image src={PERFIL.foto} alt={PERFIL.nome} width={px} height={px} priority
        className="shrink-0 rounded-full border-2 border-teal object-cover" style={{ width: px, height: px }} />
      <div>
        <div className={grande ? "text-xl font-bold" : "text-sm font-semibold"}>{PERFIL.nome}</div>
        <div className={grande ? "text-sm text-teal" : "text-xs text-muted"}>{PERFIL.cargo}</div>
      </div>
    </div>
  );
}
