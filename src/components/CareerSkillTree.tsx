import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { setStorage } from "../utils/useStorageSync";

type Skill = { name: string; desc: string; tier: number; requires?: string };

type TreeConfig = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  storageKey: string;
  tiers: string[];
  fromLabel: string;
  toLabel: string;
  skills: Skill[];
  accentColor: string;
};

const influencerTree: TreeConfig = {
  id: "influencer-career",
  title: "Árbol de Creador",
  subtitle: "De novato publicando por impulso a creador con sistema propio.",
  icon: "📸",
  storageKey: "lacho-influencer-skill-tree",
  fromLabel: "Novato",
  toLabel: "Creador Pro",
  accentColor: "#c9a84c",
  tiers: ["Novato", "Creador", "Estratega", "Autoridad", "Profesional"],
  skills: [
    // Tier 0 - Novato
    { name: "Nicho definido", desc: "Una frase que resume a quién ayudas, con qué y para qué. Sin nicho, sin dirección.", tier: 0 },
    { name: "Bio magnética", desc: "Bio de IG que captura en 3 segundos: quién eres, qué ofreces, CTA claro.", tier: 0 },
    { name: "Foto de perfil profesional", desc: "Buena iluminación, fondo limpio, expresión accesible. La cara vende antes que el texto.", tier: 0 },
    { name: "Primeros 9 posts", desc: "Feed inicial coherente. Tres tipos: valor, historia personal, prueba social.", tier: 0 },
    // Tier 1 - Creador
    { name: "Reels de 15-30s", desc: "Estructura ganadora: hook 2s, valor, CTA. Edición con CapCut o similar.", tier: 1, requires: "Nicho definido" },
    { name: "Carrusel educativo", desc: "5-8 slides con idea clara, progresión lógica y último slide con CTA.", tier: 1, requires: "Primeros 9 posts" },
    { name: "Hook de texto", desc: "Primeras líneas que paran el scroll. Formatos: pregunta, contraintuitivo, dato.", tier: 1, requires: "Bio magnética" },
    { name: "Consistencia 30 días", desc: "Publicar al menos 4 veces/semana durante 30 días sin falta. El algoritmo premia la consistencia.", tier: 1, requires: "Primeros 9 posts" },
    // Tier 2 - Estratega
    { name: "Análisis de métricas", desc: "Leer alcance, guardados, compartidos y retención en Reels. Saber qué replicar.", tier: 2, requires: "Reels de 15-30s" },
    { name: "Calendario editorial", desc: "Plan mensual con temas, formatos y fechas. Nunca improvisar desde cero.", tier: 2, requires: "Consistencia 30 días" },
    { name: "Stories con engagement", desc: "Encuestas, preguntas, Q&A semanales. Las Stories construyen comunidad diaria.", tier: 2, requires: "Hook de texto" },
    { name: "Colaboraciones estratégicas", desc: "Identificar 5 cuentas afines, propuesta de valor clara y primer collab.", tier: 2, requires: "Carrusel educativo" },
    // Tier 3 - Autoridad
    { name: "Lead magnet", desc: "PDF, checklist o mini-curso gratuito que captura emails a cambio de valor.", tier: 3, requires: "Análisis de métricas" },
    { name: "Lista de email", desc: "Formulario activo, secuencia de bienvenida de 3 emails y envío semanal.", tier: 3, requires: "Lead magnet" },
    { name: "Directos/Lives", desc: "Al menos un Live mensual. Preguntas en vivo, valor sin guión y CTA al final.", tier: 3, requires: "Stories con engagement" },
    { name: "Contenido pilar evergreen", desc: "3 posts que siempre funcionan y puedes reutilizar o actualizar cada trimestre.", tier: 3, requires: "Calendario editorial" },
    // Tier 4 - Profesional
    { name: "Producto propio", desc: "Ebook, curso o servicio lanzado con página de ventas y proceso de pago real.", tier: 4, requires: "Lista de email" },
    { name: "Embudo automatizado", desc: "Tráfico → lead magnet → email nurture → oferta. Funciona sin ti 24h.", tier: 4, requires: "Producto propio" },
    { name: "Ingresos recurrentes", desc: "Al menos una fuente que genera ingresos pasivos: afiliados, membresía o producto digital.", tier: 4, requires: "Embudo automatizado" },
    { name: "Sistema replicable", desc: "Tienes procesos documentados, batch de contenido semanal y delegas edición.", tier: 4, requires: "Ingresos recurrentes" },
  ],
};

