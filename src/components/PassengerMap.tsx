"use client";

import dynamic from "next/dynamic";
import type { Destination } from "./PassengerExperience";

const LiveMap = dynamic(() => import("./PassengerLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

export default function PassengerMap({
  destination,
}: {
  destination: Destination | null;
}) {
  return (
    <div className="relative h-[60vh] flex-1 overflow-hidden bg-surface-container lg:h-full">
      <LiveMap destination={destination} />
    </div>
  );
}
