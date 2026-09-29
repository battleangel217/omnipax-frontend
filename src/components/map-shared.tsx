"use client";

import { useEffect, useState } from "react";
import { TileLayer, useMap } from "react-leaflet";

export type LatLng = [number, number];

/** Uyo anchor points. ORON_RD + AKA_RD verified against OpenStreetMap
 *  (Nominatim, countrycodes=ng). IBOM_PLAZA / ITAM / TROPICANA are
 *  best-effort placements — confirm on the ground before demo day. */
export const UYO: LatLng = [5.0055, 7.9356];
export const IBOM_PLAZA: LatLng = [5.0045, 7.9385];
export const ITAM: LatLng = [5.024, 7.918];
export const TROPICANA: LatLng = [4.996, 7.952];
export const AKA_SOUTH: LatLng = [4.988, 7.93];
export const ORON_RD: LatLng = [5.0032, 7.9467];
export const AKA_RD: LatLng = [5.0332, 7.9286];
export const IKOT_EKPENE_RD: LatLng = [5.018, 7.922];
export const ABAK_JUNCTION: LatLng = [5.0065, 7.9185];

export const CORRIDOR_TARGETS: Array<{ name: string; pos: LatLng }> = [
  { name: "Ibom Plaza Circus", pos: IBOM_PLAZA },
  { name: "Ikot Ekpene Road", pos: IKOT_EKPENE_RD },
  { name: "Itam Market Hub", pos: ITAM },
  { name: "Oron Road Line", pos: ORON_RD },
];

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
