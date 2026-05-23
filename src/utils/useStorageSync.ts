/**
 * Punto 3: Sincronización de localStorage entre pestañas
 * Escucha el evento "storage" nativo del browser y dispara un re-render
 * cuando otra pestaña modifica una clave de Lacho Desk.
 */
import { useEffect } from "react";

type StorageSyncCallback = (key: string, newValue: string | null) => void;

const listeners = new Map<string, Set<StorageSyncCallback>>();

/** Escucha cambios en una clave específica (o todas si key="*") */
export function useStorageSync(key: string, cb: StorageSyncCallback) {
  useEffect(() => {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(cb);
    return () => { listeners.get(key)?.delete(cb); };
  }, [key, cb]);
}

/** Wrapper de localStorage.setItem que también notifica a otras pestañas */
export function setStorage(key: string, value: string) {
  localStorage.setItem(key, value);
  // Dispara el evento manualmente para la pestaña actual
  // (el evento "storage" nativo solo llega a otras pestañas)
  window.dispatchEvent(new StorageEvent("storage", { key, newValue: value, storageArea: localStorage }));
}

/** Inicializa el listener global — llamar una sola vez en main.tsx */
export function initStorageSync() {
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    // Notificar listeners específicos de esa clave
    listeners.get(e.key)?.forEach((cb) => cb(e.key!, e.newValue));
    // Notificar listeners globales
    listeners.get("*")?.forEach((cb) => cb(e.key!, e.newValue));
  });
}
