import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { flashcardTemplates, pathMeta, recallQuestionBank, type PathId } from "../learningData";

import type { LachoMode } from "../modes";

const modeToPath: Record<LachoMode, PathId> = { vet: "vet", influencer: "ebook", dev: "code" };

const loadNotes = () => {
  try {
    const raw = localStorage.getItem("solo-system-recall-notes");
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

type Props = { mode?: LachoMode };

export default function RecallStudio({ mode }: Props) {
  const filteredIds: PathId[] = mode ? [modeToPath[mode]] : (Object.keys(pathMeta) as PathId[]);
  const [active, setActive] = useState<PathId>(filteredIds[0]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>(loadNotes);
  const [grade, setGrade] = useState(3);
  const meta = pathMeta[active];
  const questions = recallQuestionBank[active];
  const question = questions[questionIndex % questions.length];
  const noteKey = `${active}-${questionIndex}`;

  useEffect(() => {
    localStorage.setItem("solo-system-recall-notes", JSON.stringify(notes));
  }, [notes]);

  const gradeText = useMemo(() => {
    if (grade <= 2) return "Rojo: repasar hoy";
    if (grade <= 4) return "Amarillo: repasar en D+1";
    return "Verde: repasar en D+3/D+7";
  }, [grade]);

  const nextQuestion = () => {
    setQuestionIndex((current) => (current + 1) % questions.length);
    setGrade(3);
  };

  return (
    <section id="recall" className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="text-[10px] tracking-[0.1em] text-[#3a3a3f] font-medium mb-3">Academia</div>
          <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] mb-4" style={{ color: "#ededef" }}>
            Prueba antes de releer
          </h2>
          <p className="text-sm text-[#55555a] font-light max-w-lg mx-auto">
            Responde sin mirar, califica tu dominio y convierte lagunas en flashcards.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filteredIds.map((id) => {
            const item = pathMeta[id];
            const isActive = id === active;
            return (
              <button
                key={id}
                onClick={() => {
                  setActive(id);
                  setQuestionIndex(0);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive ? "text-slate-950" : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"
                }`}
                style={isActive ? { backgroundColor: item.hex, boxShadow: `0 0 22px ${item.hex}80` } : undefined}
              >
                {item.icon} {item.title}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-6">
          <motion.div
            key={active + questionIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rune-border rounded-2xl bg-slate-900/65 backdrop-blur p-6"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div>
                <div className="text-xs uppercase tracking-widest" style={{ color: meta.hex }}>Pregunta activa</div>
                <h3 className="text-2xl font-black text-white mt-1">{question}</h3>
              </div>
              <button
                onClick={nextQuestion}
                className="rounded-xl px-4 py-2 bg-slate-950/70 border border-slate-700 text-sm text-slate-200 hover:border-cyan-400 transition-colors"
              >
                Nueva pregunta
              </button>
            </div>

            <textarea
              value={notes[noteKey] || ""}
              onChange={(event) => setNotes((current) => ({ ...current, [noteKey]: event.target.value }))}
              rows={9}
              placeholder="Responde sin mirar. Luego corrige con tus apuntes y añade que olvidaste."
              className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />

            <div className="mt-5 rounded-xl bg-slate-950/45 border border-slate-800 p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-black text-white">Autoevaluacion</span>
                <span className="text-sm font-black font-mono" style={{ color: meta.hex }}>{grade}/5 · {gradeText}</span>
              </div>
              <input
                min="1"
                max="5"
                type="range"
                value={grade}
                onChange={(event) => setGrade(Number(event.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </motion.div>

          <motion.div
            key={`${active}-templates`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rune-border rounded-2xl bg-slate-900/65 backdrop-blur p-6"
          >
            <div className="mb-5">
              <div className="text-xs uppercase tracking-widest" style={{ color: meta.hex }}>Plantillas Anki / Notion</div>
              <h3 className="text-2xl font-black text-white">Convierte errores en tarjetas</h3>
            </div>
            <div className="space-y-3">
              {flashcardTemplates[active].map((template) => (
                <div key={template.name} className="rounded-xl bg-slate-950/45 border border-slate-800 p-4">
                  <h4 className="font-black text-white mb-2">{template.name}</h4>
                  <div className="text-xs text-slate-400 mb-1">Frente</div>
                  <p className="text-sm text-slate-200 mb-3">{template.front}</p>
                  <div className="text-xs text-slate-400 mb-1">Reverso</div>
                  <p className="text-sm text-slate-300">{template.back}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
