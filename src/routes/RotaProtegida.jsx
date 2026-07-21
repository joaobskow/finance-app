import React from "react";
import { Navigate } from "react-router-dom";
import { usarAutenticacao } from "../context/ContextoAutenticacao.jsx";

export default function RotaProtegida({ children }) {
  const { user, loading } = usarAutenticacao();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          background: "var(--bg-page)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
