// Formatacao e parsing de valores em BRL + helpers de mes ("YYYY-MM").

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(valor) {
  return brl.format(Number(valor) || 0);
}

// Aceita "1.234,56", "1234,56", "R$ 1.234,56" e tambem "1234.56".
export function parseBRL(texto) {
  if (typeof texto === "number") return texto;
  const s = String(texto || "")
    .replace(/[R$\s]/g, "")
    .trim();
  if (!s) return 0;
  // Se tem virgula, trata ponto como separador de milhar.
  const normalizado = s.includes(",")
    ? s.replace(/\./g, "").replace(",", ".")
    : s;
  const n = Number(normalizado);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

// ── Meses no formato "YYYY-MM" ───────────────────────────────────────────────

export function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function paraIndice(key) {
  const [y, m] = key.split("-").map(Number);
  return y * 12 + (m - 1);
}

export function somaMeses(key, n) {
  const t = paraIndice(key) + n;
  const y = Math.floor(t / 12);
  const m = (t % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

// Quantos meses de "a" ate "b" (b - a). Negativo se b vem antes.
export function diffMeses(a, b) {
  return paraIndice(b) - paraIndice(a);
}

const MESES_CURTOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

// "2026-07" -> "jul/26"
export function labelMes(key) {
  if (!key) return "—";
  const [y, m] = key.split("-").map(Number);
  return `${MESES_CURTOS[m - 1]}/${String(y).slice(2)}`;
}

// "2026-07" -> "jul" (sem ano; usado quando o ano ja esta claro no contexto)
export function labelMesCurto(key) {
  if (!key) return "—";
  const [, m] = key.split("-").map(Number);
  return MESES_CURTOS[m - 1];
}

// Valor compacto para rotulos de grafico: 10410 -> "10,4 mil"
const compacto = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompacto(valor) {
  return compacto.format(Number(valor) || 0);
}

// "2026-07" -> "julho de 2026"
const MESES_LONGOS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function labelMesLongo(key) {
  if (!key) return "—";
  const [y, m] = key.split("-").map(Number);
  return `${MESES_LONGOS[m - 1]} de ${y}`;
}
