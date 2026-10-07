"use client";

import { useState } from "react";
import MapShowcase from "./MapShowcase";
import { CORRIDOR_TARGETS, type LatLng } from "./map-data";
import { useGeoFeeds } from "@/hooks/useGeo";

export default function LiveDemo() {
  const { corridors, junctions } = useGeoFeeds();
  const pills = corridors.length ? corridors.slice(0, 4).map((c) => c.name) : CORRIDOR_TARGETS.map((c) => c.name);
  const [active, setActive] = useState(pills[0]);
  const [flyTo, setFlyTo] = useState<{ pos: LatLng; nonce: number } | null>(
    null
  );

  function targetFor(name: string): LatLng {
    const lower = name.toLowerCase();
    const hit = junctions.find(
      (j) =>
        j.name.toLowerCase().includes(lower.split(" ")[0]) ||
        lower.includes(j.name.toLowerCase().split(" ")[0])
    );
    if (hit) return hit.pos;
    const fb = CORRIDOR_TARGETS.find((c) => c.name === name);
    return fb ? fb.pos : CORRIDOR_TARGETS[0].pos;
  }

  function select(name: string) {
    setActive(name);
    const pos = targetFor(name);
    setFlyTo((f) => ({ pos, nonce: (f?.nonce ?? 0) + 1 }));
  }

  return (
    <section id="demo" className="w-full scroll-mt-24 px-6 pb-16 md:px-12 md:pb-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          Live demo · no login needed
        </p>
        <h2 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px] md:leading-[1.2]">
          Press a corridor. This is the whole job.
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-on-surface-variant">
          No signup, no setup. Tap a corridor and watch live demand respond.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        <MapShowcase flyTo={flyTo} />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {pills.map((name) => {
            const isActive = name === active;
            return (
              <button
                key={name}
                onClick={() => select(name)}
                className={`h-11 rounded-full px-5 text-[14px] font-semibold transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary"
                    : "border border-line bg-surface-container-lowest text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[13px] text-on-surface-variant">
          Showing aggregate demand for{" "}
          <strong className="font-semibold text-on-surface">{active}</strong> ·
          updated 10s ago
        </p>
      </div>
    </section>
  );
}
