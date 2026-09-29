"use client";

import { useEffect, useState } from "react";
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
  IBOM_PLAZA,
  ORON_RD,
  OsmTiles,
  TROPICANA,
  type LatLng,
} from "./map-shared";

const DRIVERS = [
  { label: "Keke UY-104", icon: "electric_rickshaw", color: "#0B1F33", dLat: 0.007, dLng: -0.009 },
  { label: "Keke UY-882", icon: "electric_rickshaw", color: "#0B1F33", dLat: -0.006, dLng: 0.008 },
  { label: "Mini-bus AK-41", icon: "directions_bus", color: "#0046D2", dLat: 0.004, dLng: 0.013 },
  { label: "Keke UY-493", icon: "electric_rickshaw", color: "#0B1F33", dLat: -0.011, dLng: -0.004 },
];

function goldPin(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [40, 56],
    iconAnchor: [20, 52],
    html: `<div style="display:flex;flex-direction:column;align-items:center;width:40px">
      <div style="background:#0B1F33;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:600;padding:4px 8px;border-radius:8px;white-space:nowrap;margin-bottom:2px">You are here · Ibom Plaza Circus</div>
      <div style="font-family:'Material Symbols Outlined';font-size:36px;line-height:1;color:#0B1F33">location_on</div>
      <div style="background:#fff;color:#0B1F33;font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;margin-top:2px;box-shadow:0 1px 3px rgba(0,0,0,0.2)">Gold Beacon Active</div>
    </div>`,
  });
}

function driverBadge(label: string, icon: string, color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [120, 30],
    iconAnchor: [60, 15],
    html: `<div style="display:flex;align-items:center;gap:4px;background:#fff;padding:4px 8px;border-radius:9999px;box-shadow:0 1px 4px rgba(0,0,0,0.2);font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;color:#131C26;white-space:nowrap"><span style="font-family:'Material Symbols Outlined';font-size:16px;color:${color}">${icon}</span>${label}</div>`,
  });
}

function Controls({ onRecenter }: { onRecenter: () => void }) {
  const map = useMap();
  return (
    <div className="absolute right-4 top-4 z-[500] flex flex-col items-end gap-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 px-3.5 py-2 shadow-sm backdrop-blur">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-on-tertiary-container" />
        <span className="text-[13px] font-semibold text-primary">
          9 drivers active along your corridor
        </span>
      </div>
      <div className="flex overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
        <button
          type="button"
          title="Recenter on Pin"
          onClick={onRecenter}
          className="flex items-center gap-1 border-r border-outline-variant/30 px-3 py-2 text-[13px] text-on-surface transition-colors hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">
            my_location
          </span>
          Recenter on Pin
        </button>
        <button
          type="button"
          title="Zoom in"
          onClick={() => map.zoomIn()}
          className="flex h-9 w-9 items-center justify-center text-[18px] font-bold text-on-surface hover:bg-surface-container"
        >
          +
        </button>
        <button
          type="button"
          title="Zoom out"
          onClick={() => map.zoomOut()}
          className="flex h-9 w-9 items-center justify-center text-[18px] font-bold text-on-surface hover:bg-surface-container"
        >
          −
        </button>
      </div>
    </div>
  );
}

export default function TipLiveMap() {
  const [user, setUser] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng>(IBOM_PLAZA);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const ll: LatLng = [pos.coords.latitude, pos.coords.longitude];
        setUser(ll);
        setCenter((prev) =>
          prev[0] === IBOM_PLAZA[0] && prev[1] === IBOM_PLAZA[1] ? ll : prev
        );
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const pin: LatLng = user ?? IBOM_PLAZA;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={15}
        minZoom={11}
        maxZoom={19}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "#E5EFFC" }}
      >
        <FixSize />
        <OsmTiles />
        <RecenterOn center={center} />

        {/* Oron corridor highlight */}
        <Polyline
          positions={[IBOM_PLAZA, ORON_RD, TROPICANA]}
          pathOptions={{ color: "#FFFFFF", weight: 9 }}
        />
        <Polyline
          positions={[IBOM_PLAZA, ORON_RD, TROPICANA]}
          pathOptions={{ color: "#1D5DFE", weight: 6, opacity: 0.35 }}
        />

        {/* Gold beacon heat around your pin */}
        <Circle
          center={pin}
          radius={450}
          pathOptions={{ color: "#F2B705", weight: 1, fillColor: "#F2B705", fillOpacity: 0.22 }}
        />
        <Circle
          center={pin}
          radius={220}
          pathOptions={{ color: "#F2B705", weight: 1, fillColor: "#F2B705", fillOpacity: 0.3 }}
        />

        <Marker position={pin} icon={goldPin()} zIndexOffset={100}>
          <Tooltip direction="top" offset={[0, -56]}>
            You are here · Ibom Plaza Circus
          </Tooltip>
        </Marker>

        {DRIVERS.map((d) => (
          <Marker
            key={d.label}
            position={[pin[0] + d.dLat, pin[1] + d.dLng]}
            icon={driverBadge(d.label, d.icon, d.color)}
          >
            <Tooltip direction="top" offset={[0, -16]}>
              {d.label}
            </Tooltip>
          </Marker>
        ))}

        <Controls onRecenter={() => setCenter(pin)} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[500] max-w-xs rounded-xl bg-surface-container-lowest/95 p-3 shadow-sm backdrop-blur-sm">
        <span className="text-[13px] font-semibold text-on-surface">
          Corridor Visualizer Legend
        </span>
        <div className="mt-1 flex flex-col gap-1 text-[13px] text-on-surface-variant">
          <span className="flex items-center gap-2">
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-surface-bright">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
            </span>
            <span className="text-on-surface">
              Gold Beacon = Your Priority Commuter Pin
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-secondary-container" />
            Blue Line = High Priority Oron Corridor
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-error" />
            Red Band = Peak Commuter Demand Node
          </span>
        </div>
      </div>

      <div className="absolute right-4 top-24 z-[500] hidden rounded-xl bg-surface-container-lowest/95 p-3 shadow-sm backdrop-blur-sm md:block">
        <div className="flex flex-col gap-1 text-[13px]">
          <div className="flex items-center justify-between gap-6">
            <span className="text-on-surface-variant">Plaza Nodes:</span>
            <span className="font-semibold text-on-surface">
              3 Congestion Safe
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-on-surface-variant">Average Keke ETA:</span>
            <span className="font-semibold text-secondary">2 - 4 mins</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecenterOn({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}
