const F = ({ n, l, type = "text", req }: { n: string; l: string; type?: string; req?: boolean }) => (
  <label className="block text-sm"><span className="mb-1 block text-muted">{l}</span>
    <input name={n} type={type} required={req} className="input" /></label>
);

export default function NewClient() {
  return (
    <form action="/api/clients" method="post" className="card max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Ficha cadastral</h1>
      <F n="razao_social" l="Razão social" req />
      <F n="nome_fantasia" l="Nome fantasia" />
      <F n="cnpj" l="CNPJ" req />
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm"><span className="mb-1 block text-muted">Regime tributário</span>
          <select name="regime" className="input">
            <option value="simples">Simples Nacional</option><option value="presumido">Lucro Presumido</option><option value="real">Lucro Real</option>
          </select></label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Atividade</span>
          <select name="atividade" className="input">
            <option value="comercio">Comércio</option><option value="servico">Serviço</option><option value="industria">Indústria</option>
          </select></label>
        <F n="email" l="E-mail" type="email" />
        <F n="telefone" l="Telefone" />
        <F n="honorario" l="Honorário mensal (R$)" type="number" />
        <F n="vencimento_dia" l="Dia de vencimento" type="number" />
      </div>
      <fieldset className="flex gap-6 text-sm">
        <legend className="mb-1 text-muted">Serviços contratados</legend>
        {[["fiscal", "Fiscal"], ["contabil", "Contábil"], ["dp", "Dep. Pessoal"]].map(([v, l]) => (
          <label key={v} className="flex items-center gap-2"><input type="checkbox" name="servicos" value={v} defaultChecked={v !== "dp"} />{l}</label>
        ))}
      </fieldset>
      <label className="block text-sm"><span className="mb-1 block text-muted">Observações</span>
        <textarea name="observacoes" rows={3} className="input" /></label>
      <button className="btn">Salvar cliente</button>
    </form>
  );
}
