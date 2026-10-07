"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "./map-data";

const LiveMap = dynamic(() => import("./DriverLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[380px] w-full items-center justify-center bg-surface-container">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

export default function MapShowcase({
  flyTo,
}: {
  flyTo?: { pos: LatLng; nonce: number } | null;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-line">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-on-tertiary-container" />
          <span className="text-[14px] font-medium text-on-surface">
            Live Corridor Feed · Central Hub
          </span>
        </div>
        <span className="text-[13px] text-on-surface-variant">
          Updated 10s ago
        </span>
      </div>

      <div className="relative w-full h-[380px] bg-surface overflow-hidden">
        <LiveMap navSignal={0} radarOn driverPos={null} flyTo={flyTo} />
        <div className="absolute top-4 left-4 z-[500] bg-surface-container-lowest px-3 py-2 rounded-xl shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-[13px] text-on-surface font-medium">
            18 Keke active in radius
          </span>
        </div>
      </div>
    </div>
  );
}
