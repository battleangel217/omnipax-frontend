"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiUnreachable, api } from "@/lib/api";
import type { ClosureSegment } from "@/components/AdminLiveMap";
import {
  ABAK_JUNCTION,
  AKA_SOUTH,
  IBOM_PLAZA,
  IKOT_EKPENE_RD,
  ORON_RD,
  TROPICANA,
  type LatLng,
} from "@/components/map-data";

const LiveMap = dynamic(() => import("@/components/AdminLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[500px] w-full items-center justify-center bg-surface-container-low">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

type Status = "active" | "scheduled" | "expired";

type Closure = ClosureSegment & {
  name: string;
  status: Status;
  restriction: string;
  schedule: string;
  meta: string;
  buffer: string;
};

type AdminTab = "geofence" | "corridors" | "zones" | "system";

type Corridor = {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
};
type Junction = {
  id: string;
  name: string;
  corridor: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
};
type RestrictedZone = {
  id: string;
  name: string;
  coordinates: { center: [number, number]; radius_m: number };
  restriction_type: string;
  reason: string;
  is_active: boolean;
};

const WELLINGTON: LatLng = [5.022, 7.939];

const SEED: Closure[] = [
  {
    id: "aka",
    name: "Aka Road",
    status: "active",
    restriction: "Restriction: No Keke",
    schedule: "From 1 Oct 2026",
    meta: "Sector 2",
    buffer: "Buffer: 30m · 24h daily enforcement",
    line: [IBOM_PLAZA, AKA_SOUTH],
  },
  {
    id: "abak",
    name: "Abak Road Roundabout",
    status: "active",
    restriction: "Peak hours only, 7 to 9 am",
    schedule: "Daily recurring",
    meta: "",
    buffer: "",
    line: [IBOM_PLAZA, ABAK_JUNCTION],
  },
  {
    id: "wellington",
    name: "Wellington Bassey Way",
    status: "active",
    restriction: "Gov House zone, no commercial transit",
    schedule: "Permanent order",
    meta: "",
    buffer: "",
    line: [IBOM_PLAZA, WELLINGTON],
  },
  {
    id: "ikot",
    name: "Ikot Ekpene Rd (Flyover)",
    status: "scheduled",
    restriction: "Road maintenance & resurfacing",
    schedule: "Starts 15 Nov 2026",
    meta: "",
    buffer: "",
    line: [IBOM_PLAZA, IKOT_EKPENE_RD],
  },
];

const CORRIDOR_LINES: Array<{ name: string; line: LatLng[] }> = [
  { name: "Oron Road", line: [IBOM_PLAZA, ORON_RD, TROPICANA] },
  { name: "Ikot Ekpene Road", line: [IBOM_PLAZA, IKOT_EKPENE_RD] },
  { name: "Abak Road", line: [IBOM_PLAZA, ABAK_JUNCTION] },
  { name: "Aka Road", line: [IBOM_PLAZA, AKA_SOUTH] },
  { name: "Wellington Bassey Way", line: [IBOM_PLAZA, WELLINGTON] },
];

function Clock() {
  const [now, setNow] = useState("--:--:--");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          timeZone: "Africa/Lagos",
        })
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="font-mono">{now} WAT</span>;
}

/* ──────────────────────────────────────────────────────────
   Sidebar navigation
   ────────────────────────────────────────────────────────── */
