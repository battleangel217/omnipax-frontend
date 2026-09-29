"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";

const LiveMap = dynamic(() => import("@/components/DoneLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[208px] w-full items-center justify-center bg-surface-container-low">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading route recap…</span>
      </div>
    </div>
  ),
});

export default function DoneClient() {
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [clearedAt] = useState(() =>
    new Date().toLocaleTimeString("en-NG", { hour12: false })
  );

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <AppHeader active="corridors" />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full bg-surface-container-low px-6 py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-on-tertiary-container" />
              <span className="text-[13px] font-medium text-on-surface">
                Status: Pin Resolved & Cleared
              </span>
            </div>
          </div>

          <div className="w-full max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <section className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
                <div className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-6 text-center">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-tertiary-fixed">
                    <span
                      className="material-symbols-outlined text-[48px] text-tertiary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </div>
                  <h1 className="mb-1 text-[28px] font-bold leading-[35px] tracking-tight text-primary-container">
                    Glad you found a ride
                  </h1>
                  <p className="mb-6 max-w-md text-[16px] text-on-surface-variant">
                    Your pin has been removed. Thanks for keeping the map
                    accurate.
                  </p>

                  <div className="mb-6 flex w-full flex-col gap-4 rounded-xl bg-surface-container-low p-6 text-left">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface">
                          <span className="material-symbols-outlined text-[20px]">
                            alt_route
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="text-[13px] uppercase tracking-wider text-on-surface-variant">
                            Corridor Segment
                          </span>
                          <span className="truncate text-[20px] font-semibold text-on-surface">
                            Ibom Plaza to Tropicana Mall
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-surface-container-high px-3 py-1.5 text-[13px] font-medium text-on-surface">
                        Oron Road
                      </span>
                    </div>
                    <div className="h-px w-full bg-surface-container-high" />
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface">
                          <span className="material-symbols-outlined text-[20px]">
                            payments
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] uppercase tracking-wider text-on-surface-variant">
                            Priority Dispatch Tip
                          </span>
                          <span className="text-[16px] font-medium text-on-surface">
                            ₦100 credited to operator
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1.5 text-[13px] font-medium text-on-tertiary-fixed">
                        <span className="material-symbols-outlined text-[16px]">
                          verified
                        </span>
                        <span>₦100 Paid</span>
                      </div>
                    </div>
                    <div className="h-px w-full bg-surface-container-high" />
                    <div className="flex items-center justify-between gap-4 text-[13px] text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">
                          timer
                        </span>
                        <span>Pin duration: 8 mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>
                        <span>Cleared at {clearedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 rounded-xl bg-surface-container p-4 sm:flex-row">
                    <div className="text-left">
                      <span className="block text-[16px] font-semibold text-on-surface">
                        Was the map helpful?
                      </span>
                      <span className="text-[13px] text-on-surface-variant">
                        Instant feedback calibrates node density
                      </span>
                    </div>
                    {feedback === null ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          aria-label="Yes, map was helpful"
                          onClick={() => setFeedback(true)}
                          className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-6 py-2.5 text-[13px] font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            thumb_up
                          </span>
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          aria-label="No, map was not helpful"
                          onClick={() => setFeedback(false)}
                          className="flex items-center gap-2 rounded-lg bg-surface-container-lowest px-6 py-2.5 text-[13px] font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            thumb_down
                          </span>
                          <span>No</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-medium text-[13px] text-on-tertiary-container">
                        <span className="material-symbols-outlined text-[18px]">
                          done
                        </span>
                        <span>Feedback logged</span>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-2">
                    <Link
                      href="/passenger"
                      className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-secondary-container text-[16px] font-semibold text-on-secondary transition-colors hover:bg-secondary"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        pin_drop
                      </span>
                      <span>Request again</span>
                    </Link>
                    <Link
                      href="/passenger"
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-transparent text-[16px] font-semibold text-primary transition-colors hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_back
                      </span>
                      <span>Back to map</span>
                    </Link>
                  </div>
                </div>
              </section>

              <section className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] uppercase tracking-wider text-on-surface-variant">
                        Corridor Recap
                      </span>
                      <h2 className="text-[20px] font-semibold text-on-surface">
                        Oron Road Transit Track
                      </h2>
                    </div>
                    <span className="flex items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1.5 text-[13px] font-medium text-on-tertiary-fixed">
                      <span className="h-1.5 w-1.5 rounded-full bg-on-tertiary-container" />
                      Completed
                    </span>
                  </div>

                  <div className="relative h-52 w-full overflow-hidden rounded-xl">
                    <LiveMap />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Transit Latency",
                        value: "6 mins",
                        sub: "Expected 7m",
                        subOk: true,
                      },
                      {
                        label: "Corridor Speed",
                        value: "Normal",
                        sub: "31 km/h avg",
                        subOk: false,
                      },
                      {
                        label: "Demand Impact",
                        value: "-1 Pin",
                        sub: "Cleared map",
                        subOk: false,
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="flex flex-col rounded-lg bg-surface-container-low p-3"
                      >
                        <span className="text-[13px] text-on-surface-variant">
                          {m.label}
                        </span>
                        <span className="mt-1 text-[20px] font-semibold text-on-surface">
                          {m.value}
                        </span>
                        <span
                          className={`mt-auto text-[13px] ${
                            m.subOk
                              ? "text-on-tertiary-container"
                              : "text-on-surface-variant"
                          }`}
                        >
                          {m.sub}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-on-surface-variant">
                      info
                    </span>
                    <p className="text-[13px] text-on-surface-variant">
                      Your feedback directly updates vehicle pacing models and
                      helps calibrate live wait times for other commuters
                      waiting at Ibom Plaza Central Circus.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface">
                      <span className="material-symbols-outlined text-[20px]">
                        hub
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-on-surface">
                        Uyo Central Telemetry Node
                      </span>
                      <span className="text-[13px] text-on-surface-variant">
                        42 Keke tricycles active on Oron corridor
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-surface-container px-3 py-1.5 text-[13px] font-medium text-on-tertiary-container">
                    Synchronized
                  </span>
                </div>
              </section>
            </div>
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
