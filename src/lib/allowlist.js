// Allowlist de e-mails do casal.
// IMPORTANTE: manter sincronizada com firestore.rules — o front so melhora a UX;
// quem realmente bloqueia acesso indevido sao as Security Rules.
// TODO: substituir pelo e-mail real da esposa antes do deploy.
export const ALLOWLIST = [
  "mathersonvieira20@gmail.com",
  "email-da-esposa@gmail.com",
];

export function isAllowed(email) {
  return !!email && ALLOWLIST.includes(email.toLowerCase());
}
