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
  IBOM_PLAZA,
  ORON_RD,
  OsmTiles,
  TROPICANA,
} from "./map-shared";

function endpointDot(bg: string): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${bg};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  });
}

function FitRoute() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(
      L.latLngBounds([IBOM_PLAZA, ORON_RD, TROPICANA]).pad(0.35)
    );
  }, [map]);
  return null;
}

export default function DoneLiveMap() {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={ORON_RD}
        zoom={14}
        minZoom={11}
        maxZoom={19}
        zoomControl={false}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ background: "#E5EFFC" }}
      >
        <FixSize />
        <OsmTiles />
        <FitRoute />

        {/* Completed track — dashed emerald along Oron corridor */}
        <Polyline
          positions={[IBOM_PLAZA, ORON_RD, TROPICANA]}
          pathOptions={{ color: "#009A4B", weight: 4, dashArray: "6 6" }}
        />
        <Marker position={IBOM_PLAZA} icon={endpointDot("#0B1F33")}>
          <Tooltip direction="top" offset={[0, -12]}>
            Ibom Plaza Hub · Pickup verified
          </Tooltip>
        </Marker>
        <Marker position={TROPICANA} icon={endpointDot("#1D5DFE")}>
          <Tooltip direction="top" offset={[0, -12]}>
            Tropicana Mall · Dropoff reached
          </Tooltip>
        </Marker>
        <Circle
          center={IBOM_PLAZA}
          radius={200}
          pathOptions={{ color: "#009A4B", weight: 0, fillColor: "#009A4B", fillOpacity: 0.12 }}
        />
      </MapContainer>

      <div className="absolute left-3 top-3 z-[500] rounded-lg bg-surface-container-lowest px-3 py-1.5 text-on-surface shadow-sm">
        <span className="block text-[13px] font-semibold">
          Ibom Plaza Hub
        </span>
        <span className="text-[13px] text-on-surface-variant">
          Pickup verified
        </span>
      </div>
      <div className="absolute bottom-3 right-3 z-[500] rounded-lg bg-surface-container-lowest px-3 py-1.5 text-on-surface shadow-sm">
        <span className="block text-[13px] font-semibold">Tropicana Mall</span>
        <span className="text-[13px] text-on-surface-variant">
          Dropoff reached
        </span>
      </div>
    </div>
  );
}
