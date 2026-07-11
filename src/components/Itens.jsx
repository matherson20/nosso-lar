import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/useAuth.jsx";
import { useData } from "../lib/useData.jsx";
import { addItem, updateItem, deleteItem } from "../lib/db";
import { formatBRL, labelMes } from "../lib/format";
import ItemForm, { PRIORIDADES } from "./ItemForm.jsx";

const ROTULO_PRIORIDADE = Object.fromEntries(
  PRIORIDADES.map((p) => [p.id, p.rotulo])
);

function descricaoPagamento(item) {
  const fp = item.formaPagamento || {};
  if (fp.tipo === "parcelado") {
    return `${fp.parcelas}x de ${formatBRL(fp.valorParcela)}`;
  }
  return "à vista";
}

function CardItem({ item, aoEditar }) {
  const comprado = item.status === "comprado";

  async function alternarStatus() {
    await updateItem(item.id, {
      status: comprado ? "planejado" : "comprado",
    });
  }

  async function excluir() {
    if (confirm(`Excluir "${item.nome}"?`)) await deleteItem(item.id);
  }

  return (
    <div className={`card-item ${comprado ? "comprado" : ""}`}>
      <button
        className={`check ${comprado ? "marcado" : ""}`}
        onClick={alternarStatus}
        title={comprado ? "Voltar para planejado" : "Marcar como comprado"}
      >
        {comprado ? "✓" : ""}
      </button>

      <div className="card-item-corpo">
        <div className="card-item-topo">
          <span className="card-item-nome">{item.nome}</span>
          <span className={`badge prio-${item.prioridade}`}>
            {ROTULO_PRIORIDADE[item.prioridade] || item.prioridade}
          </span>
        </div>
        <div className="card-item-meta">
          <strong>{formatBRL(item.valor)}</strong>
          <span>· {descricaoPagamento(item)}</span>
          {item.mesCompra && <span>· {labelMes(item.mesCompra)}</span>}
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer">
              🔗 loja
            </a>
          )}
        </div>
        {item.criadoPor && (
          <div className="card-item-por">
            por {(item.criadoPor.nome || "").split(" ")[0]}
          </div>
        )}
      </div>

      <div className="card-item-acoes">
        <button onClick={() => aoEditar(item)} title="Editar">
          ✏️
        </button>
        <button onClick={excluir} title="Excluir">
          🗑️
        </button>
      </div>
    </div>
  );
}

