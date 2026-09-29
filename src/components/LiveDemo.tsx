"use client";

import { useState } from "react";
import MapShowcase from "./MapShowcase";
import { CORRIDOR_TARGETS, type LatLng } from "./map-shared";

export default function LiveDemo() {
  const [active, setActive] = useState(CORRIDOR_TARGETS[0].name);
  const [flyTo, setFlyTo] = useState<{ pos: LatLng; nonce: number } | null>(
    null
  );

  function select(name: string, pos: LatLng) {
    setActive(name);
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
          {CORRIDOR_TARGETS.map((c) => {
            const isActive = c.name === active;
            return (
              <button
                key={c.name}
                onClick={() => select(c.name, c.pos)}
                className={`h-11 rounded-full px-5 text-[14px] font-semibold transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary"
                    : "border border-line bg-surface-container-lowest text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {c.name}
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
