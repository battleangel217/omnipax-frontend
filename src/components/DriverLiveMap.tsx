"use client";

import { useEffect, useRef } from "react";
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
  UYO,
  type LatLng,
} from "./map-shared";
import { useGeoFeeds } from "@/hooks/useGeo";

function driverIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [40, 48],
    iconAnchor: [20, 24],
    html: `<div style="position:relative;width:40px;height:48px">
      <div style="position:absolute;left:20px;top:44px;transform:translateX(-50%);background:#0B1F33;color:#FACC15;font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap">YOU · AKS-123-XY</div>
      <div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;margin:0 auto;border-radius:9999px;background:#0B1F33;border:3px solid #EAB308"></div>
    </div>`,
  });
}

function pinIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:#1D5DFE;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);font-family:'Material Symbols Outlined';font-size:14px;color:#fff">person_pin_circle</div>`,
  });
}

function FlySignal({
  signal,
  target,
}: {
  signal: number;
  target: LatLng;
}) {
  const map = useMap();
  const first = useRef(signal);
  useEffect(() => {
    if (signal !== first.current) map.flyTo(target, 15, { duration: 1.2 });
  }, [map, signal, target]);
  return null;
}

export default function DriverLiveMap({
  navSignal,
  radarOn,
  driverPos,
  flyTo,
  pins,
  quiet,
}: {
  navSignal: number;
  radarOn: boolean;
  driverPos: LatLng | null;
  flyTo?: { pos: LatLng; nonce: number } | null;
  pins?: Array<{ id: string; pos: LatLng; label: string }>;
  quiet?: boolean;
}) {
  const { junctions, zones } = useGeoFeeds();
  const anchor: LatLng = driverPos ?? UYO;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={anchor}
        zoom={14}
        minZoom={11}
        maxZoom={19}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "#E5EFFC" }}
      >
        <FixSize />
        <OsmTiles />
        {/* Note: In a fully dynamic app, navSignal target could be set dynamically instead of hardcoded */}
        <FlySignal signal={navSignal} target={UYO} />
        {flyTo && <FlyToTarget target={flyTo} />}

        {/* Dynamic Restricted Zones */}
        {zones.map((z) => (
          <Circle
            key={`zone-${z.id}`}
            center={z.center}
            radius={z.radius_m}
            pathOptions={{ color: "#EF4444", weight: 2, dashArray: "10 8", fillColor: "#EF4444", fillOpacity: 0.1 }}
          />
        ))}

        {/* Dynamic Passenger demand heat from junctions */}
        {junctions.map((j, index) => {
          const isHighSurge = index === 0 || index === 1;
          const outerColor = isHighSurge ? "#DC2626" : "#F5A524";
          const innerColor = isHighSurge ? "#DC2626" : "#E5322D";
          
          if (quiet) {
            return (
              <Circle key={`heat-${j.id}`} center={j.pos} radius={300} pathOptions={{ color: "#F5A524", weight: 1, fillColor: "#F5A524", fillOpacity: 0.12 }} />
            );
          }
          
          return (
            <div key={`heat-${j.id}`}>
              <Circle center={j.pos} radius={320} pathOptions={{ color: outerColor, weight: 1, fillColor: outerColor, fillOpacity: isHighSurge ? 0.35 : 0.28 }} />
              {isHighSurge && <Circle center={j.pos} radius={150} pathOptions={{ color: innerColor, weight: 0, fillColor: innerColor, fillOpacity: 0.45 }} />}
            </div>
          );
        })}

        {radarOn && (
          <Circle center={[anchor[0] + 0.012, anchor[1] + 0.014]} radius={420} pathOptions={{ color: "#D97706", weight: 1, fillColor: "#D97706", fillOpacity: 0.25 }} />
        )}

        {/* Dynamic Corridors */}
        {Array.from(new Set(junctions.map((j) => j.corridor))).map((corridorId) => {
          const corridorJunctions = junctions.filter((j) => j.corridor === corridorId);
          if (corridorJunctions.length < 2) return null;
          return (
            <div key={`corridor-${corridorId}`}>
              <Polyline positions={corridorJunctions.map((j) => j.pos)} pathOptions={{ color: "#FFFFFF", weight: 9 }} />
              <Polyline positions={corridorJunctions.map((j) => j.pos)} pathOptions={{ color: "#1D5DFE", weight: 6 }} />
            </div>
          );
        })}

        {driverPos && (
          <Marker position={driverPos} icon={driverIcon()} zIndexOffset={100}>
            <Tooltip direction="top" offset={[0, -30]}>
              YOU · AKS-123-XY
            </Tooltip>
          </Marker>
        )}

        {(pins ?? []).map((p) => (
          <Marker key={p.id} position={p.pos} icon={pinIcon()}>
            <Tooltip direction="top" offset={[0, -18]}>
              {p.label}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function FlyToTarget({ target }: { target: { pos: LatLng; nonce: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(target.pos, 15, { duration: 1.2 });
  }, [map, target]);
  return null;
}
