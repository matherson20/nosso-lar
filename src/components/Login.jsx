import { useAuth } from "../lib/useAuth.jsx";

export default function Login() {
  const { login, negado } = useAuth();
  return (
    <div className="login-tela">
      <div className="logo">🏠✨</div>
      <h1>Nosso Lar</h1>
      <p>Planejamento da mudança para o nosso apartamento novo.</p>
      {negado && (
        <div className="login-negado">
          O e-mail <strong>{negado}</strong> não tem acesso a este app.
          Este espaço é só nosso. 💚
        </div>
      )}
      <button className="btn-google" onClick={login}>
        <span>🔑</span> Entrar com Google
      </button>
    </div>
  );
}
