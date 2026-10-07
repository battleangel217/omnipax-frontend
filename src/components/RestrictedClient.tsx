"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import type { AltSpot } from "@/components/RestrictedLiveMap";
import { useGeoFeeds } from "@/hooks/useGeo";
import {
  ABAK_JUNCTION,
  IKOT_EKPENE_RD,
  ORON_RD,
  type LatLng,
} from "@/components/map-data";

type Alt = AltSpot & { sub: string; dist: string; time: string };

const ALT_META: Array<{
  match: string[];
  sub: string;
  dist: string;
  time: string;
}> = [
  {
    match: ["abak"],
    sub: "Plaza feeder shelter · Bay 3",
    dist: "150 m",
    time: "~2 min walk",
  },
  {
    match: ["ikot"],
    sub: "Near Central Mosque terminal",
    dist: "220 m",
    time: "~3 mins",
  },
  {
    match: ["oron"],
    sub: "Old Stadium Link Node",
    dist: "310 m",
    time: "~4 mins",
  },
];

const FALLBACK_ALTS: Alt[] = [
  {
    name: "Abak Road Junction",
    pos: ABAK_JUNCTION,
    sub: "Plaza feeder shelter · Bay 3",
    dist: "150 m",
    time: "~2 min walk",
  },
  {
    name: "Ikot Ekpene Road (Plaza Axis)",
    pos: IKOT_EKPENE_RD,
    sub: "Near Central Mosque terminal",
    dist: "220 m",
    time: "~3 mins",
  },
  {
    name: "Oron Road Corridor",
    pos: ORON_RD,
    sub: "Old Stadium Link Node",
    dist: "310 m",
    time: "~4 mins",
  },
];

function altsFromFeed(
  junctions: Array<{ id: string; name: string; pos: LatLng }>
): Alt[] {
  const lower = (s: string) => s.toLowerCase();
  const out: Alt[] = [];
  for (const meta of ALT_META) {
    const hit = junctions.find((j) =>
      meta.match.some((k) => lower(j.name).includes(k))
    );
    if (hit) {
      const fb = FALLBACK_ALTS[ALT_META.indexOf(meta)];
      out.push({
        name: hit.name,
        pos: hit.pos,
        sub: fb.sub,
        dist: fb.dist,
        time: fb.time,
      });
    }
  }
  for (const j of junctions) {
    if (out.length >= 3) break;
    if (out.some((a) => a.name === j.name)) continue;
    out.push({
      name: j.name,
      pos: j.pos,
      sub: "Designated pickup node",
      dist: "Nearby",
      time: "~5 mins",
    });
  }
  return out.length ? out : FALLBACK_ALTS;
}

