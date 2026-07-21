import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Receipt, BarChart3, User } from "lucide-react";

const tabs = [
  { key: "home", path: "/", icon: Home, label: "Início" },
  { key: "transactions", path: "/transactions", icon: Receipt, label: "Transações" },
  { key: "stats", path: "/stats", icon: BarChart3, label: "Estatísticas" },
  { key: "profile", path: "/profile", icon: User, label: "Perfil" },
];

export default function BarraNavegacao() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="barra-navegacao"
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-color-soft)",
        padding: "10px 10px calc(10px + env(safe-area-inset-bottom))",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      {tabs.map(({ key, path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <div
            key={key}
            onClick={() => navigate(path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: active ? "var(--accent-income)" : "var(--text-secondary)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 40,
                height: 32,
                borderRadius: 12,
                background: active ? "var(--accent-ink-soft)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={19} />
            </div>
            {label}
          </div>
        );
      })}
    </div>
  );
}
