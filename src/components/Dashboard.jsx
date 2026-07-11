import { useMemo, useState } from "react";
import { useData } from "../lib/useData.jsx";
import { buildTimeline, itensSemMes } from "../lib/projection";
import { formatBRL, labelMes, labelMesLongo, mesAtual } from "../lib/format";

// Cores das séries (paleta validada, modo claro):
// fixos = azul, parcelas = aqua, à vista = amarelo. Aqua/amarelo têm contraste
// reduzido no fundo claro, por isso todos os valores também aparecem em texto
// (legenda + detalhe do mês ao tocar) — nunca só na cor.
const SERIES = [
  { id: "fixos", rotulo: "Fixos", cor: "#2a78d6" },
  { id: "parcelas", rotulo: "Parcelas", cor: "#1baf7a" },
  { id: "avista", rotulo: "À vista", cor: "#eda100" },
];

function Tile({ rotulo, valor, destaque }) {
  return (
    <div className={`tile ${destaque ? "tile-destaque" : ""}`}>
      <span className="tile-rotulo">{rotulo}</span>
      <span className="tile-valor">{valor}</span>
    </div>
  );
}

export default function Dashboard() {
  const { items, fixedExpenses, carregando } = useData();
  const [mesSelecionado, setMesSelecionado] = useState(null);

  const totalPlanejado = items.reduce((s, i) => s + (Number(i.valor) || 0), 0);
  const totalComprado = items
    .filter((i) => i.status === "comprado")
    .reduce((s, i) => s + (Number(i.valor) || 0), 0);
  const totalPendente = totalPlanejado - totalComprado;
  const pctComprado =
    totalPlanejado > 0 ? (totalComprado / totalPlanejado) * 100 : 0;

  const { meses, media, fixosMensais } = useMemo(
    () => buildTimeline(items, fixedExpenses, mesAtual(), 12),
    [items, fixedExpenses]
  );

  const porComodo = useMemo(() => {
    const mapa = new Map();
    for (const i of items) {
      mapa.set(i.comodo, (mapa.get(i.comodo) || 0) + (Number(i.valor) || 0));
    }
    return [...mapa.entries()]
      .map(([comodo, total]) => ({ comodo, total }))
      .sort((a, b) => b.total - a.total);
  }, [items]);

  const semMes = itensSemMes(items);
  const maxComodo = porComodo[0]?.total || 1;
  const maxMes = Math.max(...meses.map((m) => m.total), 1);
  const detalheMes = meses.find((m) => m.key === mesSelecionado);

  if (carregando) return <div className="vazio">Carregando…</div>;

  if (items.length === 0 && fixedExpenses.length === 0) {
    return (
      <div className="pagina">
        <div className="vazio">
          <div className="vazio-icone">📊</div>
          <p>O resumo aparece aqui quando vocês cadastrarem os primeiros itens e gastos.</p>
          <p>Comecem pela aba <strong>Itens</strong>! 🛋️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <h2>Resumo</h2>
      </div>

      {/* KPIs */}
      <div className="tiles">
        <Tile rotulo="Móveis planejados" valor={formatBRL(totalPlanejado)} />
        <Tile rotulo="Já comprado" valor={formatBRL(totalComprado)} />
        <Tile rotulo="Pendente" valor={formatBRL(totalPendente)} />
        <Tile rotulo="Fixo mensal" valor={formatBRL(fixosMensais)} destaque />
      </div>

      {/* Progresso comprado vs planejado */}
      {totalPlanejado > 0 && (
        <div className="cartao">
          <div className="cartao-titulo">Progresso das compras</div>
          <div className="meter">
            <div className="meter-fill" style={{ width: `${pctComprado}%` }} />
          </div>
          <div className="meter-legenda">
            {formatBRL(totalComprado)} comprado ({pctComprado.toFixed(0)}%) ·{" "}
            {formatBRL(totalPendente)} pendente
          </div>
        </div>
      )}

      {/* Total por comodo */}
      {porComodo.length > 0 && (
        <div className="cartao">
          <div className="cartao-titulo">Total por cômodo</div>
          <div className="barras-h">
            {porComodo.map((c) => (
              <div key={c.comodo} className="barra-h-linha">
                <span className="barra-h-nome">{c.comodo}</span>
                <div className="barra-h-trilha">
                  <div
                    className="barra-h-fill"
                    style={{ width: `${(c.total / maxComodo) * 100}%` }}
                  />
                </div>
                <span className="barra-h-valor">{formatBRL(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline 12 meses */}
      <div className="cartao">
        <div className="cartao-titulo">
          Comprometimento mensal — próximos 12 meses
        </div>
        <div className="cartao-sub">
          média {formatBRL(media)}/mês · toque num mês para ver o detalhe
        </div>

        <div className="colunas">
          {meses.map((m) => (
            <button
              key={m.key}
              className={`coluna ${m.acimaDaMedia ? "alerta" : ""} ${
                mesSelecionado === m.key ? "selecionada" : ""
              }`}
              onClick={() =>
                setMesSelecionado(mesSelecionado === m.key ? null : m.key)
              }
            >
              {m.acimaDaMedia && <span className="coluna-flag">⚠</span>}
              <div className="coluna-pilha">
                {SERIES.map((s) =>
                  m[s.id] > 0 ? (
                    <div
                      key={s.id}
                      className="coluna-seg"
                      style={{
                        height: `${(m[s.id] / maxMes) * 100}%`,
                        background: s.cor,
                      }}
                    />
                  ) : null
                )}
              </div>
              <span className="coluna-rotulo">{labelMes(m.key)}</span>
            </button>
          ))}
        </div>

        <div className="legenda">
          {SERIES.map((s) => (
            <span key={s.id} className="legenda-item">
              <i style={{ background: s.cor }} /> {s.rotulo}
            </span>
          ))}
          <span className="legenda-item">
            <span className="coluna-flag">⚠</span> acima da média
          </span>
        </div>

        {detalheMes && (
          <div className="detalhe-mes">
            <div className="detalhe-mes-topo">
              <strong>{labelMesLongo(detalheMes.key)}</strong>
              <strong>{formatBRL(detalheMes.total)}</strong>
            </div>
            <div className="detalhe-mes-linha">
              <span>Gastos fixos</span>
              <span>{formatBRL(detalheMes.fixos)}</span>
            </div>
            {detalheMes.detalhes.map((d, i) => (
              <div key={i} className="detalhe-mes-linha">
                <span>
                  {d.nome} <em>({d.info})</em>
                </span>
                <span>{formatBRL(d.valor)}</span>
              </div>
            ))}
            {detalheMes.acimaDaMedia && (
              <div className="detalhe-mes-alerta">
                ⚠ Este mês fica {formatBRL(detalheMes.total - media)} acima da
                média — parcelas concentradas.
              </div>
            )}
          </div>
        )}

        {semMes.length > 0 && (
          <div className="aviso-projecao">
            ℹ️ {semMes.length}{" "}
            {semMes.length === 1
              ? "item está sem mês de compra e ficou"
              : "itens estão sem mês de compra e ficaram"}{" "}
            fora da projeção.
          </div>
        )}
      </div>
    </div>
  );
}
