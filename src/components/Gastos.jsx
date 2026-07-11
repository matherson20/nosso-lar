import { useState } from "react";
import { useAuth } from "../lib/useAuth.jsx";
import { useData } from "../lib/useData.jsx";
import {
  addFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
} from "../lib/db";
import { formatBRL, parseBRL } from "../lib/format";

const SUGESTOES_RECORRENTES = [
  "Financiamento",
  "Condomínio",
  "Luz",
  "Internet",
  "Mercado (estimado)",
];
const SUGESTOES_UNICOS = ["Entrada", "Frete da mudança", "ITBI/Cartório"];

function LinhaGasto({ gasto }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(gasto.nome);
  const [valorTxt, setValorTxt] = useState(
    String(gasto.valor).replace(".", ",")
  );

  async function salvar(e) {
    e.preventDefault();
    const valor = parseBRL(valorTxt);
    if (!nome.trim() || !valor) return;
    await updateFixedExpense(gasto.id, { nome: nome.trim(), valor });
    setEditando(false);
  }

  async function excluir() {
    if (confirm(`Excluir "${gasto.nome}"?`)) await deleteFixedExpense(gasto.id);
  }

  if (editando) {
    return (
      <form className="linha-gasto editando" onSubmit={salvar}>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        <input
          inputMode="decimal"
          value={valorTxt}
          onChange={(e) => setValorTxt(e.target.value)}
          required
        />
        <button type="submit" className="btn-mini" title="Salvar">
          ✓
        </button>
        <button
          type="button"
          className="btn-mini"
          onClick={() => setEditando(false)}
          title="Cancelar"
        >
          ✕
        </button>
      </form>
    );
  }

  return (
    <div className="linha-gasto">
      <span className="linha-gasto-nome">{gasto.nome}</span>
      <strong>{formatBRL(gasto.valor)}</strong>
      <button
        className="btn-mini"
        onClick={() => setEditando(true)}
        title="Editar"
      >
        ✏️
      </button>
      <button className="btn-mini" onClick={excluir} title="Excluir">
        🗑️
      </button>
    </div>
  );
}

function SecaoGastos({ titulo, subtitulo, tipo, gastos, sugestoes }) {
  const { user } = useAuth();
  const [nome, setNome] = useState("");
  const [valorTxt, setValorTxt] = useState("");

  const total = gastos.reduce((s, g) => s + (Number(g.valor) || 0), 0);
  const nomesExistentes = new Set(gastos.map((g) => g.nome));
  const sugestoesRestantes = sugestoes.filter((s) => !nomesExistentes.has(s));

  async function adicionar(e) {
    e.preventDefault();
    const valor = parseBRL(valorTxt);
    if (!nome.trim() || !valor) return;
    await addFixedExpense({ nome: nome.trim(), valor, tipo }, user);
    setNome("");
    setValorTxt("");
  }

  return (
    <section className="secao-gastos">
      <div className="grupo-cabecalho">
        <div>
          <h3>{titulo}</h3>
          <span className="secao-sub">{subtitulo}</span>
        </div>
        <span className="grupo-subtotal">{formatBRL(total)}</span>
      </div>

      {gastos.length === 0 && (
        <div className="vazio pequeno">Nada cadastrado ainda.</div>
      )}
      {gastos.map((g) => (
        <LinhaGasto key={g.id} gasto={g} />
      ))}

      {sugestoesRestantes.length > 0 && (
        <div className="chips sugestoes">
          {sugestoesRestantes.map((s) => (
            <button key={s} className="chip" onClick={() => setNome(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}

      <form className="form-gasto" onSubmit={adicionar}>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do gasto"
          required
        />
        <input
          inputMode="decimal"
          value={valorTxt}
          onChange={(e) => setValorTxt(e.target.value)}
          placeholder="R$"
          required
        />
        <button type="submit" className="btn-pri">
          ➕
        </button>
      </form>
    </section>
  );
}

export default function Gastos() {
  const { fixedExpenses, carregando } = useData();

  if (carregando) return <div className="vazio">Carregando…</div>;

  const recorrentes = fixedExpenses.filter((g) => g.tipo === "recorrente");
  const unicos = fixedExpenses.filter((g) => g.tipo === "unico");

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <h2>Gastos fixos</h2>
      </div>

      <SecaoGastos
        titulo="Recorrentes"
        subtitulo="todo mês, vida de apartamento"
        tipo="recorrente"
        gastos={recorrentes}
        sugestoes={SUGESTOES_RECORRENTES}
      />

      <SecaoGastos
        titulo="Únicos da mudança"
        subtitulo="pagos uma vez só"
        tipo="unico"
        gastos={unicos}
        sugestoes={SUGESTOES_UNICOS}
      />
    </div>
  );
}
