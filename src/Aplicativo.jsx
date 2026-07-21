import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProvedorAutenticacao } from "./context/ContextoAutenticacao.jsx";
import { ProvedorTema } from "./context/ContextoTema.jsx";
import RotaProtegida from "./routes/RotaProtegida.jsx";
import PromptInstalacao from "./components/PromptInstalacao.jsx";
import TelaLogin from "./screens/TelaLogin.jsx";
import TelaInicio from "./screens/TelaInicio.jsx";
import TelaTransacoes from "./screens/TelaTransacoes.jsx";
import TelaEstatisticas from "./screens/TelaEstatisticas.jsx";
import TelaPerfil from "./screens/TelaPerfil.jsx";

export default function Aplicativo() {
  return (
    <ProvedorTema>
      <BrowserRouter>
        <ProvedorAutenticacao>
          <Routes>
            <Route path="/login" element={<TelaLogin />} />
            <Route
              path="/"
              element={
                <RotaProtegida>
                  <TelaInicio />
                </RotaProtegida>
              }
            />
            <Route
              path="/transactions"
              element={
                <RotaProtegida>
                  <TelaTransacoes />
                </RotaProtegida>
              }
            />
            <Route
              path="/stats"
              element={
                <RotaProtegida>
                  <TelaEstatisticas />
                </RotaProtegida>
              }
            />
            <Route
              path="/profile"
              element={
                <RotaProtegida>
                  <TelaPerfil />
                </RotaProtegida>
              }
            />
          </Routes>
          <PromptInstalacao />
        </ProvedorAutenticacao>
      </BrowserRouter>
    </ProvedorTema>
  );
}