const LiveMap = dynamic(() => import("@/components/RestrictedLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center bg-surface-container">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

export default function RestrictedClient() {
  const router = useRouter();
  const { junctions, zones } = useGeoFeeds();
  const ALTS = altsFromFeed(junctions);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const selected = ALTS.find((a) => a.name === selectedName) ?? ALTS[0];
  const [moveState, setMoveState] = useState<"idle" | "moving" | "moved">(
    "idle"
  );
  const [flyTarget, setFlyTarget] = useState<{
    pos: LatLng;
    nonce: number;
  } | null>(null);

  function fly(pos: LatLng) {
    setFlyTarget((f) => ({ pos, nonce: (f?.nonce ?? 0) + 1 }));
  }

  function pick(alt: (typeof ALTS)[number]) {
    setSelectedName(alt.name);
    fly(alt.pos);
  }

  function resolve() {
    if (moveState !== "idle") return;
    setMoveState("moving");
    setTimeout(() => {
      setMoveState("moved");
      fly(selected.pos);
    }, 600);
  }

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <AppHeader active="corridors" />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full bg-surface-container-high/60 border-b border-outline-variant/30 px-6 py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-error-container px-3 py-1 text-[13px] font-semibold text-on-error-container">
              <span className="h-2 w-2 rounded-full bg-error" />
              <span>Status: Restricted Corridor / Closed Road</span>
            </div>
            <div className="hidden items-center gap-1 text-[13px] text-on-surface-variant xl:flex">
              <span>Order Code:</span>
              <span className="font-mono font-semibold text-on-surface">
                AK-MOT-2025-088
              </span>
            </div>
          </div>

          <div className="w-full min-h-[calc(100vh-116px)] flex flex-col lg:flex-row">
            <aside className="w-full lg:w-[460px] xl:w-[480px] bg-surface-container-lowest shrink-0 border-r border-outline-variant/30 flex flex-col justify-between p-6">
              <div className="flex flex-col gap-6">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-on-surface flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <span className="material-symbols-outlined text-[20px]">
                      warning
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-bold text-amber-950">
                      Closed road restriction
                    </span>
                    <span className="mt-0.5 text-[14px] text-amber-900">
                      Municipal order active between Ibom Plaza and Aka
                      Community Roundabout.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-semibold uppercase tracking-wider text-error">
                    Dispatch Ineligible
                  </span>
                  <h1 className="text-[28px] font-bold leading-[35px] tracking-tight text-primary">
                    Transit is closed on this road
                  </h1>
                  <p className="text-[14px] leading-relaxed text-on-surface-variant">
                    No pickups on Aka Road right now. Move your pin to the nearest open road.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-on-surface">
                      Nearest designated pickup spot
                    </span>
                    <span className="text-[13px] font-semibold uppercase tracking-wider text-secondary">
                      Fastest route
                    </span>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border-2 border-secondary/30 bg-surface-container p-4 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary">
                          <span className="material-symbols-outlined text-[22px]">
                            directions_walk
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[16px] font-bold text-on-surface">
                              {selected.name}
                            </span>
                            <span className="rounded-full bg-tertiary-fixed px-2 py-0.5 text-[11px] font-bold text-on-tertiary-fixed">
                              OPEN
                            </span>
                          </div>
                          <span className="text-[13px] text-on-surface-variant">
                            {selected.sub}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[16px] font-bold text-on-surface">
                          {selected.dist}
                        </span>
                        <span className="block text-[13px] text-on-surface-variant">
                          {selected.time}
                        </span>
                      </div>
                    </div>
                    <div className="h-px w-full bg-outline-variant/30" />
                    <div className="flex items-center justify-between text-[13px] text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
                          electric_rickshaw
                        </span>
                        <span className="font-medium text-on-surface">
                          14 active tricycles
                        </span>
                      </div>
                      <span className="font-medium text-secondary">
                        Standard local fare: ₦150 - ₦200
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-semibold text-on-surface-variant">
                    Other open corridors nearby
                  </span>
                  <div className="space-y-2">
                    {ALTS.filter((a) => a.name !== selected.name).map((a) => (
                      <button
                        key={a.name}
                        type="button"
                        onClick={() => pick(a)}
                        className="group flex w-full items-center justify-between rounded-lg border border-outline-variant/40 bg-surface px-4 py-2.5 transition-colors hover:bg-surface-container-high/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors group-hover:bg-secondary group-hover:text-on-secondary">
                            <span className="material-symbols-outlined text-[16px]">
                              location_on
                            </span>
                          </div>
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-on-surface">
                                {a.name}
                              </span>
                              <span className="rounded bg-tertiary-fixed px-1.5 py-0.5 text-[10px] font-bold text-on-tertiary-fixed">
                                OPEN
                              </span>
                            </div>
                            <span className="text-[13px] text-on-surface-variant">
                              {a.sub}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[13px] font-semibold text-on-surface">
                            {a.dist}
                          </span>
                          <span className="block text-[11px] text-on-surface-variant">
                            {a.time}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={resolve}
                    disabled={moveState === "moving"}
                    className={`flex h-14 w-full items-center justify-center gap-3 rounded-xl text-[16px] font-semibold transition-all active:scale-[0.99] ${
                      moveState === "moved"
                        ? "bg-on-tertiary-container text-on-primary"
                        : moveState === "moving"
                          ? "bg-primary-container text-on-primary opacity-80"
                          : "bg-secondary text-on-secondary hover:bg-secondary/95"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {moveState === "idle" && "near_me"}
                      {moveState === "moving" && "sync"}
                      {moveState === "moved" && "check_circle"}
                    </span>
                    <span
                      className={moveState === "moving" ? "animate-pulse" : ""}
                    >
                      {moveState === "idle" &&
                        `Move my pin to ${selected.name}`}
                      {moveState === "moving" &&
                        "Re-routing dispatch…"}
                      {moveState === "moved" &&
                        "Pin Relocated · Request Transport"}
                    </span>
                  </button>
                  {moveState === "moved" && (
                    <button
                      type="button"
                      onClick={() => router.push("/passenger")}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-primary-container text-[15px] font-semibold text-on-primary hover:bg-primary"
                    >
                      Continue to request transport
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push("/passenger")}
                    className="h-11 w-full rounded-lg bg-transparent text-[13px] font-medium text-on-surface transition-colors hover:bg-surface-container"
                  >
                    Choose another destination or search manually
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-lg border-t border-outline-variant/30 bg-surface-container-low p-3 pt-4">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-secondary">
                  verified_user
                </span>
                <div className="flex flex-col text-[13px] leading-tight text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    Akwa Ibom State Ministry of Transport
                  </span>
                  <span className="mt-0.5">
                    Drivers cannot see pins inside red zones.
                  </span>
                </div>
              </div>
            </aside>

            <section className="relative flex min-h-[560px] flex-1 flex-col overflow-hidden bg-surface-container">
              <div className="relative min-h-[560px] flex-1">
                <LiveMap
                  selected={{ name: selected.name, pos: selected.pos }}
                  resolved={moveState === "moved"}
                  flyTarget={flyTarget}
                  zones={zones}
                />
                {moveState === "moved" && (
                  <div className="absolute left-1/2 top-20 z-[500] -translate-x-1/2">
                    <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-primary px-6 py-2.5 text-on-primary">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-fixed font-bold text-on-tertiary-fixed">
                        <span className="material-symbols-outlined text-[18px]">
                          check
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[13px] font-bold text-white">
                          Pin updated to {selected.name}
                        </span>
                        <span className="text-[13px] text-surface-container">
                          Ready for driver assignment. 14 Keke currently in
                          sector.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="z-10 flex w-full flex-col items-center justify-between gap-4 border-t border-outline-variant/30 bg-surface-container-lowest px-6 py-2.5 md:flex-row">
                <div className="flex flex-wrap items-center gap-4 text-[13px] text-on-surface">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Legend:
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-4 rounded-sm bg-error" />
                    Closed Road / No Pickup
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-1 w-4 rounded bg-secondary" />
                    Active Corridor
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
                      !
                    </span>
                    Restricted Pin
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-secondary">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary-fixed" />
                    </span>
                    Recommended Open Spot
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-[12px] text-on-surface-variant">
                  <span className="hidden items-center gap-2 sm:flex">
                    <span className="h-2 w-2 rounded-full bg-on-tertiary-container" />
                    <span>
                      Geofence sync:{" "}
                      <strong className="font-mono font-semibold text-on-surface">
                        0.2s
                      </strong>
                    </span>
                  </span>
                  <span className="text-on-surface-variant">
                    Nearest node:{" "}
                    <strong className="font-semibold text-secondary">
                      {selected.name} ({selected.dist})
                    </strong>
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="w-full bg-surface-container py-4 mt-auto">
        <div className="w-full px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <p className="text-[13px] text-on-surface-variant">
            © 2025 TransitSight Metropolitan Telemetry. Akwa Ibom State
            Ministry of Transport.
          </p>
          <div className="flex items-center flex-wrap justify-center gap-4 text-[13px] text-on-surface-variant">
            {[
              "Uyo Corridor Safety",
              "Operator By-laws",
              "Dispatch Protocol v2.4",
            ].map((l) => (
              <span key={l} className="hover:text-on-surface cursor-pointer">
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
