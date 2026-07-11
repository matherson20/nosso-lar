import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, configError } from "../firebase";
import { isAllowed } from "./allowlist";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // E-mail que tentou entrar mas nao esta na allowlist (para mensagem na tela de login)
  const [negado, setNegado] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && !isAllowed(u.email)) {
        // Allowlist tambem nas Security Rules — aqui e so para a UX ficar clara.
        setNegado(u.email);
        setUser(null);
        fbSignOut(auth);
      } else {
        setUser(u);
        if (u) setNegado(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => fbSignOut(auth);

  if (configError) {
    return (
      <div className="config-erro">
        <h2>⚙️ Configuração pendente</h2>
        <pre>{configError}</pre>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, negado }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
