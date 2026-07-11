import { useState } from "react";
import { useData } from "../lib/useData.jsx";
import { addComodoCustom } from "../lib/db";
import { parseBRL, formatBRL, mesAtual } from "../lib/format";

export const PRIORIDADES = [
  { id: "essencial", rotulo: "Essencial" },
  { id: "importante", rotulo: "Importante" },
  { id: "pode_esperar", rotulo: "Pode esperar" },
];

const NOVO_COMODO = "__novo__";

// Formulario de item (cadastro e edicao). Chama aoSalvar(dados) com os campos prontos.
export default function ItemForm({ itemInicial, aoSalvar, aoCancelar }) {
  const { comodos } = useData();
  const ed = itemInicial || {};

  const [nome, setNome] = useState(ed.nome || "");
  const [comodo, setComodo] = useState(ed.comodo || comodos[0]);
  const [novoComodo, setNovoComodo] = useState("");
  const [link, setLink] = useState(ed.link || "");
  const [valorTxt, setValorTxt] = useState(
    ed.valor != null ? String(ed.valor).replace(".", ",") : ""
  );
  const [prioridade, setPrioridade] = useState(ed.prioridade || "importante");
  const [tipoPagamento, setTipoPagamento] = useState(
    ed.formaPagamento?.tipo || "avista"
  );
  const [parcelas, setParcelas] = useState(ed.formaPagamento?.parcelas || 10);
  const [parcelaTxt, setParcelaTxt] = useState(
    ed.formaPagamento?.valorParcela != null
      ? String(ed.formaPagamento.valorParcela).replace(".", ",")
      : ""
  );
  // Depois que o usuario mexe na parcela, paramos de recalcular (caso de juros).
  const [parcelaManual, setParcelaManual] = useState(
    !!ed.formaPagamento?.valorParcela
  );
  const [mesCompra, setMesCompra] = useState(ed.mesCompra || mesAtual());
  const [salvando, setSalvando] = useState(false);

  const valor = parseBRL(valorTxt);

  function parcelaAuto(v, n) {
    if (!v || !n) return "";
    return (Math.round((v / n) * 100) / 100).toFixed(2).replace(".", ",");
  }

  function mudouValor(txt) {
    setValorTxt(txt);
    if (!parcelaManual) setParcelaTxt(parcelaAuto(parseBRL(txt), parcelas));
  }

  function mudouParcelas(n) {
    const qtd = Math.max(1, Number(n) || 1);
    setParcelas(qtd);
    if (!parcelaManual) setParcelaTxt(parcelaAuto(valor, qtd));
  }

  async function enviar(e) {
    e.preventDefault();
    if (!nome.trim() || !valor) return;

    let comodoFinal = comodo;
    if (comodo === NOVO_COMODO) {
      comodoFinal = novoComodo.trim();
      if (!comodoFinal) return;
    }

    const formaPagamento =
      tipoPagamento === "parcelado"
        ? {
            tipo: "parcelado",
            parcelas,
            valorParcela: parseBRL(parcelaTxt) || valor / parcelas,
          }
        : { tipo: "avista" };

    setSalvando(true);
    try {
      if (comodo === NOVO_COMODO) await addComodoCustom(comodoFinal);
      await aoSalvar({
        nome: nome.trim(),
        comodo: comodoFinal,
        link: link.trim(),
        valor,
        formaPagamento,
        prioridade,
        status: ed.status || "planejado",
        mesCompra,
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className="form-item" onSubmit={enviar}>
      <label className="campo">
        <span>Item</span>
        <input
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Sofá 3 lugares"
          required
        />
      </label>

      <div className="linha-2">
        <label className="campo">
          <span>Cômodo</span>
          <select value={comodo} onChange={(e) => setComodo(e.target.value)}>
            {comodos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={NOVO_COMODO}>➕ Novo cômodo…</option>
          </select>
        </label>

        <label className="campo">
          <span>Valor (R$)</span>
          <input
            inputMode="decimal"
            value={valorTxt}
            onChange={(e) => mudouValor(e.target.value)}
            placeholder="1.234,56"
            required
          />
        </label>
      </div>

      {comodo === NOVO_COMODO && (
        <label className="campo">
          <span>Nome do novo cômodo</span>
          <input
            value={novoComodo}
            onChange={(e) => setNovoComodo(e.target.value)}
            placeholder="Ex.: Escritório"
            required
          />
        </label>
      )}

      <label className="campo">
        <span>Link da loja (opcional)</span>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://…"
        />
      </label>

      <div className="campo">
        <span>Prioridade</span>
        <div className="chips">
          {PRIORIDADES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`chip prio-${p.id} ${
                prioridade === p.id ? "ativo" : ""
              }`}
              onClick={() => setPrioridade(p.id)}
            >
              {p.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="campo">
        <span>Pagamento</span>
        <div className="chips">
          <button
            type="button"
            className={`chip ${tipoPagamento === "avista" ? "ativo" : ""}`}
            onClick={() => setTipoPagamento("avista")}
          >
            À vista (Pix/débito)
          </button>
          <button
            type="button"
            className={`chip ${tipoPagamento === "parcelado" ? "ativo" : ""}`}
            onClick={() => setTipoPagamento("parcelado")}
          >
            Parcelado
          </button>
        </div>
      </div>

      {tipoPagamento === "parcelado" && (
        <div className="linha-2">
          <label className="campo">
            <span>Parcelas</span>
            <input
              type="number"
              min="1"
              max="48"
              value={parcelas}
              onChange={(e) => mudouParcelas(e.target.value)}
            />
          </label>
          <label className="campo">
            <span>Valor da parcela</span>
            <input
              inputMode="decimal"
              value={parcelaTxt}
              onChange={(e) => {
                setParcelaManual(true);
                setParcelaTxt(e.target.value);
              }}
              placeholder="auto"
            />
          </label>
        </div>
      )}

      {tipoPagamento === "parcelado" &&
        parseBRL(parcelaTxt) > 0 &&
        Math.abs(parseBRL(parcelaTxt) * parcelas - valor) > 0.05 && (
          <div className="aviso-juros">
            {parcelas}x de {formatBRL(parseBRL(parcelaTxt))} ={" "}
            {formatBRL(parseBRL(parcelaTxt) * parcelas)} (
            {parseBRL(parcelaTxt) * parcelas > valor ? "+" : "−"}
            {formatBRL(Math.abs(parseBRL(parcelaTxt) * parcelas - valor))} vs.
            à vista)
          </div>
        )}

      <label className="campo">
        <span>Mês da compra (planejado ou real)</span>
        <input
          type="month"
          value={mesCompra}
          onChange={(e) => setMesCompra(e.target.value)}
        />
      </label>

      <div className="form-acoes">
        <button type="button" className="btn-sec" onClick={aoCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-pri" disabled={salvando}>
          {salvando ? "Salvando…" : itemInicial ? "Salvar alterações" : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
