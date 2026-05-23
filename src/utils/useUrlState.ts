/**
 * Punto 4: Estado del modo y la pestaña activa en la URL
 * Permite compartir un link directo a cualquier sección y
 * sobrevivir a un reload sin perder contexto.
 */
import { useCallback } from "react";
import type { LachoMode } from "../modes";
import type { TabId } from "../components/SystemSideNav";

const VALID_MODES: LachoMode[] = ["vet", "dev", "influencer"];

export function readUrlState(): { mode: LachoMode | null; tab: TabId | null } {
  if (typeof window === "undefined") return { mode: null, tab: null };
  const params = new URLSearchParams(window.location.search);
  const m = params.get("mode") as LachoMode | null;
  const t = params.get("tab");
  return {
    mode: m && VALID_MODES.includes(m) ? m : null,
    tab: t || null,
  };
}

export function useUrlState() {
  const pushState = useCallback((mode: LachoMode | null, tab: TabId) => {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    params.set("tab", tab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, []);

  const clearState = useCallback(() => {
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return { pushState, clearState };
}
