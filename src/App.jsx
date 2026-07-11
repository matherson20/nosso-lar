import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "./lib/useAuth.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Itens from "./components/Itens.jsx";
import Gastos from "./components/Gastos.jsx";

const LINKS = [
  { to: "/", icone: "📊", rotulo: "Resumo", end: true },
  { to: "/itens", icone: "🛋️", rotulo: "Itens" },
  { to: "/gastos", icone: "📄", rotulo: "Gastos" },
];

function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-marca">
          <span className="header-logo">🏠</span>
          <div>
            <div className="header-nome">Nosso Lar</div>
            <div className="header-sub">planejamento da mudança</div>
          </div>
        </div>

        <nav className="header-nav">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                isActive ? "hnav-item ativo" : "hnav-item"
              }
            >
              <span>{l.icone}</span>
              <span>{l.rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-user">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="header-avatar" />
          ) : (
            <div className="header-avatar-fallback">
              {(user?.displayName || "?")[0]}
            </div>
          )}
          <span className="header-username">
            {(user?.displayName || "").split(" ")[0]}
          </span>
          <button className="header-sair" onClick={logout} title="Sair">
            ✕
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            isActive ? "bnav-item ativo" : "bnav-item"
          }
        >
          <span>{l.icone}</span>
          <span>{l.rotulo}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="tela-carregando">
        <div className="spinner" aria-label="Carregando" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="app">
      <Header />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/itens" element={<Itens />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
