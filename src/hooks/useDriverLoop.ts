"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiUnreachable, api, loadTokens } from "@/lib/api";

export type ZoneItem = {
  junction_id: string;
  name: string;
  corridor_id: string;
  corridor: string;
  active_pins: number;
  available_drivers: number;
  score: number;
};

export type InboxPin = {
  id: string;
  pickup_code: string;
  status: string;
  junction_name: string;
  corridor_name: string;
  vehicle_type: string;
  raw_latitude: string | number;
  raw_longitude: string | number;
};

const HEARTBEAT_MS = 20000;
const POLL_MS = 15000;

function gpsOnce(): Promise<{ lat: number; lng: number; acc?: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("No geolocation"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
        }),
      () => reject(new Error("Location blocked")),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  });
}

export function useDriverLoop() {
  const authed =
    typeof window !== "undefined" && loadTokens() !== null;
  const [online, setOnlineState] = useState(true);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [pins, setPins] = useState<InboxPin[]>([]);
  const [wsLive, setWsLive] = useState(false);
  const [error, setError] = useState("");
  const onlineRef = useRef(online);

  useEffect(() => {
    onlineRef.current = online;
  });

  const refreshZones = useCallback(async () => {
    if (!loadTokens()) return;
    try {
      const data = (await api.driverZones()) as {
        top3: ZoneItem[];
        junctions: ZoneItem[];
      };
      setZones(data.junctions ?? []);
      setError("");
    } catch {
      // Keep last known zones on failure.
    }
  }, []);

  const refreshPins = useCallback(async () => {
    if (!loadTokens()) return;
    try {
      const data = (await api.driverPins()) as InboxPin[];
      setPins(Array.isArray(data) ? data : []);
    } catch {
      // Keep last known inbox on failure.
    }
  }, []);

  // Online toggle (server when possible, local always).
  const setOnline = useCallback(async (value: boolean) => {
    setOnlineState(value);
    setError("");
    if (!loadTokens()) return;
    try {
      await api.driverOnline(value);
    } catch (e) {
      if (!(e instanceof ApiUnreachable)) {
        setError(e instanceof Error ? e.message : "Shift update failed.");
      }
    }
  }, []);

  // GPS heartbeat while online + tab visible.
  useEffect(() => {
    if (!loadTokens()) return;
    const beat = async () => {
      if (!onlineRef.current || document.hidden) return;
      try {
        const pos = await gpsOnce();
        await api.driverHeartbeat({
          latitude: pos.lat,
          longitude: pos.lng,
          accuracy_meters: pos.acc,
        });
      } catch {
        // Next beat retries; never break the UI.
      }
    };
    beat();
    const t = setInterval(beat, HEARTBEAT_MS);
    const onVisible = () => {
      if (!document.hidden) beat();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Polling fallback every 15s while online (first load inline so the
  // effect body itself never calls setState).
  useEffect(() => {
    if (!loadTokens()) return;
    let live = true;
    api
      .driverZones()
      .then((data) => {
        if (!live) return;
        const z = (data as { junctions?: ZoneItem[] }).junctions ?? [];
        setZones(z);
      })
      .catch(() => {});
    api
      .driverPins()
      .then((data) => {
        if (!live) return;
        setPins(Array.isArray(data) ? (data as InboxPin[]) : []);
      })
      .catch(() => {});
    const t = setInterval(() => {
      if (!onlineRef.current || !live) return;
      api
        .driverZones()
        .then((data) => {
          if (!live) return;
          setZones(
            (data as { junctions?: ZoneItem[] }).junctions ?? []
          );
        })
        .catch(() => {});
      api
        .driverPins()
        .then((data) => {
          if (!live) return;
          setPins(Array.isArray(data) ? (data as InboxPin[]) : []);
        })
        .catch(() => {});
    }, POLL_MS);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, []);

  // Live socket (enhancement over polling) with backoff reconnect.
  useEffect(() => {
    const tokens = loadTokens();
    if (!tokens) return;
    let ws: WebSocket | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let backoff = 10000;
    const connect = () => {
      if (closed || document.hidden) {
        retry = setTimeout(() => {
          if (!closed) connect();
        }, backoff);
        return;
      }
      try {
        ws = new WebSocket(api.wsDriverUrl(tokens.access));
      } catch {
        backoff = Math.min(backoff * 2, 60000);
        retry = setTimeout(() => {
          if (!closed) connect();
        }, backoff);
        return;
      }
      ws.onopen = () => {
        setWsLive(true);
        backoff = 10000;
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as { kind?: string };
          if (msg.kind === "demand") refreshZones();
          else refreshPins();
        } catch {}
      };
      const down = () => {
        setWsLive(false);
        backoff = Math.min(backoff * 2, 60000);
        if (!closed) {
          retry = setTimeout(connect, backoff);
        }
      };
      ws.onclose = down;
      ws.onerror = () => {
        try {
          ws?.close();
        } catch {}
      };
    };
    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      try {
        ws?.close();
      } catch {}
    };
  }, [refreshZones, refreshPins]);

  const accept = useCallback(
    async (id: string) => {
      setError("");
      try {
        await api.pinAccept(id);
        await refreshPins();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Accept failed.");
      }
    },
    [refreshPins]
  );

  const decline = useCallback(
    async (id: string) => {
      setError("");
      try {
        await api.pinDecline(id);
        await refreshPins();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Decline failed.");
      }
    },
    [refreshPins]
  );

  const complete = useCallback(
    async (id: string, pickup_code: string) => {
      setError("");
      try {
        await api.pinComplete(id, pickup_code);
        await refreshPins();
        await refreshZones();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Complete failed.");
      }
    },
    [refreshPins, refreshZones]
  );

  return {
    authed,
    online,
    setOnline,
    zones,
    pins,
    wsLive,
    error,
    refreshZones,
    refreshPins,
    accept,
    decline,
    complete,
  };
}
