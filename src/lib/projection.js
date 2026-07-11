// Projecao de comprometimento mensal: fixos recorrentes + parcelas + compras a vista,
// mes a mes, a partir do mes atual.
import { somaMeses, diffMeses } from "./format";

// Fator acima da media do periodo a partir do qual um mes ganha destaque visual.
const FATOR_DESTAQUE = 1.2;

export function buildTimeline(items, fixedExpenses, mesInicio, numMeses = 12) {
  const recorrentes = fixedExpenses.filter((f) => f.tipo === "recorrente");

  const meses = Array.from({ length: numMeses }, (_, i) => {
    const key = somaMeses(mesInicio, i);
    // Gastos com "validoAte" (ex.: boletos da construtora) saem da conta
    // nos meses posteriores ao vencimento.
    const fixos = recorrentes
      .filter((f) => !f.validoAte || diffMeses(key, f.validoAte) >= 0)
      .reduce((s, f) => s + (Number(f.valor) || 0), 0);
    let parcelas = 0;
    let avista = 0;
    const detalhes = [];

    for (const item of items) {
      if (!item.mesCompra) continue;
      const fp = item.formaPagamento || {};
      if (fp.tipo === "parcelado" && fp.parcelas > 0) {
        const idx = diffMeses(item.mesCompra, key);
        if (idx >= 0 && idx < fp.parcelas) {
          const vp = Number(fp.valorParcela) || 0;
          parcelas += vp;
          detalhes.push({
            nome: item.nome,
            valor: vp,
            info: `parcela ${idx + 1}/${fp.parcelas}`,
          });
        }
      } else if (item.mesCompra === key) {
        const v = Number(item.valor) || 0;
        avista += v;
        detalhes.push({ nome: item.nome, valor: v, info: "à vista" });
      }
    }

    return {
      key,
      fixos,
      parcelas,
      avista,
      total: fixos + parcelas + avista,
      detalhes,
    };
  });

  const media =
    meses.reduce((s, m) => s + m.total, 0) / (meses.length || 1);

  for (const m of meses) {
    m.acimaDaMedia = media > 0 && m.total > media * FATOR_DESTAQUE;
  }

  // fixosMensais: total do mes atual (primeiro da janela), usado no KPI.
  return { meses, media, fixosMensais: meses[0]?.fixos || 0 };
}

// Itens que ficam fora da projecao por nao terem mes de compra definido.
export function itensSemMes(items) {
  return items.filter((i) => !i.mesCompra);
}
