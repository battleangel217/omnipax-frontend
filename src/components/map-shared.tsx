"use client";

import { useEffect, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";

export type { LatLng } from "./map-data";
export {
  ABAK_JUNCTION,
  AKA_RD,
  AKA_SOUTH,
  CORRIDOR_TARGETS,
  IBOM_PLAZA,
  IKOT_EKPENE_RD,
  ITAM,
  ORON_RD,
  TROPICANA,
  UYO,
} from "./map-data";


/** Re-resolve Leaflet size after the flex parent settles. Fixes the
 *  half-rendered tile grid on first paint. */
export function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

/** OSM tiles with failure counting + tap-to-retry pill. */
export function OsmTiles() {
  const [tileKey, setTileKey] = useState(0);
  const [tileErrors, setTileErrors] = useState(0);
  return (
    <>
      <TileLayer
        key={tileKey}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains="abc"
        maxZoom={19}
        keepBuffer={8}
        eventHandlers={{
          tileerror: () => setTileErrors((n) => n + 1),
        }}
      />
      {tileErrors > 6 && (
        <div className="absolute left-1/2 top-20 z-[500] -translate-x-1/2">
          <button
            type="button"
            onClick={() => {
              setTileErrors(0);
              setTileKey((k) => k + 1);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-[13px] font-semibold text-on-primary shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>
            <span>Tiles slow — tap to reload map</span>
          </button>
        </div>
      )}
    </>
  );
}
