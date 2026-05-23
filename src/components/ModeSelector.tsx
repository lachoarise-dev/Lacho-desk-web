import { motion } from "framer-motion";
import { modeConfig, type LachoMode } from "../modes";

const modes: LachoMode[] = ["vet", "dev", "influencer"];

const modeIcons: Record<LachoMode, string> = {
  vet: "/images/icons/vet.webp",
  dev: "/images/icons/dev.webp",
  influencer: "/images/icons/influencer.webp",
};

type Props = { onSelect: (m: LachoMode) => void };

export default function ModeSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-[#111113] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg w-full"
        >
          {/* Title */}
          <div className="text-center mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.05em] leading-[0.85]"
              style={{
                color: "#ffffff",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "optimizeLegibility",
              }}
            >
              Lacho
              <br />
              Desk
            </motion.h1>
          </div>

          {/* Modes */}
          <div className="space-y-0">
            {modes.map((id, i) => {
              const cfg = modeConfig[id];
              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.8 }}
                  onClick={() => onSelect(id)}
                  className="w-full text-left py-5 border-b border-[#1e1e20] first:border-t transition-all duration-500 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 flex-shrink-0 transition-all duration-500 flex items-center justify-center"
                        style={{
                          opacity: 0.45,
                          filter: "brightness(0.9) contrast(1.05)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = "1";
                          (e.currentTarget as HTMLElement).style.filter = "brightness(1.15) contrast(1.1) drop-shadow(0 0 6px currentColor)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = "0.45";
                          (e.currentTarget as HTMLElement).style.filter = "brightness(0.9) contrast(1.05)";
                        }}
                      >
                        <img
                          src={modeIcons[id]}
                          alt={cfg.label}
                          width={48}
                          height={48}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            imageRendering: "auto",
                          }}
                          loading="eager"
                          decoding="sync"
                        />
                      </div>
                      <span
                        className="text-lg md:text-xl font-semibold transition-colors duration-500"
                        style={{
                          color: "#3a3a3f",
                          WebkitFontSmoothing: "antialiased",
                          MozOsxFontSmoothing: "grayscale",
                          textRendering: "optimizeLegibility",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = cfg.accent; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#3a3a3f"; }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <span
                      className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ color: cfg.accent }}
                    >
                      →
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-center text-[10px] mt-16 tracking-[0.15em]"
            style={{
              color: "#2a2a2f",
              WebkitFontSmoothing: "antialiased",
              textRendering: "optimizeLegibility",
            }}
          >
            selecciona tu modo
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
