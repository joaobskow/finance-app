import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { usarTema } from "../context/ContextoTema.jsx";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export default function AlternadorTema() {
  const { mode, resolvedTheme, setMode } = usarTema();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--bg-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(16,22,31,0.08)",
          cursor: "pointer",
        }}
      >
        <CurrentIcon size={18} color="var(--accent-ink)" strokeWidth={2} />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            background: "var(--bg-card)",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(31,27,46,0.16)",
            padding: 6,
            zIndex: 60,
            minWidth: 140,
          }}
        >
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = mode === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  setMode(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 10,
                  background: active ? "var(--accent-ink-soft)" : "transparent",
                  color: active ? "var(--accent-ink)" : "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Icon size={16} />
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
