# 🏠 Nosso Lar

App privado do casal para planejar os gastos da mudança para o apartamento novo:
lista de móveis por cômodo, gastos fixos mensais e dashboard com projeção de
comprometimento mês a mês.

**Stack:** React + Vite · Firebase Auth (Google) · Cloud Firestore · GitHub Pages.

## Configurar o projeto Firebase (novo, não usar o do bolão)

1. Acesse o [Firebase Console](https://console.firebase.google.com) e clique em
   **Adicionar projeto** (ex.: `nosso-lar`). Google Analytics pode desativar.
2. **Authentication** → *Get started* → aba **Sign-in method** → habilite **Google**
   (defina o e-mail de suporte quando pedir).
3. **Firestore Database** → *Create database* → **Production mode** →
   região `southamerica-east1` (São Paulo).
4. Regras de segurança: aba **Rules** do Firestore → cole o conteúdo de
   [`firestore.rules`](firestore.rules) → **Publish**.
   ⚠️ Antes, troque `email-da-esposa@gmail.com` pelo e-mail real (também em
   `src/lib/allowlist.js`).
5. Chaves do app web: ⚙️ **Configurações do projeto** → *Seus apps* →
   **</> (Web)** → registre (ex.: `nosso-lar-web`, sem Hosting) → copie o
   `firebaseConfig`.
6. Copie `.env.example` para `.env` e preencha com esses valores.
7. Depois do deploy: **Authentication → Settings → Authorized domains** →
   adicionar `SEU_USUARIO.github.io`.

## Rodar local

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

1. Crie o repositório e faça push (branch `main`).
2. No GitHub: **Settings → Pages → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions**: crie os secrets
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
   `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
   `VITE_FIREBASE_APP_ID` com os mesmos valores do `.env`.
4. O workflow [`deploy.yml`](.github/workflows/deploy.yml) publica a cada push na `main`.

## Segurança

- Acesso restrito por **allowlist de e-mails** em dois lugares (manter em sincronia):
  - `src/lib/allowlist.js` (UX no front)
  - `firestore.rules` (a proteção de verdade, no servidor)
- As chaves `VITE_FIREBASE_*` são públicas por design; quem protege os dados são as rules.

## Modelo de dados (Firestore)

- `items`: `{ nome, comodo, link, valor, formaPagamento: { tipo: "avista"|"parcelado", parcelas?, valorParcela? }, prioridade, status, mesCompra: "YYYY-MM", criadoPor, criadoEm }`
- `fixedExpenses`: `{ nome, valor, tipo: "recorrente"|"unico", criadoPor, criadoEm }`
- `settings/config`: `{ comodosCustom: [] }`
