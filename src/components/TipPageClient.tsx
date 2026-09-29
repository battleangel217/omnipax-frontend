"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import TipPanel from "@/components/TipPanel";

const LiveMap = dynamic(() => import("@/components/TipLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[620px] w-full items-center justify-center bg-surface-container-high">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

function PinCountdown() {
  const [left, setLeft] = useState(11 * 60 + 42);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <span className="text-[13px] text-on-surface-variant">
      (expires in {m}:{s < 10 ? "0" : ""}{s})
    </span>
  );
}

export default function TipPageClient() {
  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <AppHeader active="corridors" />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full bg-surface-container-low px-4 py-2 flex flex-wrap items-center gap-2">
            <Link
              href="/passenger"
              title="Back to waiting pin"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
            </Link>
            <div className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-on-tertiary-container" />
              <span className="text-[13px] font-semibold text-on-surface">
                Your pin is live
              </span>
              <PinCountdown />
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                alt_route
              </span>
              <span className="text-[13px] font-medium text-on-surface">
                Corridor: Oron Road / Ibom Plaza Hub
              </span>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-4 px-4 py-4 lg:grid-cols-12">
            <TipPanel />

            <section className="flex flex-col gap-2 lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-lowest p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1">
                    <span className="h-2 w-2 rounded-full bg-secondary-container" />
                    <span className="text-[13px] font-semibold text-on-surface">
                      9 drivers active along your corridor
                    </span>
                  </div>
                  <span className="hidden text-[13px] text-on-surface-variant sm:inline">
                    Updated real-time telemetry
                  </span>
                </div>
              </div>

              <div className="relative h-[620px] w-full select-none overflow-hidden rounded-xl bg-surface-container-high">
                <LiveMap />
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {[
                  {
                    icon: "speed",
                    value: "2.1x",
                    label: "Faster driver response rate",
                  },
                  {
                    icon: "pin_drop",
                    value: "Exact Stop",
                    label: "Ibom Plaza roundabout curb",
                  },
                  {
                    icon: "currency_exchange",
                    value: "100% Refund",
                    label: "Automatic on pin expiry",
                  },
                ].map((c) => (
                  <div
                    key={c.value}
                    className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">
                        {c.icon}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[20px] leading-tight text-on-surface">
                        {c.value}
                      </span>
                      <span className="text-[13px] text-on-surface-variant">
                        {c.label}
                      </span>
                    </div>
                  </div>
                ))}
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
