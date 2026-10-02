"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
} from "@/components/map-shared";

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

const NAV = [
  { icon: "hub", label: "Geofence Manager", href: "/admin", active: true },
  { icon: "sensors", label: "Live Demand", href: "/driver", active: false },
  { icon: "commute", label: "Drivers", href: "/complete-profile", active: false },
  { icon: "analytics", label: "Reports", href: "/admin", active: false },
];

export default function AdminClient() {
  const [closures, setClosures] = useState<Closure[]>(SEED);
  const [selectedId, setSelectedId] = useState<string | null>("aka");
  const [filter, setFilter] = useState<"active" | "scheduled" | "expired" | "all">("active");
  const [query, setQuery] = useState("");
  const [overlayOn, setOverlayOn] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCorridor, setNewCorridor] = useState(CORRIDOR_LINES[0].name);
  const [backend, setBackend] = useState<"checking" | "ok" | "degraded" | "offline">(
    "checking"
  );

  useEffect(() => {
    let live = true;
    api
      .health()
      .then((h) => {
        if (live) setBackend(h.status === "ok" ? "ok" : "degraded");
      })
      .catch((e) => {
        if (live) setBackend(e instanceof ApiUnreachable ? "offline" : "degraded");
      });
    return () => {
      live = false;
    };
  }, []);

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
    <div className="min-h-screen bg-surface font-sans text-[14px] text-on-surface">
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
              <Link
                key={n.label}
                href={n.href}
                aria-current={n.active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
                  n.active
                    ? "bg-secondary-container font-medium text-[13px] text-on-secondary"
                    : "text-[14px] text-on-primary-container hover:bg-surface-variant/20 hover:text-on-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {n.icon}
                </span>
                <span>{n.label}</span>
              </Link>
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
                Backend{" "}
                {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"}
              </span>
            </div>
            <span className="text-[13px] font-medium text-on-primary">
              {backend === "checking" && "…"}
              {backend === "ok" && "ok"}
              {backend === "degraded" && "degraded"}
              {backend === "offline" && "offline"}
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
                  Akwa Ibom State Transit Geofencing & Corridor Regulation ·
                  Uyo Metro Zone
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
                        Passenger app will warn riders if drop-off or pickup
                        is within buffer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
