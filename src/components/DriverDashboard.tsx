"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LiveMap = dynamic(() => import("./DriverLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[500px] w-full items-center justify-center bg-surface-container">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

type LatLng = [number, number];

export default function DriverDashboard() {
  const [radarOn, setRadarOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const [navSignal, setNavSignal] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [driverPos, setDriverPos] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  function navigate() {
    setNavigating(true);
    setNavSignal((n) => n + 1);
    setTimeout(() => setNavigating(false), 1600);
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-wrap items-center gap-3 border-b border-surface-container-highest bg-surface-container-lowest px-4 py-3">
        <div className="flex items-center gap-2 rounded-full bg-error-container px-3 py-1 text-on-error-container">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
            </span>
            <span className="text-[13px] font-semibold uppercase tracking-wide">
              {paused ? "Shift Paused" : "Network Surge Status: High Commuter Demand"}
            </span>
          </div>
          <div className="hidden items-center gap-1 text-[13px] text-on-surface-variant xl:flex">
            <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
              sync
            </span>
            <span>Telemetry Stream Live</span>
          </div>
      </div>

      <div className="grid min-h-[calc(100vh-7rem)] w-full grid-cols-1 gap-0 bg-surface lg:grid-cols-12">
        <div className="flex flex-col gap-4 overflow-y-auto border-r border-surface-container-highest bg-surface p-4 lg:col-span-4 lg:max-h-[calc(100vh-7rem)]">
          <div className="flex flex-col gap-3 rounded-xl bg-error-container p-4 text-on-error-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-error px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-error">
                  Surge Alert
                </span>
                <span className="rounded bg-surface-container-lowest px-2 py-0.5 text-[11px] font-semibold uppercase text-error">
                  Hotspot Priority
                </span>
              </div>
              <span className="flex items-center gap-1 text-[12px] font-medium text-error">
                <span className="material-symbols-outlined text-[14px]">
                  local_fire_department
                </span>
                Velocity +8 / 5m
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-on-error-container">
                  Ibom Plaza Hub
                </h2>
                <p className="text-[14px] font-medium text-error">
                  14 commuters waiting · 0.8 km away
                </p>
              </div>
              <div className="text-right">
                <span className="text-[16px] font-bold text-error">₦250</span>
                <span className="block text-[11px] text-on-error-container opacity-80">
                  Peak Cap
                </span>
              </div>
            </div>
            <p className="rounded bg-surface-container-lowest/80 p-2 text-[13px] text-on-surface-variant">
              Rapid queue buildup at Plaza Circus feeder bay. Direct transit
              routing advised before bottleneck peak.
            </p>
            <button
              type="button"
              onClick={navigate}
              className="mt-1 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-error text-on-error transition-colors hover:bg-error/90"
            >
              <span className="material-symbols-outlined text-[20px]">
                {navigating ? "sync" : "near_me"}
              </span>
              <span className={navigating ? "animate-pulse" : ""}>
                {navigating ? "Routing to hotspot…" : "Navigate to Hotspot"}
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-1 rounded-xl bg-surface-container-lowest p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium uppercase tracking-wider text-on-surface-variant">
                Active Phase
              </span>
              <span className="rounded-full bg-error-container px-2.5 py-0.5 text-[13px] font-bold text-error">
                High Demand
              </span>
            </div>
            <h3 className="mt-1 text-[16px] font-bold text-primary">
              Oron Road Corridor Surge
            </h3>
            <p className="text-[14px] text-on-surface-variant">
              High passenger density converging at Ibom Plaza and Plaza feeder
              bays. Traffic flow active along dual carriageway.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col justify-between rounded-lg bg-surface-container-low p-3">
              <div className="mb-1 flex items-center justify-between text-on-surface-variant">
                <span className="text-[13px] font-medium">Corridor Speed</span>
                <span className="material-symbols-outlined text-[16px]">
                  speed
                </span>
              </div>
              <span className="text-[20px] font-bold text-primary">18 km/h</span>
              <span className="mt-1 text-[12px] text-on-surface-variant">
                Moderate congestion near Plaza
              </span>
            </div>
            <div className="flex flex-col justify-between rounded-lg bg-surface-container-low p-3">
              <div className="mb-1 flex items-center justify-between text-on-surface-variant">
                <span className="text-[13px] font-medium">
                  Active Fleet Density
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  stream_apps
                </span>
              </div>
              <span className="text-[20px] font-bold text-primary">
                29 Units
              </span>
              <span className="mt-1 text-[12px] text-on-surface-variant">
                High demand absorptive rate
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-primary">
                Oron Road Corridor
              </span>
              <span className="rounded bg-surface-container px-2 py-0.5 text-[11px] font-semibold uppercase text-on-surface">
                Approved Route
              </span>
            </div>
            <div className="flex items-start gap-2 pt-1 text-[13px] text-on-surface">
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-secondary">
                conversion_path
              </span>
              <span>Ibom Plaza Circus ⇄ Tropicana Mall ⇄ Ring Road 3</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-on-surface-variant">
                  Regulated Fare Span
                </span>
                <span className="text-[13px] font-bold text-primary">
                  ₦150 – ₦250
                </span>
              </div>
              <span className="text-[11px] font-medium text-secondary">
                Surge ceiling active · Flat terminal fare enforced
              </span>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[13px] text-on-surface-variant">
                  Est. Trip Turnover
                </span>
                <span className="text-[13px] font-semibold text-primary">
                  4 – 6 mins / leg
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-xl bg-surface-container-lowest p-4">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[18px]">
                warning
              </span>
              <span className="text-[13px] font-bold uppercase tracking-tight">
                Regulatory Transit Advisory
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-on-surface">
              Heavy queue waiting at Ibom Plaza Central Circus. Pickups are
              concentrated along Oron Road feeder bay. Remember: Aka Road
              remains strictly closed to transit. Do not divert onto closed
              sectors under penalty of permit suspension.
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-4">
            <div className="flex items-center justify-between py-1">
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-primary">
                  Off-Corridor Radar
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  Show peripheral feeder demand
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={radarOn}
                aria-label="Toggle peripheral radar"
                onClick={() => setRadarOn((v) => !v)}
                className={`relative h-6 w-12 rounded-full p-0.5 transition-colors focus:outline-none ${
                  radarOn ? "bg-on-tertiary-container" : "bg-outline-variant"
                }`}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-surface-container-lowest transition-transform ${
                    radarOn ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setNavSignal((n) => n + 1)}
                className="flex min-h-[44px] items-center justify-center gap-1 rounded-lg bg-surface-container text-[13px] font-medium text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[16px]">
                  visibility
                </span>
                View Hotspot
              </button>
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                className="flex min-h-[44px] items-center justify-center gap-1 rounded-lg bg-surface-container-lowest text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {paused ? "play_circle" : "pause_circle"}
                </span>
                {paused ? "Resume Shift" : "Pause Shift"}
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[500px] flex-col overflow-hidden bg-surface-container lg:col-span-8">
          <div className="absolute left-4 right-4 top-4 z-[500] flex items-center justify-between rounded-lg bg-primary-container px-4 py-3 text-on-primary backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-4 text-[13px]">
              <span className="flex items-center gap-1 font-semibold text-primary-fixed">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-error" />
                Active Telemetry
              </span>
              <span className="hidden text-on-primary-container sm:inline">
                |
              </span>
              <span className="font-medium text-on-primary">
                Network Demand Index:{" "}
                <strong className="text-error-container">
                  88% (Surge Peak)
                </strong>
              </span>
              <span className="hidden text-on-primary-container md:inline">
                |
              </span>
              <span className="hidden text-on-primary md:inline">
                Weather: Clear · 31°C
              </span>
              <span className="hidden text-on-primary-container lg:inline">
                |
              </span>
              <span className="hidden text-on-primary lg:inline">
                Congestion Index:{" "}
                <span className="text-secondary-fixed">Moderate</span>
              </span>
            </div>
            <span className="bg-surface-container-highest/20 rounded px-2 py-0.5 text-[11px] uppercase tracking-wider text-on-primary">
              Uyo Urban Basin
            </span>
          </div>

          <div className="min-h-[500px] flex-1 lg:min-h-0">
            <LiveMap
              navSignal={navSignal}
              radarOn={radarOn}
              driverPos={driverPos}
            />
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-[500] flex flex-col items-center justify-between gap-3 rounded-xl border border-surface-container-highest bg-surface-container-lowest/95 p-3 backdrop-blur-md md:flex-row">
            <div className="flex flex-wrap items-center gap-4 text-[12px]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded bg-secondary" />
                <span className="font-medium text-on-surface">
                  Permitted Corridor (Oron Rd)
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full border border-primary bg-amber-400" />
                <span className="font-medium text-on-surface">
                  Your Unit (#AKS-123-XY)
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-error" />
                <span className="font-medium text-on-surface">
                  Surge Hotspot (14+ Waiting)
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-amber-600" />
                <span className="font-medium text-on-surface">
                  Moderate Demand (5 Waiting)
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 rounded border border-error bg-error/40" />
                <span className="font-medium text-error">Aka Rd (Closed)</span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-4 border-t border-surface-container-highest pt-1 text-[12px] text-on-surface-variant md:border-l md:border-t-0 md:pl-4 md:pt-0">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">
                  gps_fixed
                </span>
                GPS: ±2m
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  cell_tower
                </span>
                Radar: Live 1s
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-error">
                  hub
                </span>
                <span className="font-semibold text-primary">
                  Active Hotspots: 2
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