const vetTree: TreeConfig = {
  id: "vet-career",
  title: "Árbol de Asistente Vet",
  subtitle: "De aprendiz de becario a asistente veterinario consolidado.",
  icon: "🩺",
  storageKey: "lacho-vet-career-skill-tree",
  fromLabel: "Becario",
  toLabel: "Asistente Consolidado",
  accentColor: "#6fcf97",
  tiers: ["Becario", "Auxiliar Junior", "Auxiliar", "Asistente", "Consolidado"],
  skills: [
    // Tier 0 - Becario
    { name: "Protocolo de higiene", desc: "Lavado de manos, EPIs correctos, desinfección de superficies y gestión de residuos.", tier: 0 },
    { name: "Anatomía topográfica", desc: "Regiones del cuerpo en perro y gato: localizar palpación, auscultación y venopunción.", tier: 0 },
    { name: "Terminología básica", desc: "100 términos clave: signos, procedimientos, fármacos y abreviaturas de historia clínica.", tier: 0 },
    { name: "Orden en consulta", desc: "Preparar camilla, instrumental, bozales, guantes y registros antes de que entre el paciente.", tier: 0 },
    // Tier 1 - Auxiliar Junior
    { name: "Sujeción segura", desc: "Técnicas para perro, gato y lagomorfos sin daño al animal ni al equipo.", tier: 1, requires: "Anatomía topográfica" },
    { name: "Constantes vitales", desc: "Medir FC, FR, temperatura y mucosas. Registrar y comparar con rangos normales por especie.", tier: 1, requires: "Anatomía topográfica" },
    { name: "Historia clínica básica", desc: "Recoger anamnesis: motivo, vacunas, desparasitación, dieta y alergias.", tier: 1, requires: "Terminología básica" },
    { name: "Material quirúrgico", desc: "Identificar instrumental, preparar campo estéril, contar gasas y empaquetar para autoclave.", tier: 1, requires: "Protocolo de higiene" },
    // Tier 2 - Auxiliar
    { name: "Venopunción y catéter", desc: "Cefálica y yugular en perro/gato. Colocación de catéter IV y mantenimiento.", tier: 2, requires: "Sujeción segura" },
    { name: "Toma de muestras", desc: "Sangre, orina, raspado, hisopado. Preparar, etiquetar y enviar a laboratorio.", tier: 2, requires: "Constantes vitales" },
    { name: "Hospitalización y cuidados", desc: "Jaulas, alimentación según protocolo, medicación supervisada y registros de evolución.", tier: 2, requires: "Historia clínica básica" },
    { name: "Laboratorio básico", desc: "Tiras reactivas, centrifugado, frotis sanguíneo y lectura básica de hemograma.", tier: 2, requires: "Toma de muestras" },
    // Tier 3 - Asistente
    { name: "Asistencia en consulta", desc: "Anticipar al veterinario: vacunas preparadas, fichas abiertas, sujeción lista.", tier: 3, requires: "Venopunción y catéter" },
    { name: "Preanestesia", desc: "Peso, ayuno, premedicación supervisada, vía IV y monitorización básica pre-inducción.", tier: 3, requires: "Hospitalización y cuidados" },
    { name: "Asistencia quirúrgica", desc: "Campo estéril, instrumentación básica durante cirugía y registro anestésico.", tier: 3, requires: "Preanestesia" },
    { name: "Comunicación con tutores", desc: "Explicar cuidados post-op, medicación en casa y señales de alarma de forma clara.", tier: 3, requires: "Asistencia en consulta" },
    // Tier 4 - Consolidado
    { name: "Gestión de farmacia", desc: "Control de stock, pedidos, almacenamiento por cadena de frío y registro de psicotrópicos.", tier: 4, requires: "Asistencia quirúrgica" },
    { name: "Urgencias básicas", desc: "Reconocer shock, disnea, convulsiones: priorizar, estabilizar y comunicar al veterinario.", tier: 4, requires: "Preanestesia" },
    { name: "Gestión de clínica", desc: "Agenda, cobros, apertura/cierre, stock de consumibles y protocolos de limpieza.", tier: 4, requires: "Comunicación con tutores" },
    { name: "Asistente consolidado", desc: "Autonomía en rutinas, criterio en urgencias, referente para nuevos becarios y plan de formación continua.", tier: 4, requires: "Urgencias básicas" },
  ],
};