function Sidebar({
  tab,
  setTab,
  backend,
}: {
  tab: AdminTab;
  setTab: (t: AdminTab) => void;
  backend: string;
}) {
  const NAV: Array<{
    icon: string;
    label: string;
    key: AdminTab;
  }> = [
    { icon: "hub", label: "Geofence Manager", key: "geofence" },
    { icon: "route", label: "Corridors & Junctions", key: "corridors" },
    { icon: "block", label: "Restricted Zones", key: "zones" },
    { icon: "monitor_heart", label: "System Overview", key: "system" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-[240px] select-none flex-col justify-between bg-primary-container text-on-primary lg:flex">
      <div className="flex flex-col">
        <div className="flex h-16 items-center gap-2 px-4">
          <Link
            href="/"
            aria-label="TransitSight home"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container">
              <span className="material-symbols-outlined text-[20px] text-on-secondary">
                alt_route
              </span>
            </div>
            <span className="text-[20px] font-semibold tracking-tight">
              TransitSight
            </span>
          </Link>
        </div>
        <div className="px-4 py-1">
          <span className="text-[13px] uppercase tracking-wider text-on-primary-container">
            Operations Core
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV.map((n) => (
            <button
              key={n.key}
              type="button"
              onClick={() => setTab(n.key)}
              aria-current={tab === n.key ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors text-left ${
                tab === n.key
                  ? "bg-secondary-container font-medium text-[13px] text-on-secondary"
                  : "text-[14px] text-on-primary-container hover:bg-surface-variant/20 hover:text-on-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {n.icon}
              </span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-4 bg-primary-container p-4">
        <div className="flex items-center justify-between rounded-lg bg-surface-container-highest/10 px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                backend === "ok"
                  ? "animate-pulse bg-tertiary-fixed-dim"
                  : backend === "checking"
                    ? "animate-pulse bg-outline-variant"
                    : "bg-error"
              }`}
            />
            <span className="text-[13px] text-on-primary-container">
              Backend
            </span>
          </div>
          <span className="text-[13px] font-medium text-on-primary">
            {backend}
          </span>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="material-symbols-outlined text-[18px] text-on-primary">
              person
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-medium text-on-primary">
              Uyo Transit Command
            </span>
            <span className="truncate text-[13px] text-on-primary-container">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab: Geofence Manager (original functionality preserved)
   ────────────────────────────────────────────────────────── */
function GeofenceTab() {
  const [closures, setClosures] = useState<Closure[]>(SEED);
  const [selectedId, setSelectedId] = useState<string | null>("aka");
  const [filter, setFilter] = useState<
    "active" | "scheduled" | "expired" | "all"
  >("active");
  const [query, setQuery] = useState("");
  const [overlayOn, setOverlayOn] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCorridor, setNewCorridor] = useState(CORRIDOR_LINES[0].name);

  const counts = useMemo(
    () => ({
      active: closures.filter((c) => c.status === "active").length,
      scheduled: closures.filter((c) => c.status === "scheduled").length,
      expired: closures.filter((c) => c.status === "expired").length,
    }),
    [closures]
  );

  const visible = closures.filter((c) => {
    const matchFilter =
      filter === "all" ? c.status !== "expired" || true : c.status === filter;
    const q = query.trim().toLowerCase();
    return matchFilter && (!q || c.name.toLowerCase().includes(q));
  });

  function flip(id: string) {
    setClosures((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              status:
                c.status === "active"
                  ? ("scheduled" as Status)
                  : ("active" as Status),
            }
          : c
      )
    );
  }

  function remove(id: string) {
    setClosures((cs) => cs.filter((c) => c.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }

  function add() {
    const name = newName.trim();
    if (!name) return;
    const line =
      CORRIDOR_LINES.find((c) => c.name === newCorridor)?.line ??
      CORRIDOR_LINES[0].line;
    const id = `custom-${Date.now()}`;
    setClosures((cs) => [
      {
        id,
        name,
        status: "scheduled",
        restriction: "Pending review",
        schedule: "Draft",
        meta: "",
        buffer: "",
        line,
      },
      ...cs,
    ]);
    setSelectedId(id);
    setNewName("");
    setAdding(false);
    setFilter("scheduled");
  }

  return (
    <>
      <div className="z-20 flex w-full items-center justify-between bg-surface-container-lowest px-6 py-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold tracking-tight text-primary">
              Geofence Manager
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-0.5 text-[13px] font-medium text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-on-tertiary-container" />
              Live sync active
            </span>
          </div>
          <p className="text-[13px] text-on-surface-variant">
            Akwa Ibom State Transit Geofencing & Corridor Regulation · Uyo Metro
            Zone
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex h-11 items-center gap-2 rounded-lg bg-secondary px-6 text-[16px] font-semibold text-on-secondary shadow-sm transition-colors hover:bg-secondary-container"
        >
          <span className="material-symbols-outlined text-[20px]">
            add_circle
          </span>
          <span>Add closed road</span>
        </button>
      </div>

      {adding && (
        <div className="flex w-full flex-wrap items-end gap-3 border-b border-outline-variant/30 bg-surface-container-low px-6 py-4">
          <div className="flex min-w-[200px] flex-1 flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Road name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Nwaniba Road"
              className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex min-w-[200px] flex-1 flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Corridor segment
            </label>
            <select
              value={newCorridor}
              onChange={(e) => setNewCorridor(e.target.value)}
              className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none focus:ring-2 focus:ring-secondary"
            >
              {CORRIDOR_LINES.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!newName.trim()}
            className="h-11 rounded-lg bg-primary-container px-6 text-[14px] font-semibold text-on-primary disabled:opacity-40"
          >
            Save closure
          </button>
        </div>
      )}

      <div className="grid h-[calc(100vh-128px)] w-full grid-cols-12 overflow-hidden">
        <div className="relative col-span-8 hidden flex-col justify-between overflow-hidden bg-surface-container-low p-6 select-none lg:flex">
          <div className="absolute inset-0">
            <LiveMap
              closures={closures.map(({ id, name, line }) => ({
                id,
                name,
                line,
              }))}
              selectedId={selectedId}
              onSelect={setSelectedId}
              overlayOn={overlayOn}
              onToggleOverlay={() => setOverlayOn((v) => !v)}
            />
          </div>
          <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex items-center gap-2 rounded-lg bg-surface-container-lowest/95 px-3 py-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              explore
            </span>
            <span className="text-[13px] font-bold text-primary">N</span>
            <span className="text-[13px] text-on-surface-variant">
              Ibom Plaza Hub · live tiles
            </span>
          </div>
        </div>

        <div className="col-span-12 flex h-full flex-col overflow-hidden bg-surface-container-lowest shadow-[-4px_0_16px_rgba(0,0,0,0.02)] lg:col-span-4">
          <div className="flex flex-col gap-4 bg-surface-container-lowest p-6">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">
                search
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search closures, roads, hubs..."
                className="h-11 w-full rounded-lg bg-surface-container-low pl-11 pr-4 text-[14px] text-on-surface outline-none placeholder:text-on-surface-variant/70 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              {(
                [
                  { k: "active", n: counts.active },
                  { k: "scheduled", n: counts.scheduled },
                  { k: "expired", n: null },
                ] as const
              ).map((f) => (
                <button
                  key={f.k}
                  type="button"
                  onClick={() =>
                    setFilter(
                      f.k as "active" | "scheduled" | "expired"
                    )
                  }
                  className={`flex h-8 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium capitalize transition-colors ${
                    filter === f.k
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span>{f.k}</span>
                  {f.n !== null && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                        filter === f.k
                          ? "bg-surface-container-lowest text-primary"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {f.n}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-1">
            {visible.map((c) => {
              const on = c.status === "active";
              const sel = c.id === selectedId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`relative cursor-pointer overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm transition-colors ${
                    sel ? "pl-6" : ""
                  }`}
                >
                  {sel && (
                    <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-secondary" />
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[17px] font-bold leading-snug text-primary">
                          {c.name}
                        </h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[13px] font-semibold capitalize ${
                            c.status === "scheduled"
                              ? "bg-surface-container-highest text-primary"
                              : "bg-surface-container text-on-tertiary-container"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`Toggle ${c.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          flip(c.id);
                        }}
                        className={`flex h-6 w-12 items-center rounded-full p-0.5 transition-colors ${
                          on
                            ? "justify-end bg-on-tertiary-container"
                            : "justify-start bg-outline-variant"
                        }`}
                      >
                        <span className="h-5 w-5 rounded-full bg-surface-container-lowest" />
                      </button>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[13px] text-error">
                      <span className="material-symbols-outlined text-[17px]">
                        no_crash
                      </span>
                      <span>{c.restriction}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[13px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">
                          event_repeat
                        </span>
                        <span>{c.schedule}</span>
                      </span>
                      {c.meta && (
                        <span className="font-mono">{c.meta}</span>
                      )}
                    </div>
                    {c.buffer && sel && (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-1">
                        <span className="text-[13px] text-on-surface-variant">
                          {c.buffer}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit corridor"
                            className="flex h-7 w-7 items-center justify-center rounded text-secondary transition-colors hover:bg-surface-container-highest"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            title="Delete closure"
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(c.id);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-error"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && (
              <p className="py-8 text-center text-[14px] text-on-surface-variant">
                No closures match this filter.
              </p>
            )}
          </div>

          <div className="bg-surface-container-low p-4 shadow-[0_-4px_16px_rgba(11,31,51,0.04)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-[20px]">
                  shield
                </span>
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[13px] font-bold leading-tight text-primary">
                  {counts.active} active closures · Pins are blocked on
                  these roads
                </span>
                <p className="mt-0.5 text-[13px] leading-snug text-on-surface-variant">
                  Passenger app will warn riders if drop-off or pickup is
                  within buffer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab: Corridors & Junctions — CRUD backed by real API
   ────────────────────────────────────────────────────────── */
function CorridorsTab() {
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add corridor form
  const [showAddCorridor, setShowAddCorridor] = useState(false);
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cBusy, setCBusy] = useState(false);

  // Add junction form
  const [showAddJunction, setShowAddJunction] = useState(false);
  const [jName, setJName] = useState("");
  const [jCorridor, setJCorridor] = useState("");
  const [jLat, setJLat] = useState("");
  const [jLng, setJLng] = useState("");
  const [jBusy, setJBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [c, j] = await Promise.all([api.corridors(), api.junctions()]);
      setCorridors(c ?? []);
      setJunctions(j ?? []);
    } catch (e) {
      if (e instanceof ApiUnreachable) {
        setError("Backend unreachable — showing cached data.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to load.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addCorridor() {
    if (!cName.trim()) return;
    setCBusy(true);
    try {
      await api.corridorCreate({
        name: cName.trim(),
        description: cDesc.trim(),
      });
      setCName("");
      setCDesc("");
      setShowAddCorridor(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create corridor.");
    } finally {
      setCBusy(false);
    }
  }

  async function deleteCorridor(id: string) {
    try {
      await api.corridorDelete(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
    }
  }

  async function toggleCorridor(id: string, current: boolean) {
    try {
      await api.corridorUpdate(id, { is_active: !current });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update.");
    }
  }

  async function addJunction() {
    if (!jName.trim() || !jCorridor || !jLat || !jLng) return;
    setJBusy(true);
    try {
      await api.junctionCreate({
        name: jName.trim(),
        corridor_id: jCorridor,
        latitude: parseFloat(jLat),
        longitude: parseFloat(jLng),
      });
      setJName("");
      setJLat("");
      setJLng("");
      setShowAddJunction(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create junction.");
    } finally {
      setJBusy(false);
    }
  }

  async function deleteJunction(id: string) {
    try {
      await api.junctionDelete(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-primary">
            Corridors & Junctions
          </h1>
          <p className="text-[13px] text-on-surface-variant">
            Manage transit corridors and junction stops from the backend
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="flex h-10 items-center gap-2 rounded-lg bg-surface-container px-4 text-[13px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error-container/30 px-4 py-3 text-[13px] text-error">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
              sync
            </span>
            <span className="text-[14px] font-medium">Loading from backend…</span>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Corridors Section */}
          <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container">
                  <span className="material-symbols-outlined text-[20px] text-on-primary">
                    route
                  </span>
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-primary">
                    Corridors
                  </h2>
                  <span className="text-[13px] text-on-surface-variant">
                    {corridors.length} registered
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCorridor((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-5 text-[14px] font-semibold text-on-secondary hover:bg-secondary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add Corridor
              </button>
            </div>

            {showAddCorridor && (
              <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-surface-container-low p-4">
                <div className="flex min-w-[200px] flex-1 flex-col gap-1">
                  <label className="text-[13px] font-medium text-on-surface">
                    Name
                  </label>
                  <input
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    placeholder="e.g. Oron Road"
                    className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div className="flex min-w-[200px] flex-1 flex-col gap-1">
                  <label className="text-[13px] font-medium text-on-surface">
                    Description
                  </label>
                  <input
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    placeholder="Major arterial road..."
                    className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCorridor}
                  disabled={cBusy || !cName.trim()}
                  className="h-11 rounded-lg bg-primary-container px-6 text-[14px] font-semibold text-on-primary disabled:opacity-40"
                >
                  {cBusy ? "Creating…" : "Create"}
                </button>
              </div>
            )}

            {corridors.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px] text-outline">
                  route
                </span>
                <p className="text-[14px]">No corridors yet. Create the first one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {corridors.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 transition-colors hover:bg-surface-container"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          c.is_active ? "bg-on-tertiary-container" : "bg-outline-variant"
                        }`}
                      />
                      <div>
                        <span className="text-[14px] font-semibold text-primary">
                          {c.name}
                        </span>
                        {c.description && (
                          <p className="text-[13px] text-on-surface-variant">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                          c.is_active
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCorridor(c.id, c.is_active)}
                        title={c.is_active ? "Deactivate" : "Activate"}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {c.is_active ? "toggle_on" : "toggle_off"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCorridor(c.id)}
                        title="Delete corridor"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                      <span className="font-mono text-[11px] text-outline">
                        {c.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Junctions Section */}
          <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container">
                  <span className="material-symbols-outlined text-[20px] text-on-secondary">
                    location_on
                  </span>
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-primary">
                    Junctions
                  </h2>
                  <span className="text-[13px] text-on-surface-variant">
                    {junctions.length} stops registered
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddJunction((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-5 text-[14px] font-semibold text-on-secondary hover:bg-secondary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add Junction
              </button>
            </div>

            {showAddJunction && (
              <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-surface-container-low p-4">
                <div className="flex min-w-[160px] flex-1 flex-col gap-1">
                  <label className="text-[13px] font-medium text-on-surface">
                    Name
                  </label>
                  <input
                    value={jName}
                    onChange={(e) => setJName(e.target.value)}
                    placeholder="e.g. Ibom Plaza Hub"
                    className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div className="flex min-w-[160px] flex-col gap-1">
                  <label className="text-[13px] font-medium text-on-surface">
                    Corridor
                  </label>
                  <select
                    value={jCorridor}
                    onChange={(e) => setJCorridor(e.target.value)}
                    className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">Select…</option>
                    {corridors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex min-w-[100px] flex-col gap-1">
                  <label className="text-[13px] font-medium text-on-surface">
                    Latitude
                  </label>
                  <input
                    value={jLat}
                    onChange={(e) => setJLat(e.target.value)}
                    placeholder="5.0045"
                    className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div className="flex min-w-[100px] flex-col gap-1">
                  <label className="text-[13px] font-medium text-on-surface">
                    Longitude
                  </label>
                  <input
                    value={jLng}
                    onChange={(e) => setJLng(e.target.value)}
                    placeholder="7.9385"
                    className="h-11 rounded-lg bg-surface-container-lowest px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <button
                  type="button"
                  onClick={addJunction}
                  disabled={jBusy || !jName.trim() || !jCorridor}
                  className="h-11 rounded-lg bg-primary-container px-6 text-[14px] font-semibold text-on-primary disabled:opacity-40"
                >
                  {jBusy ? "Creating…" : "Create"}
                </button>
              </div>
            )}

            {junctions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px] text-outline">
                  location_on
                </span>
                <p className="text-[14px]">
                  No junctions yet.{" "}
                  {corridors.length === 0
                    ? "Create a corridor first."
                    : "Add stops above."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-[13px] text-on-surface-variant">
                      <th className="pb-2 pr-4 font-medium">Name</th>
                      <th className="pb-2 pr-4 font-medium">Corridor</th>
                      <th className="pb-2 pr-4 font-medium">Coordinates</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {junctions.map((j) => (
                      <tr
                        key={j.id}
                        className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="py-3 pr-4 font-semibold text-primary">
                          {j.name}
                        </td>
                        <td className="py-3 pr-4 text-on-surface-variant">
                          {corridors.find((c) => c.id === j.corridor)?.name ??
                            j.corridor.slice(0, 8)}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[13px] text-on-surface-variant">
                          {parseFloat(j.latitude).toFixed(4)},{" "}
                          {parseFloat(j.longitude).toFixed(4)}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${
                              j.is_active
                                ? "bg-tertiary-container text-on-tertiary-container"
                                : "bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            {j.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => deleteJunction(j.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab: Restricted Zones — CRUD backed by real API
   ────────────────────────────────────────────────────────── */
function ZonesTab() {
  const [zones, setZones] = useState<RestrictedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [zName, setZName] = useState("");
  const [zLat, setZLat] = useState("");
  const [zLng, setZLng] = useState("");
  const [zRadius, setZRadius] = useState("200");
  const [zType, setZType] = useState("no_keke");
  const [zReason, setZReason] = useState("");
  const [zBusy, setZBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const z = await api.restrictedZones();
      setZones(z ?? []);
    } catch (e) {
      if (e instanceof ApiUnreachable) {
        setError("Backend unreachable.");
      } else {
        setError(e instanceof Error ? e.message : "Failed to load zones.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addZone() {
    if (!zName.trim() || !zLat || !zLng) return;
    setZBusy(true);
    try {
      await api.restrictedZoneCreate({
        name: zName.trim(),
        center_lat: parseFloat(zLat),
        center_lng: parseFloat(zLng),
        radius_m: parseInt(zRadius) || 200,
        restriction_type: zType,
        reason: zReason.trim(),
      });
      setZName("");
      setZLat("");
      setZLng("");
      setZRadius("200");
      setZReason("");
      setShowAdd(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create zone.");
    } finally {
      setZBusy(false);
    }
  }

  async function deleteZone(id: string) {
    try {
      await api.restrictedZoneDelete(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete zone.");
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-primary">
            Restricted Zones
          </h1>
          <p className="text-[13px] text-on-surface-variant">
            Define no-go zones that block passenger pin requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="flex h-10 items-center gap-2 rounded-lg bg-surface-container px-4 text-[13px] font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-5 text-[14px] font-semibold text-on-secondary hover:bg-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Zone
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-error-container/30 px-4 py-3 text-[13px] text-error">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{error}</span>
        </div>
      )}

      {showAdd && (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex min-w-[160px] flex-1 flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Zone name
            </label>
            <input
              value={zName}
              onChange={(e) => setZName(e.target.value)}
              placeholder="e.g. Government House"
              className="h-11 rounded-lg bg-surface-container-low px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex min-w-[100px] flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Center Lat
            </label>
            <input
              value={zLat}
              onChange={(e) => setZLat(e.target.value)}
              placeholder="5.022"
              className="h-11 rounded-lg bg-surface-container-low px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex min-w-[100px] flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Center Lng
            </label>
            <input
              value={zLng}
              onChange={(e) => setZLng(e.target.value)}
              placeholder="7.939"
              className="h-11 rounded-lg bg-surface-container-low px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex min-w-[80px] flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Radius (m)
            </label>
            <input
              value={zRadius}
              onChange={(e) => setZRadius(e.target.value)}
              placeholder="200"
              className="h-11 rounded-lg bg-surface-container-low px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div className="flex min-w-[120px] flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Type
            </label>
            <select
              value={zType}
              onChange={(e) => setZType(e.target.value)}
              className="h-11 rounded-lg bg-surface-container-low px-4 text-[14px] text-primary outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="no_keke">No Keke</option>
              <option value="construction">Construction</option>
              <option value="government">Government Zone</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex min-w-[180px] flex-1 flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface">
              Reason
            </label>
            <input
              value={zReason}
              onChange={(e) => setZReason(e.target.value)}
              placeholder="e.g. State executive order"
              className="h-11 rounded-lg bg-surface-container-low px-4 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
            />
          </div>
          <button
            type="button"
            onClick={addZone}
            disabled={zBusy || !zName.trim() || !zLat || !zLng}
            className="h-11 rounded-lg bg-primary-container px-6 text-[14px] font-semibold text-on-primary disabled:opacity-40"
          >
            {zBusy ? "Creating…" : "Create Zone"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
              sync
            </span>
            <span className="text-[14px] font-medium">Loading zones…</span>
          </div>
        </div>
      ) : zones.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest py-16 shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-outline">
            block
          </span>
          <p className="text-[14px] text-on-surface-variant">
            No restricted zones configured. Add one above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {zones.map((z) => (
            <div
              key={z.id}
              className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-container">
                    <span className="material-symbols-outlined text-[18px] text-on-error-container">
                      block
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-primary">
                      {z.name}
                    </h3>
                    <span className="text-[12px] text-on-surface-variant capitalize">
                      {z.restriction_type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteZone(z.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
              <div className="space-y-1.5 text-[13px]">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">
                    my_location
                  </span>
                  <span className="font-mono">
                    {z.coordinates.center[0].toFixed(4)},{" "}
                    {z.coordinates.center[1].toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">
                    radar
                  </span>
                  <span>Radius: {z.coordinates.radius_m}m</span>
                </div>
                {z.reason && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">
                      info
                    </span>
                    <span>{z.reason}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                    z.is_active
                      ? "bg-error-container text-on-error-container"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {z.is_active ? "Enforced" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Tab: System Overview
   ────────────────────────────────────────────────────────── */
function SystemTab() {
  const [health, setHealth] = useState<{
    status: string;
    db: string;
    cache: string;
    redis: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    corridors: 0,
    junctions: 0,
    zones: 0,
  });

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([
      api.health().catch(() => null),
      api.publicCorridors().catch(() => []),
      api.publicJunctions().catch(() => []),
      api.publicZones().catch(() => []),
    ]).then(([h, c, j, z]) => {
      if (!live) return;
      setHealth(h);
      setStats({
        corridors: c?.length ?? 0,
        junctions: j?.length ?? 0,
        zones: z?.length ?? 0,
      });
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, []);

  const services = health
    ? [
        {
          name: "Database",
          status: health.db,
          icon: "database",
        },
        { name: "Cache", status: health.cache, icon: "memory" },
        {
          name: "Redis",
          status: health.redis,
          icon: "bolt",
        },
        {
          name: "API Server",
          status: health.status,
          icon: "dns",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight text-primary">
          System Overview
        </h1>
        <p className="text-[13px] text-on-surface-variant">
          Backend health, service status, and data summary
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
              sync
            </span>
            <span className="text-[14px] font-medium">
              Checking system health…
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: "route",
                label: "Corridors",
                value: stats.corridors,
                color: "bg-primary-container",
                text: "text-on-primary",
              },
              {
                icon: "location_on",
                label: "Junctions",
                value: stats.junctions,
                color: "bg-secondary-container",
                text: "text-on-secondary",
              },
              {
                icon: "block",
                label: "Restricted Zones",
                value: stats.zones,
                color: "bg-error-container",
                text: "text-on-error-container",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}
                >
                  <span
                    className={`material-symbols-outlined text-[24px] ${s.text}`}
                  >
                    {s.icon}
                  </span>
                </div>
                <div>
                  <span className="text-[28px] font-bold text-primary">
                    {s.value}
                  </span>
                  <p className="text-[13px] text-on-surface-variant">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Service health */}
          <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container">
                <span className="material-symbols-outlined text-[20px] text-on-primary">
                  monitor_heart
                </span>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-primary">
                  Service Health
                </h2>
                <span className="text-[13px] text-on-surface-variant">
                  {health
                    ? `Overall: ${health.status}`
                    : "Backend unreachable"}
                </span>
              </div>
            </div>

            {!health ? (
              <div className="flex items-center gap-2 rounded-xl bg-error-container/30 px-4 py-3 text-[13px] text-error">
                <span className="material-symbols-outlined text-[18px]">
                  cloud_off
                </span>
                <span>
                  Cannot reach backend. Check network or server status.
                </span>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {services.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                        {s.icon}
                      </span>
                      <span className="text-[14px] font-medium text-on-surface">
                        {s.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          s.status === "ok"
                            ? "bg-on-tertiary-container"
                            : "bg-error"
                        }`}
                      />
                      <span
                        className={`text-[13px] font-semibold capitalize ${
                          s.status === "ok"
                            ? "text-on-tertiary-container"
                            : "text-error"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Connection info */}
          <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-primary mb-3">
              Connection Details
            </h2>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">
                  link
                </span>
                <span>API Base:</span>
                <code className="rounded bg-surface-container-low px-2 py-0.5 font-mono text-primary">
                  {process.env.NEXT_PUBLIC_API_URL ??
                    "https://omnipax-backend-jgmx.onrender.com"}
                </code>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">
                  schedule
                </span>
                <span>Timezone: Africa/Lagos (WAT, UTC+1)</span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main AdminClient
   ────────────────────────────────────────────────────────── */
export default function AdminClient() {
  const [tab, setTab] = useState<AdminTab>("geofence");
  const [backend, setBackend] = useState<
    "checking" | "ok" | "degraded" | "offline"
  >("checking");

  useEffect(() => {
    let live = true;
    api
      .health()
      .then((h) => {
        if (live) setBackend(h.status === "ok" ? "ok" : "degraded");
      })
      .catch((e) => {
        if (live)
          setBackend(e instanceof ApiUnreachable ? "offline" : "degraded");
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface font-sans text-[14px] text-on-surface">
      <Sidebar tab={tab} setTab={setTab} backend={backend} />

      <div className="lg:pl-[240px]">
        <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-surface/80 px-6 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:left-[240px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[14px] text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">
                corporate_fare
              </span>
              <span className="text-[13px] font-medium text-on-surface">
                Uyo Metro
              </span>
              <span className="text-outline-variant">/</span>
              <span className="text-[13px] font-medium text-on-surface">
                Central Operations
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">
                schedule
              </span>
              <span className="text-[13px] font-medium text-on-surface">
                <Clock />
              </span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Tune"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">
                  tune
                </span>
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">
                  notifications
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="relative bg-surface pt-16 min-h-screen">
          <div className="flex w-full flex-col">
            {tab === "geofence" && <GeofenceTab />}
            {tab === "corridors" && <CorridorsTab />}
            {tab === "zones" && <ZonesTab />}
            {tab === "system" && <SystemTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
