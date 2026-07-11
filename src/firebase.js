import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingVars = requiredVars.filter((v) => !import.meta.env[v]);

// Nao lanca erro no import: o app renderiza uma tela de configuracao amigavel
// (ver useAuth.jsx) enquanto o .env nao existe.
export const configError =
  missingVars.length > 0
    ? `Variáveis do Firebase faltando no arquivo .env:\n${missingVars.join(
        ", "
      )}\n\nCopie .env.example para .env na raiz do projeto e preencha com as chaves do projeto Firebase novo (não usar o do bolão).`
    : null;

let auth = null;
let db = null;
let googleProvider = null;

if (!configError) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}

export { auth, db, googleProvider };