const loadUnlocked = (storageKey: string): Record<string, boolean> => {
  try {
    const r = localStorage.getItem(storageKey);
    return r ? JSON.parse(r) : {};
  } catch { return {}; }
};

type Props = { config: "influencer" | "vet" };

export default function CareerSkillTree({ config }: Props) {
  const tree = config === "influencer" ? influencerTree : vetTree;
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>(() => loadUnlocked(tree.storageKey));

  useEffect(() => {
    setStorage(tree.storageKey, JSON.stringify(unlocked));
  }, [unlocked, tree.storageKey]);

  const k = (skillName: string) => `${tree.id}-${skillName}`;
  const isUnlockable = (skill: Skill) => !skill.requires || !!unlocked[k(skill.requires)];
  const toggle = (skill: Skill) => {
    const key = k(skill.name);
    if (unlocked[key]) {
      setUnlocked((u) => { const n = { ...u }; delete n[key]; return n; });
    } else if (isUnlockable(skill)) {
      setUnlocked((u) => ({ ...u, [key]: true }));
    }
  };

  const total = tree.skills.length;
  const done = tree.skills.filter((s) => unlocked[k(s.name)]).length;
  const pct = Math.round((done / total) * 100);
  const currentTier = Math.min(tree.tiers.length - 1, Math.floor(done / 4));

  return (
    <section className="relative py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[10px] tracking-[0.1em] text-[#3a3a3f] font-medium mb-3">Progresión</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] mb-2" style={{ color: "#ededef" }}>
            {tree.title}
          </h2>
          <p className="text-sm text-[#55555a] font-light max-w-lg mb-8">{tree.subtitle}</p>
        </motion.div>

        {/* Progress card */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-[#2a2a2d] bg-[#161618] p-6 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tree.icon}</span>
              <div>
                <div className="text-base font-bold" style={{ color: "#ededef" }}>{tree.fromLabel} → {tree.toLabel}</div>
                <div className="text-xs" style={{ color: "#55555a" }}>
                  {done}/{total} habilidades · Nivel actual: <span style={{ color: tree.accentColor }}>{tree.tiers[currentTier]}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono" style={{ color: tree.accentColor }}>{pct}%</span>
              <div className="text-[10px] text-[#3a3a3f]">completado</div>
            </div>
          </div>

          {/* Main progress bar */}
          <div className="h-2 rounded-full bg-[#2a2a2d] overflow-hidden mb-5">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ backgroundColor: tree.accentColor }}
            />
          </div>

          {/* Tier milestones */}
          <div className="flex gap-1 mb-6">
            {tree.tiers.map((tierName, i) => {
              const tierDone = tree.skills.filter((s) => s.tier === i && unlocked[k(s.name)]).length;
              const tierTotal = tree.skills.filter((s) => s.tier === i).length;
              const isFull = tierDone === tierTotal;
              const isActive = i === currentTier;
              return (
                <div key={tierName} className="flex-1 text-center">
                  <div
                    className="h-1.5 rounded-full mb-1.5 transition-all duration-500"
                    style={{ backgroundColor: isFull ? tree.accentColor : isActive ? tree.accentColor + "44" : "#2a2a2d" }}
                  />
                  <div className="text-[9px] font-medium" style={{ color: isFull ? tree.accentColor : isActive ? "#9ca3af" : "#3a3a3f" }}>
                    {tierName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress table: 20 dots */}
          <div>
            <div className="text-[9px] text-[#3a3a3f] font-mono mb-2 tracking-widest">TABLA DE PROGRESO</div>
            <div className="grid grid-cols-10 gap-1.5">
              {tree.skills.map((skill, idx) => {
                const isDone = !!unlocked[k(skill.name)];
                return (
                  <div
                    key={skill.name}
                    title={`${idx + 1}. ${skill.name}`}
                    className="group relative"
                  >
                    <div
                      className="w-full aspect-square rounded-md transition-all duration-400 cursor-default border"
                      style={{
                        backgroundColor: isDone ? tree.accentColor + "22" : "#1a1a1c",
                        borderColor: isDone ? tree.accentColor : "#2a2a2d",
                      }}
                    >
                      {isDone && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tree.accentColor }} />
                        </div>
                      )}
                    </div>
                    <div className="text-[7px] text-center mt-0.5 font-mono" style={{ color: isDone ? tree.accentColor : "#3a3a3f" }}>
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Skill tiers */}
        <div className="space-y-8">
          {tree.tiers.map((tierName, tierIndex) => {
            const tierSkills = tree.skills.filter((s) => s.tier === tierIndex);
            const tierDone = tierSkills.filter((s) => unlocked[k(s.name)]).length;
            if (!tierSkills.length) return null;
            return (
              <motion.div
                key={tierName}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: tierIndex * 0.07 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-mono text-[#3a3a3f]">NIVEL {tierIndex + 1}</span>
                  <span className="text-sm font-bold" style={{ color: "#ededef" }}>{tierName}</span>
                  <span className="text-[10px]" style={{ color: tree.accentColor }}>{tierDone}/{tierSkills.length}</span>
                  <div className="flex-1 h-px bg-[#2a2a2d]" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {tierSkills.map((skill) => {
                    const sk = k(skill.name);
                    const isDone = !!unlocked[sk];
                    const canDo = isUnlockable(skill);
                    const isLocked = !isDone && !canDo;
                    return (
                      <button
                        key={skill.name}
                        onClick={() => toggle(skill)}
                        disabled={isLocked}
                        className="rounded-xl border p-4 text-left transition-all duration-300 group"
                        style={{
                          borderColor: isDone ? tree.accentColor + "55" : isLocked ? "#1e1e20" : "#2a2a2d",
                          backgroundColor: isDone ? tree.accentColor + "0a" : "#161618",
                          opacity: isLocked ? 0.35 : 1,
                          cursor: isLocked ? "not-allowed" : "pointer",
                        }}
                      >
                        <span
                          className="text-[9px] font-medium"
                          style={{ color: isDone ? tree.accentColor : isLocked ? "#3a3a3f" : "#55555a" }}
                        >
                          {isDone ? "✓ Dominado" : isLocked ? "🔒 Bloqueado" : "· Disponible"}
                        </span>
                        <div
                          className="text-sm font-semibold mt-1 leading-tight"
                          style={{ color: isDone ? "#ededef" : isLocked ? "#3a3a3f" : "#9ca3af" }}
                        >
                          {skill.name}
                        </div>
                        <p className="text-[10px] text-[#55555a] mt-1.5 leading-snug">{skill.desc}</p>
                        {skill.requires && (
                          <p className="text-[9px] mt-2" style={{ color: "#3a3a3f" }}>← {skill.requires}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
