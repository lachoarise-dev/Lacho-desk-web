/**
 * Punto 4: URL en el tab activo
 * Punto 5: Accesibilidad — aria-label, foco visible, contraste
 * Punto 5b: Export/Import movido a GlobalStats; aquí queda el botón rápido de backup
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { modeConfig, type LachoMode } from "../modes";

export type TabId = string;
type TabEntry = { id: TabId; label: string; modes: LachoMode[] | "all"; group: "general" | "mode" };

export const allTabs: TabEntry[] = [
  { id: "home",         label: "Inicio",             modes: "all",                         group: "general" },
  { id: "stats",        label: "Estadísticas",        modes: "all",                         group: "general" },
  { id: "metas",        label: "Metas",               modes: "all",                         group: "general" },
  { id: "rutina",       label: "Rutina",              modes: "all",                         group: "general" },
  { id: "missions",     label: "Aula Virtual",        modes: ["vet"] as LachoMode[],        group: "general" },
  { id: "missions",     label: "Terminal",            modes: ["dev"] as LachoMode[],        group: "general" },
  { id: "missions",     label: "Marca Personal",      modes: ["influencer"] as LachoMode[], group: "general" },
  { id: "neuro",        label: "Neurociencia",        modes: "all",                         group: "general" },
  { id: "logros",       label: "Logros",              modes: "all",                         group: "general" },
  // Vet
  { id: "academia",     label: "Academia",            modes: ["vet"],                       group: "mode" },
  { id: "clinica",      label: "Casos clínicos",      modes: ["vet"],                       group: "mode" },
  { id: "sara",         label: "Dream builder",       modes: ["vet"],                       group: "mode" },
  { id: "recursos-vet", label: "Recursos",            modes: ["vet"],                       group: "mode" },
  // Influencer
  { id: "dream-inf",    label: "Dream builder",       modes: ["influencer"],                group: "mode" },
  { id: "pipeline",     label: "Flujo de contenido",  modes: ["influencer"],                group: "mode" },
  { id: "recursos-inf", label: "Recursos",            modes: ["influencer"],                group: "mode" },
  // Dev
  { id: "proyectos",    label: "Proyectos",           modes: ["dev"],                       group: "mode" },
  { id: "log",          label: "Revisión",            modes: ["dev"],                       group: "mode" },
  { id: "recursos-dev", label: "Recursos",            modes: ["dev"],                       group: "mode" },
];

type Props = { mode: LachoMode; activeTab: TabId; onTabChange: (t: TabId) => void; onModeChange?: () => void };

export default function SystemSideNav({ mode, activeTab, onTabChange }: Props) {
  const [open, setOpen] = useState(false);
  const cfg = modeConfig[mode];
  const tabs = allTabs.filter((t) => t.modes === "all" || t.modes.includes(mode));

  useEffect(() => {
    if (!open) return;
    const ov = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ov; };
  }, [open]);

  // Punto 5: cerrar drawer con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const pick = (id: TabId) => {
    onTabChange(id);
    setOpen(false);
  };

  const exportBackup = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("lacho") || k.startsWith("solo-system"))) data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `lacho-desk-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Hamburger — Punto 5: aria-label descriptivo */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        className="fixed right-5 top-5 z-[60] flex flex-col items-center gap-1.5 px-2 py-2.5 text-[#55555a] hover:text-[#9ca3af] transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
        style={{ outlineColor: cfg.accent }}
      >
        <span className="w-5 h-px bg-current" />
        <span className="w-3.5 h-px bg-current" />
        <span className="w-5 h-px bg-current" />
      </button>

      {/* Desktop mini sidebar */}
      <nav aria-label="Navegación lateral" className="fixed left-4 top-1/2 z-[55] hidden -translate-y-1/2 flex-col lg:flex">
        {tabs.map((t, i) => {
          const prev = i > 0 ? tabs[i - 1].group : t.group;
          const isActive = activeTab === t.id;
          return (
            <div key={`m-${t.id}-${t.label}`}>
              {i > 0 && prev !== t.group && <div className="h-px bg-[#1e1e20] my-1.5 mx-1" aria-hidden="true" />}
              <button
                onClick={() => pick(t.id)}
                aria-label={t.label}
                aria-current={isActive ? "page" : undefined}
                className="rounded px-2 py-1 text-[7px] font-medium tracking-[0.1em] transition-all duration-300 text-left truncate max-w-[65px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 rounded"
                style={{
                  color: isActive ? "#ededef" : "#3a3a3f",
                  outlineColor: cfg.accent,
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#65656d"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#3a3a3f"; }}
              >
                {t.label}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-black/60"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              className="system-scrollbar fixed right-0 top-0 z-[80] h-[100dvh] w-[min(260px,82vw)] overflow-y-auto overscroll-contain bg-[#111113] border-l border-[#1e1e20] py-6 px-5 flex flex-col"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Close button — Punto 5: aria-label */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="absolute top-4 right-4 text-[#55555a] hover:text-[#9ca3af] transition-colors w-8 h-8 flex items-center justify-center rounded focus-visible:outline focus-visible:outline-2"
                style={{ outlineColor: cfg.accent }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </button>

              <div className="mb-5">
                {/* Punto 5: contraste mejorado — usamos color del modo (no #2a2a2f) */}
                <div className="text-[12px] font-semibold" style={{ color: cfg.accent }}>{cfg.label}</div>
              </div>

              {/* Tab list */}
              <nav className="flex-1" aria-label="Secciones">
                {tabs.map((t, i) => {
                  const prev = i > 0 ? tabs[i - 1].group : t.group;
                  const isActive = activeTab === t.id;
                  return (
                    <div key={`${t.id}-${t.label}`}>
                      {i > 0 && prev !== t.group && <div className="h-px bg-[#1e1e20] my-2" aria-hidden="true" />}
                      <button
                        onClick={() => pick(t.id)}
                        aria-current={isActive ? "page" : undefined}
                        className="w-full text-left px-2 py-2.5 rounded transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                        style={{
                          color: isActive ? cfg.accent : "#65656d",  /* Punto 5: de #45454a a #65656d para mejor contraste */
                          outlineColor: cfg.accent,
                        }}
                        onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
                        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#65656d"; }}
                      >
                        <span className="text-[12px] font-medium">{t.label}</span>
                      </button>
                    </div>
                  );
                })}
              </nav>

              {/* Footer: backup rápido */}
              <div className="mt-4 pt-3 border-t border-[#1e1e20] flex items-center justify-between">
                <span className="text-[8px] text-[#3a3a3f]">Jaén, ES</span>
                <button
                  onClick={exportBackup}
                  aria-label="Descargar backup de datos"
                  className="text-[9px] text-[#45454a] hover:text-[#9ca3af] transition-colors focus-visible:outline focus-visible:outline-2 rounded px-1"
                  style={{ outlineColor: cfg.accent }}
                >
                  ↓ backup
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
