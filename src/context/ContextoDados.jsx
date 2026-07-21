import React, { createContext, useContext, useEffect, useState } from "react";
import { usarAutenticacao } from "./ContextoAutenticacao.jsx";
import { listenToGoals, listenToTransactions, listenToUserProfile } from "../services/servicoFirestore.js";

const ContextoDados = createContext(null);

export function ProvedorDados({ children }) {
  const { user } = usarAutenticacao();
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) {
      setProfile(null); setGoals([]); setTransactions([]);
      return undefined;
    }
    const unsubProfile = listenToUserProfile(user.uid, setProfile);
    const unsubGoals = listenToGoals(user.uid, setGoals);
    const unsubTransactions = listenToTransactions(user.uid, setTransactions);
    return () => { unsubProfile(); unsubGoals(); unsubTransactions(); };
  }, [user]);

  return <ContextoDados.Provider value={{ profile, goals, transactions }}>{children}</ContextoDados.Provider>;
}

export function usarDados() {
  const context = useContext(ContextoDados);
  if (!context) throw new Error("usarDados precisa estar dentro de um ProvedorDados");
  return context;
}
