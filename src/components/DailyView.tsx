import { motion } from "framer-motion";
import { dailySchedule } from "../data";
import { useState } from "react";

const typeLabels: Record<string, string> = {
  vet: "○ Veterinaria", ebook: "○ Ebook", code: "○ Código",
  body: "○ Calistenia", mindset: "○ Mindset", bonus: "○ Bonus", reset: "· Descanso",
};

const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export default function DailyView() {
  const [day, setDay] = useState(0);
  const isWeekend = day >= 5;

  return (
    <section id="diario" className="relative py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-[10px] tracking-[0.1em] text-[#3a3a3f] font-medium mb-3">Rutina unificada</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em]" style={{ color: "#ededef" }}>Tu día completo</h2>
              <p className="text-[10px] text-[#3a3a3f] mt-2">Los 3 modos en un solo día. Veterinaria + Ebook + Código.</p>
            </div>
            <div className="flex gap-1">
              {days.map((d, i) => (
                <button key={d} onClick={() => setDay(i)} className={`w-9 h-9 rounded-lg text-[10px] font-medium transition-all duration-300 ${day === i ? "bg-[#222225] text-[#ededef]" : "text-[#3a3a3f] hover:text-[#65656d]"}`}>{d}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {isWeekend && (
          <div className="rounded-lg bg-[#151517] border border-[#1e1e20] px-4 py-2.5 mb-4 text-[10px] text-[#55555a]">
            Fin de semana — descanso activo o estudio libre.
          </div>
        )}

        <div className="rounded-xl border border-[#1e1e20] overflow-hidden">
          {dailySchedule.map((slot, i) => {
            const dimmed = isWeekend && slot.type === "body";
            const label = typeLabels[slot.type] || "·";
            return (
              <div key={i} className={`flex items-center border-b border-[#1e1e20]/50 last:border-b-0 px-5 py-3 transition-colors duration-300 hover:bg-[#151517] ${dimmed ? "opacity-20" : ""}`}>
                <span className="w-11 text-right text-[11px] font-mono font-medium text-[#3a3a3f] flex-shrink-0">{slot.time}</span>
                <span className="text-[9px] text-[#2a2a2d] mx-3 flex-shrink-0 w-20 truncate">{label}</span>
                <span className="flex-1 text-[12px] text-[#9ca3af] font-medium">{dimmed ? "Descanso activo" : slot.block}</span>
                <span className="text-[9px] font-mono text-[#2a2a2d] flex-shrink-0">{slot.min}m</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
