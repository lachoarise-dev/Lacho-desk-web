/**
 * Punto 6 (Estadísticas globales): Dashboard de progreso de los 3 modos
 * Punto 5b (Export/Import): Botones de backup y restauración en este panel
 */
import { motion } from "framer-motion";
import { useState, useRef } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

const getNum = (k: string) => {
  try { return Number(localStorage.getItem(k) || 0); } catch { return 0; }
};
const getJSON = <T,>(k: string, fb: T): T => {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; }
};

/** Cuenta skills desbloqueadas en un árbol dado su storageKey y el prefijo de id */
const countSkills = (storageKey: string, treeId: string, total: number) => {
  const data = getJSON<Record<string, boolean>>(storageKey, {});
  const done = Object.keys(data).filter((k) => k.startsWith(`${treeId}-`) && data[k]).length;
  return { done: Math.min(done, total), total };
};

// ── export / import ─────────────────────────────────────────────────────────

function exportBackup() {
  const data: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith("lacho") || k.startsWith("solo-system"))) {
      data[k] = localStorage.getItem(k);
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lacho-desk-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(file: File, onDone: () => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as Record<string, string | null>;
      Object.entries(data).forEach(([k, v]) => {
        if (v !== null) localStorage.setItem(k, v);
        else localStorage.removeItem(k);
      });
      onDone();
    } catch {
      alert("Error al leer el archivo. Asegúrate de que es un backup válido de Lacho Desk.");
    }
  };
  reader.readAsText(file);
}

// ── sub-components ───────────────────────────────────────────────────────────

