"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("./DriverLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-surface-container">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

export default function DriverDemandMap() {
  return (
    <section className="flex flex-col gap-6 rounded-[2rem] bg-surface-container-lowest p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-semibold text-primary tracking-tight">
              Live Demand Visualizer
            </h2>
            <span className="text-[13px] px-1 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
              High Surge
            </span>
          </div>
          <span className="text-[13px] text-on-surface-variant">
            Central Uyo Metropolitan Arterial Grid
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-surface-container-low text-[13px]">
            <span className="h-2 w-2 rounded-full bg-on-tertiary-container animate-ping" />
            <span className="font-medium text-on-surface">Live Telemetry</span>
          </div>
          <span className="hidden xl:inline-block px-4 py-1 rounded-full bg-surface-container-high text-on-surface text-[13px] font-medium">
            Peak Morning Flow · 4.8 km regulated track
          </span>
        </div>
      </div>

      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl">
        <LiveMap navSignal={0} radarOn driverPos={null} />
        <div className="absolute bottom-4 right-4 z-[500] rounded-lg bg-surface-container-lowest/95 p-3 text-[13px] outline outline-1 outline-outline-variant backdrop-blur-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Map Legend
          </div>
          <div className="mt-1.5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E5322D]" />
              <span className="text-on-surface">Surge Passenger Demand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F5A524]" />
              <span className="text-on-surface">Medium Commuter Density</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-4 rounded bg-secondary" />
              <span className="text-on-surface">Approved Corridor (Oron Rd)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: "electric_rickshaw", label: "Active Corridor Fleet", value: "42 tricycles" },
          { icon: "schedule", label: "Average Wait Time", value: "2 – 4 mins" },
          { icon: "payments", label: "Regulated Fare Span", value: "₦150 – ₦200" },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-surface-container p-6 rounded-2xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                {m.icon}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] text-on-surface-variant truncate">
                {m.label}
              </span>
              <span className="text-[20px] font-bold text-primary truncate">
                {m.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
