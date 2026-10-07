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
  AKA_SOUTH,
  FixSize,
  IBOM_PLAZA,
  ITAM,
  ORON_RD,
  OsmTiles,
  TROPICANA,
  UYO,
  type LatLng,
} from "./map-shared";

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
        <FlySignal signal={navSignal} target={IBOM_PLAZA} />
        {flyTo && <FlyToTarget target={flyTo} />}

        {/* Passenger demand heat — aggregate only (muted in quiet mode) */}
        {quiet ? (
          <>
            <Circle center={IBOM_PLAZA} radius={320} pathOptions={{ color: "#F5A524", weight: 1, fillColor: "#F5A524", fillOpacity: 0.18 }} />
            <Circle center={ITAM} radius={380} pathOptions={{ color: "#F5A524", weight: 1, fillColor: "#F5A524", fillOpacity: 0.14 }} />
            <Circle center={TROPICANA} radius={300} pathOptions={{ color: "#F5A524", weight: 1, fillColor: "#F5A524", fillOpacity: 0.12 }} />
          </>
        ) : (
          <>
            <Circle center={IBOM_PLAZA} radius={320} pathOptions={{ color: "#DC2626", weight: 1, fillColor: "#DC2626", fillOpacity: 0.35 }} />
            <Circle center={IBOM_PLAZA} radius={150} pathOptions={{ color: "#DC2626", weight: 0, fillColor: "#DC2626", fillOpacity: 0.45 }} />
            <Circle center={ITAM} radius={380} pathOptions={{ color: "#E5322D", weight: 1, fillColor: "#E5322D", fillOpacity: 0.28 }} />
            <Circle center={TROPICANA} radius={300} pathOptions={{ color: "#F5A524", weight: 1, fillColor: "#F5A524", fillOpacity: 0.28 }} />
          </>
        )}
        {radarOn && (
          <Circle center={[anchor[0] + 0.012, anchor[1] + 0.014]} radius={420} pathOptions={{ color: "#D97706", weight: 1, fillColor: "#D97706", fillOpacity: 0.25 }} />
        )}

        {/* Oron Road — approved corridor */}
        <Polyline positions={[IBOM_PLAZA, ORON_RD, TROPICANA]} pathOptions={{ color: "#FFFFFF", weight: 9 }} />
        <Polyline positions={[IBOM_PLAZA, ORON_RD, TROPICANA]} pathOptions={{ color: "#1D5DFE", weight: 6 }} />

        {/* Aka Road — closed */}
        <Polyline positions={[IBOM_PLAZA, AKA_SOUTH]} pathOptions={{ color: "#EF4444", weight: 6, dashArray: "10 8" }} />

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