type BarProps = { label: string; done: number; total: number; color: string; delay?: number };
function ProgressBar({ label, done, total, color, delay = 0 }: BarProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[#9ca3af]">{label}</span>
        <span className="text-[11px] font-mono font-bold" style={{ color }}>{done}/{total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#2a2a2d] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

type RingProps = { pct: number; color: string; size?: number; stroke?: number };
function Ring({ pct, color, size = 80, stroke = 7 }: RingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a2d" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function GlobalStats() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  // ── datos en vivo ─────────────────────────────────────────────────────────
  // Skill trees (SkillTree.tsx guarda en "lacho-skill-tree")
  const devSkills  = countSkills("lacho-skill-tree", "code",  20);
  const vetSkills  = countSkills("lacho-skill-tree", "vet",   20);
  const infSkills  = countSkills("lacho-skill-tree", "brand", 20);

  // CareerSkillTree — árboles de carrera (CareerSkillTree.tsx)
  const vetCareer  = countSkills("lacho-vet-career-skill-tree",        "vet-career",        20);
  const infCareer  = countSkills("lacho-influencer-skill-tree",        "influencer-career", 20);

  // Casos clínicos
  const casesData  = getJSON<Record<number, boolean>>("lacho-cases-solved", {});
  const casesDone  = Object.values(casesData).filter(Boolean).length;

  // XP y logros
  const xp         = getNum("lacho-xp");
  const streak     = getNum("lacho-streak");
  const achievements = getJSON<unknown[]>("solo-system-achievements", []).length;

  // Progreso global ponderado
  const allBars = [devSkills, vetSkills, infSkills, vetCareer, infCareer, { done: casesDone, total: 50 }];
  const totalDone  = allBars.reduce((a, b) => a + b.done, 0);
  const totalMax   = allBars.reduce((a, b) => a + b.total, 0);
  const globalPct  = totalMax > 0 ? Math.round((totalDone / totalMax) * 100) : 0;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importBackup(file, () => {
      setImportMsg("✓ Backup restaurado correctamente");
      refresh();
      setTimeout(() => setImportMsg(null), 4000);
    });
    e.target.value = "";
  };

  return (
    <section key={refreshKey} className="relative py-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-[10px] tracking-[0.1em] text-[#3a3a3f] font-medium mb-3">Panel global</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-2" style={{ color: "#ededef" }}>
            Estadísticas
          </h2>
          <p className="text-sm text-[#55555a] font-light mb-10">
            Progreso total de los tres modos. Un solo vistazo.
          </p>
        </motion.div>

        {/* Global ring + quick numbers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="rounded-2xl border border-[#2a2a2d] bg-[#161618] p-6 mb-6 flex flex-wrap items-center gap-8"
        >
          <div className="relative flex-shrink-0">
            <Ring pct={globalPct} color="#ededef" size={96} stroke={8} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black font-mono" style={{ color: "#ededef" }}>{globalPct}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold mb-1" style={{ color: "#ededef" }}>Progreso global</div>
            <div className="text-xs text-[#55555a] mb-4">{totalDone} de {totalMax} habilidades y casos completados</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "XP total", value: xp.toLocaleString() },
                { label: "Racha días", value: streak },
                { label: "Logros", value: achievements },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-[#1e1e20] px-3 py-2 text-center">
                  <div className="text-base font-black font-mono" style={{ color: "#ededef" }}>{value}</div>
                  <div className="text-[9px] text-[#55555a] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mode cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Vet */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-2xl border border-[#2a2a2d] bg-[#161618] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🩺</span>
              <div>
                <div className="text-sm font-bold" style={{ color: "#ededef" }}>Veterinario</div>
                <div className="text-[9px] text-[#55555a]">Auxiliar / Asistente</div>
              </div>
              <div className="ml-auto relative flex-shrink-0">
                <Ring pct={Math.round(((vetSkills.done + vetCareer.done + casesDone) / (20 + 20 + 50)) * 100)} color="#6fcf97" size={44} stroke={4} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-black font-mono" style={{ color: "#6fcf97" }}>
                    {Math.round(((vetSkills.done + vetCareer.done + casesDone) / (20 + 20 + 50)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Árbol Veterinaria" done={vetSkills.done} total={vetSkills.total} color="#6fcf97" delay={0.3} />
              <ProgressBar label="Carrera Asistente" done={vetCareer.done} total={vetCareer.total} color="#6fcf97" delay={0.4} />
              <ProgressBar label="Casos clínicos" done={casesDone} total={50} color="#6fcf97" delay={0.5} />
            </div>
          </motion.div>

          {/* Dev */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-2xl border border-[#2a2a2d] bg-[#161618] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💻</span>
              <div>
                <div className="text-sm font-bold" style={{ color: "#ededef" }}>Programador</div>
                <div className="text-[9px] text-[#55555a]">Dev / Builder</div>
              </div>
              <div className="ml-auto relative flex-shrink-0">
                <Ring pct={Math.round((devSkills.done / devSkills.total) * 100)} color="#7baaf7" size={44} stroke={4} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-black font-mono" style={{ color: "#7baaf7" }}>
                    {Math.round((devSkills.done / devSkills.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Árbol Programación" done={devSkills.done} total={devSkills.total} color="#7baaf7" delay={0.4} />
            </div>
            <div className="mt-4 rounded-lg bg-[#1e1e20] p-3 text-center">
              <div className="text-[10px] text-[#55555a]">Más árboles próximamente</div>
            </div>
          </motion.div>

          {/* Influencer */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="rounded-2xl border border-[#2a2a2d] bg-[#161618] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📸</span>
              <div>
                <div className="text-sm font-bold" style={{ color: "#ededef" }}>Influencer</div>
                <div className="text-[9px] text-[#55555a]">Creador / Pro</div>
              </div>
              <div className="ml-auto relative flex-shrink-0">
                <Ring pct={Math.round(((infSkills.done + infCareer.done) / (20 + 20)) * 100)} color="#c9a84c" size={44} stroke={4} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-black font-mono" style={{ color: "#c9a84c" }}>
                    {Math.round(((infSkills.done + infCareer.done) / (20 + 20)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Árbol Marca Personal" done={infSkills.done} total={infSkills.total} color="#c9a84c" delay={0.5} />
              <ProgressBar label="Carrera Creador" done={infCareer.done} total={infCareer.total} color="#c9a84c" delay={0.6} />
            </div>
          </motion.div>
        </div>

        {/* Export / Import — Punto 5b */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="rounded-2xl border border-[#2a2a2d] bg-[#161618] p-6"
        >
          <div className="mb-4">
            <div className="text-sm font-bold mb-1" style={{ color: "#ededef" }}>Backup de progreso</div>
            <p className="text-[11px] text-[#55555a]">
              Exporta todo tu progreso a un archivo JSON. Impórtalo cuando cambies de dispositivo o navegador.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#3a3a3d] text-[12px] font-semibold transition-all duration-300 hover:border-[#ededef]/20"
              style={{ color: "#ededef", backgroundColor: "#1e1e20" }}
            >
              <span>↓</span> Exportar backup
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2a2a2d] text-[12px] font-semibold transition-all duration-300 hover:border-[#3a3a3d]"
              style={{ color: "#9ca3af", backgroundColor: "#19191b" }}
            >
              <span>↑</span> Importar backup
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          {importMsg && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[11px]" style={{ color: "#6fcf97" }}>
              {importMsg}
            </motion.p>
          )}
          <p className="text-[10px] text-[#3a3a3f] mt-4">
            El archivo incluye: árboles de habilidades, casos clínicos, logros, metas, notas y configuración de perfil.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