export default function Itens() {
  const { user } = useAuth();
  const { items, comodos, carregando } = useData();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("todas");
  const [filtroComodo, setFiltroComodo] = useState("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState(null);

  const filtrados = useMemo(
    () =>
      items.filter(
        (i) =>
          (filtroStatus === "todos" || i.status === filtroStatus) &&
          (filtroPrioridade === "todas" || i.prioridade === filtroPrioridade) &&
          (filtroComodo === "todos" || i.comodo === filtroComodo)
      ),
    [items, filtroStatus, filtroPrioridade, filtroComodo]
  );

  // Todos os comodos da casa (padrao + customizados), mais eventuais "orfaos"
  // que so existem em itens antigos.
  const comodosFiltro = useMemo(
    () => [
      ...comodos,
      ...new Set(items.map((i) => i.comodo).filter((c) => !comodos.includes(c))),
    ],
    [items, comodos]
  );

  // Agrupa na ordem dos comodos conhecidos; comodos "orfaos" (custom removido) vao ao fim.
  const grupos = useMemo(() => {
    const ordem = [
      ...comodos,
      ...new Set(filtrados.map((i) => i.comodo).filter((c) => !comodos.includes(c))),
    ];
    return ordem
      .map((c) => {
        const doComodo = filtrados.filter((i) => i.comodo === c);
        return {
          comodo: c,
          itens: doComodo,
          subtotal: doComodo.reduce((s, i) => s + (Number(i.valor) || 0), 0),
        };
      })
      .filter((g) => g.itens.length > 0);
  }, [filtrados, comodos]);

  const totalGeral = filtrados.reduce((s, i) => s + (Number(i.valor) || 0), 0);

  async function salvar(dados) {
    if (editando) {
      await updateItem(editando.id, dados);
    } else {
      await addItem(dados, user);
    }
    setFormAberto(false);
    setEditando(null);
  }

  function abrirEdicao(item) {
    setEditando(item);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setEditando(null);
  }

  // Trava o scroll da pagina enquanto a folha (bottom sheet) esta aberta.
  useEffect(() => {
    document.body.style.overflow = formAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [formAberto]);

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <h2>Itens da casa</h2>
        <button
          className="btn-pri so-desktop"
          onClick={() => {
            setEditando(null);
            setFormAberto(true);
          }}
        >
          ➕ Adicionar
        </button>
      </div>

      {formAberto && (
        <div className="folha-fundo" onClick={fecharForm}>
          <div
            className="folha"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="folha-cabo" />
            <h3>{editando ? "Editar item" : "Novo item"}</h3>
            <ItemForm
              itemInicial={editando}
              aoSalvar={salvar}
              aoCancelar={fecharForm}
            />
          </div>
        </div>
      )}

      <div className="filtros">
        <div className="chips-wrap">
          <div className="chips rolagem">
            {[
              ["todos", "Todos"],
              ["planejado", "Planejados"],
              ["comprado", "Comprados"],
            ].map(([id, rotulo]) => (
              <button
                key={id}
                className={`chip ${filtroStatus === id ? "ativo" : ""}`}
                onClick={() => setFiltroStatus(id)}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
        <div className="chips-wrap">
          <div className="chips rolagem">
            <button
              className={`chip ${filtroPrioridade === "todas" ? "ativo" : ""}`}
              onClick={() => setFiltroPrioridade("todas")}
            >
              Todas
            </button>
            {PRIORIDADES.map((p) => (
              <button
                key={p.id}
                className={`chip ${filtroPrioridade === p.id ? "ativo" : ""}`}
                onClick={() => setFiltroPrioridade(p.id)}
              >
                {p.rotulo}
              </button>
            ))}
          </div>
        </div>
        <div className="chips-wrap">
          <div className="chips rolagem">
            <button
              className={`chip ${filtroComodo === "todos" ? "ativo" : ""}`}
              onClick={() => setFiltroComodo("todos")}
            >
              Todos os cômodos
            </button>
            {comodosFiltro.map((c) => (
              <button
                key={c}
                className={`chip ${filtroComodo === c ? "ativo" : ""}`}
                onClick={() => setFiltroComodo(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="vazio">Carregando…</div>
      ) : grupos.length === 0 ? (
        <div className="vazio">
          <div className="vazio-icone">🛋️</div>
          {items.length === 0 ? (
            <>
              <p>Nenhum item ainda.</p>
              <p>Comecem adicionando o que vocês querem comprar para a casa nova!</p>
            </>
          ) : (
            <p>Nenhum item com esses filtros.</p>
          )}
        </div>
      ) : (
        <>
          <div className="total-geral">
            Total: <strong>{formatBRL(totalGeral)}</strong>
            <span className="total-qtd">
              {filtrados.length} {filtrados.length === 1 ? "item" : "itens"}
            </span>
          </div>

          {grupos.map((g) => (
            <section key={g.comodo} className="grupo-comodo">
              <div className="grupo-cabecalho">
                <h3>{g.comodo}</h3>
                <span className="grupo-subtotal">{formatBRL(g.subtotal)}</span>
              </div>
              {g.itens.map((item) => (
                <CardItem key={item.id} item={item} aoEditar={abrirEdicao} />
              ))}
            </section>
          ))}
        </>
      )}

      <button
        className="fab"
        aria-label="Adicionar item"
        onClick={() => {
          setEditando(null);
          setFormAberto(true);
        }}
      >
        ➕
      </button>
    </div>
  );
}
