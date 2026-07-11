import { createContext, useContext, useEffect, useState } from "react";
import { watchItems, watchFixedExpenses, watchSettings } from "./db";
import { useAuth } from "./useAuth.jsx";

const DataContext = createContext(null);

export const COMODOS_BASE = [
  "Sala",
  "Cozinha",
  "Quarto",
  "Banheiro",
  "Área de Serviço",
  "Varanda",
];

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [settings, setSettings] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setFixedExpenses([]);
      setSettings({});
      return;
    }
    setCarregando(true);
    let prontos = 0;
    const pronto = () => {
      prontos += 1;
      if (prontos >= 2) setCarregando(false);
    };
    const u1 = watchItems((v) => {
      setItems(v);
      pronto();
    });
    const u2 = watchFixedExpenses((v) => {
      setFixedExpenses(v);
      pronto();
    });
    const u3 = watchSettings(setSettings);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [user]);

  const comodos = [...COMODOS_BASE, ...(settings.comodosCustom || [])];

  return (
    <DataContext.Provider
      value={{ items, fixedExpenses, settings, comodos, carregando }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
