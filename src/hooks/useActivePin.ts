"use client";

import { useCallback, useEffect, useState } from "react";
import { api, loadTokens } from "@/lib/api";

export type ActivePin = {
  id: string;
  pickup_code: string;
  status: string;
  junction_name: string;
  corridor_name: string;
  expires_at: string;
};

export const PIN_KEY = "transitsight-active-pin";

export function readStoredPin(): ActivePin | null {
  try {
    const raw = localStorage.getItem(PIN_KEY);
    return raw ? (JSON.parse(raw) as ActivePin) : null;
  } catch {
    return null;
  }
}

function writeStoredPin(p: ActivePin | null) {
  try {
    if (p) localStorage.setItem(PIN_KEY, JSON.stringify(p));
    else localStorage.removeItem(PIN_KEY);
  } catch {}
}

/** Shared live pin: stored copy immediately, backend truth when logged in,
 *  re-polled every 10s while the page is visible. */
export function useActivePin(poll = true) {
  const [pin, setPinState] = useState<ActivePin | null>(() => readStoredPin());

  const setPin = useCallback((p: ActivePin | null) => {
    setPinState(p);
    writeStoredPin(p);
  }, []);

  const clearPin = useCallback(() => {
    setPinState(null);
    writeStoredPin(null);
  }, []);

  useEffect(() => {
    if (!poll || !loadTokens()) return;
    let live = true;
    const sync = () => {
      if (!live || document.hidden) return;
      api.pin
        .active()
        .then((p) => {
          if (!live) return;
          if (p) {
            setPinState(p as ActivePin);
            writeStoredPin(p as ActivePin);
          } else {
            setPinState(null);
            writeStoredPin(null);
          }
        })
        .catch(() => {});
    };
    sync();
    const t = setInterval(sync, 10000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [poll]);

  return { pin, setPin, clearPin };
}
