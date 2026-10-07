"use client";

import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  FixSize,
  OsmTiles,
  type LatLng,
} from "./map-shared";
import { useGeoFeeds } from "@/hooks/useGeo";

export type AltSpot = { name: string; pos: LatLng };

const RESTRICTED_PIN: LatLng = [4.997, 7.9335];

function pinIcon(kind: "restricted" | "recommended" | "alt"): L.DivIcon {
  if (kind === "restricted") {
    return L.divIcon({
      className: "",
      iconSize: [30, 44],
      iconAnchor: [15, 42],
      html: `<div style="position:relative;width:30px;height:44px">
        <div style="width:30px;height:30px;border-radius:9999px;background:#BA1A1A;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:800;box-shadow:0 1px 4px rgba(0,0,0,0.3)">!</div>
      </div>`,
    });
  }
  if (kind === "recommended") {
    return L.divIcon({
      className: "",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      html: `<div style="position:relative;width:34px;height:34px">
        <div style="position:absolute;inset:0;border-radius:9999px;background:rgba(29,93,254,0.20)"></div>
        <div style="position:absolute;left:5px;top:5px;width:24px;height:24px;border-radius:9999px;background:#1D5DFE;border:3px solid #fff"></div>
        <div style="position:absolute;left:12px;top:12px;width:10px;height:10px;border-radius:9999px;background:#7FFB9F"></div>
      </div>`,
    });
  }
  return L.divIcon({
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:#fff;border:2px solid #1D5DFE"></div>`,
  });
}

function FlyTo({ target }: { target: { pos: LatLng; nonce: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target.pos, 15, { duration: 1.2 });
  }, [map, target]);
  return null;
}

function Controls() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-16 z-[500] flex items-center gap-2">
      <button
        type="button"
        onClick={() => map.flyTo([5.0, 7.935], 14, { duration: 1 })}
        className="flex items-center gap-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 text-[13px] font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface"
      >
        <span className="material-symbols-outlined text-[18px] text-secondary">
          my_location
        </span>
        <span>Recenter on open corridors</span>
      </button>
      <div className="flex items-center overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
        <button
          type="button"
          title="Zoom in"
          onClick={() => map.zoomIn()}
          className="flex h-10 w-10 items-center justify-center border-r border-outline-variant/30 text-lg font-bold text-on-surface hover:bg-surface"
        >
          +
        </button>
        <button
          type="button"
          title="Zoom out"
          onClick={() => map.zoomOut()}
          className="flex h-10 w-10 items-center justify-center text-lg font-bold text-on-surface hover:bg-surface"
        >
          −
        </button>
      </div>
    </div>
  );
}

export default function RestrictedLiveMap({
  selected,
  resolved,
  flyTarget,
  zones,
}: {
  selected: AltSpot;
  resolved: boolean;
  flyTarget: { pos: LatLng; nonce: number } | null;
  zones: Array<{ id: string; name: string; center: LatLng; radius_m: number }>;
}) {
  const { junctions } = useGeoFeeds();

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[5.0, 7.935]}
        zoom={14}
        minZoom={11}
        maxZoom={19}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "#EBF0F5" }}
      >
        <FixSize />
        <OsmTiles />
        <FlyTo target={flyTarget} />

        {/* Dynamic Corridors */}
        {Array.from(new Set(junctions.map((j) => j.corridor))).map((corridorId) => {
          const corridorJunctions = junctions.filter((j) => j.corridor === corridorId);
          if (corridorJunctions.length < 2) return null;
          return (
            <Polyline
              key={corridorId}
              positions={corridorJunctions.map((j) => j.pos)}
              pathOptions={{ color: "#1D5DFE", weight: 5, dashArray: "12 6" }}
            />
          );
        })}

        {/* Live restricted zones from the backend feed */}
        {zones.map((z) => (
          <Circle
            key={z.id}
            center={z.center}
            radius={z.radius_m}
            pathOptions={{
              color: "#BA1A1A",
              weight: 2,
              dashArray: "8 6",
              fillColor: "#BA1A1A",
              fillOpacity: 0.12,
            }}
          >
            <Tooltip direction="top">{z.name} · closed</Tooltip>
          </Circle>
        ))}

        {/* Walking transfer: restricted pin → recommended Alt spot */}
        <Polyline
          positions={[RESTRICTED_PIN, selected.pos]}
          pathOptions={{ color: "#0B1F33", weight: 3, dashArray: "6 6" }}
        />

        {!resolved && (
          <Marker position={RESTRICTED_PIN} icon={pinIcon("restricted")} zIndexOffset={50}>
            <Tooltip direction="top" offset={[0, -22]} permanent>
              Pickup prohibited — move pin to request
            </Tooltip>
          </Marker>
        )}

        <Marker position={selected.pos} icon={pinIcon("recommended")} zIndexOffset={60}>
          <Tooltip direction="top" offset={[0, -20]} permanent>
            {selected.name} · OPEN
          </Tooltip>
        </Marker>

        <Controls />
      </MapContainer>

      <div className="absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-on-primary shadow-sm">
        <span className="material-symbols-outlined text-[18px] text-error">
          gpp_bad
        </span>
        <span className="text-[13px] font-bold">Restricted Zone: Aka Road</span>
        <span className="font-mono text-[13px] text-outline-variant">
          Municipal Order #24B
        </span>
      </div>
    </div>
  );
}
