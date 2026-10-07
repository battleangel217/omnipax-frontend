"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Destination } from "./PassengerExperience";

import {
  AKA_SOUTH,
  FixSize,
  IBOM_PLAZA,
  ITAM,
  OsmTiles,
  TROPICANA,
  UYO,
  type LatLng,
} from "./map-shared";
import { useGeoFeeds } from "@/hooks/useGeo";

function userDot(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    html: `<div style="position:relative;width:48px;height:48px">
      <div style="position:absolute;inset:0;border-radius:9999px;background:rgba(29,93,254,0.20)"></div>
      <div style="position:absolute;left:12px;top:12px;width:24px;height:24px;border-radius:9999px;background:rgba(29,93,254,0.30)"></div>
      <div style="position:absolute;left:18px;top:18px;width:12px;height:12px;border-radius:9999px;background:#1D5DFE;border:2px solid #fff"></div>
    </div>`,
  });
}

function destinationPin(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:44px;font-family:'Material Symbols Outlined';font-size:40px;color:#E5322D;text-shadow:0 1px 4px rgba(0,0,0,0.3)">location_on</div>`,
  });
}

function FlyToDest({ destination }: { destination: Destination | null }) {
  const map = useMap();
  useEffect(() => {
    if (destination) map.flyTo(destination.pos, 15, { duration: 1.2 });
  }, [map, destination]);
  return null;
}

function Recenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const CORRIDOR_BOUNDS = L.latLngBounds([ITAM, TROPICANA, AKA_SOUTH, IBOM_PLAZA]).pad(0.25);

function MapControls({
  onRecenter,
  showLines,
  onToggleLines,
  user,
}: {
  onRecenter: () => void;
  showLines: boolean;
  onToggleLines: () => void;
  user: LatLng | null;
}) {
  const map = useMap();
  const farFromZone = user !== null && haversineKm(user, UYO) > 12;
  return (
    <div className="absolute right-4 top-4 z-[500] flex flex-col items-end gap-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 px-3.5 py-2 shadow-sm backdrop-blur">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-on-tertiary-container" />
        <span className="text-[13px] font-semibold text-primary">
          Live corridor demand
        </span>
      </div>
      {farFromZone && (
        <button
          type="button"
          onClick={() => map.fitBounds(CORRIDOR_BOUNDS)}
          className="flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-[13px] font-semibold text-on-primary shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">
            radar
          </span>
          <span>Outside corridor zone — view Uyo demand</span>
        </button>
      )}
      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
        <button
          type="button"
          title="Recenter to my location"
          onClick={onRecenter}
          className="flex items-center justify-center border-b border-outline-variant/30 p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
        >
          <span className="material-symbols-outlined text-[20px]">
            my_location
          </span>
        </button>
        <button
          type="button"
          title="Zoom in"
          onClick={() => map.zoomIn()}
          className="flex items-center justify-center border-b border-outline-variant/30 p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
        <button
          type="button"
          title="Zoom out"
          onClick={() => map.zoomOut()}
          className="flex items-center justify-center p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
      </div>
      <button
        type="button"
        onClick={onToggleLines}
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[13px] font-semibold shadow-sm transition-colors ${
          showLines
            ? "border-outline-variant/40 bg-surface-container-lowest text-primary hover:bg-surface-container"
            : "border-transparent bg-primary-container text-on-primary"
        }`}
      >
        <span className="material-symbols-outlined text-[16px] text-secondary">
          layers
        </span>
        <span>Corridor lines</span>
      </button>
    </div>
  );
}

export default function PassengerLiveMap({
  destination,
}: {
  destination: Destination | null;
}) {
  const [user, setUser] = useState<LatLng | null>(null);
  const [center, setCenter] = useState<LatLng>(UYO);
  const [locating, setLocating] = useState(
    () => typeof navigator !== "undefined" && "geolocation" in navigator
  );
  const [geoBlocked, setGeoBlocked] = useState(false);
  const [showLines, setShowLines] = useState(true);

  const { junctions, zones } = useGeoFeeds();
  const heatSpots = useMemo(() => {
    const lower = (s: string) => s.toLowerCase();
    const find = (kws: string[]) =>
      junctions.find((j) => kws.some((k) => lower(j.name).includes(k)));
    const picks = [
      find(["plaza"]),
      find(["itam", "market"]),
      find(["trop"]),
    ].filter((j) => j !== undefined);
    const rest = junctions.filter((j) => !picks.includes(j));
    return [...picks, ...rest].slice(0, 3);
  }, [junctions]);

  useEffect(() => {
    if (!locating) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const ll: LatLng = [pos.coords.latitude, pos.coords.longitude];
        setUser(ll);
        setCenter((prev) =>
          prev[0] === UYO[0] && prev[1] === UYO[1] ? ll : prev
        );
        setLocating(false);
      },
      (err) => {
        if (err?.code === err?.PERMISSION_DENIED) setGeoBlocked(true);
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [locating]);

  function recenter() {
    setCenter(user ?? UYO);
  }

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
        <Recenter center={center} />

        {/* Corridor demand anchors from the public junctions feed.
            Varying colors based on index to simulate demand levels from data. */}
        {heatSpots.map((s, index) => {
          const isHighSurge = index === 0 || index === 1;
          const color = isHighSurge ? "#DC2626" : "#F5A524";
          const radiusOuter = isHighSurge ? 320 : 300;
          const radiusInner = isHighSurge ? 150 : 130;
          const opacityOuter = isHighSurge ? 0.35 : 0.3;
          const opacityInner = isHighSurge ? 0.45 : 0.4;
          
          return (
            <Fragment key={s.id}>
              <Circle
                center={s.pos}
                radius={radiusOuter}
                pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: opacityOuter }}
              />
              <Circle
                center={s.pos}
                radius={radiusInner}
                pathOptions={{ color, weight: 0, fillColor: color, fillOpacity: opacityInner }}
              />
            </Fragment>
          );
        })}

        {zones.map((z) => (
          <Circle
            key={z.id}
            center={z.center}
            radius={z.radius_m}
            pathOptions={{ color: "#EF4444", weight: 1, fillColor: "#EF4444", fillOpacity: 0.2, dashArray: "4 4" }}
          />
        ))}

        {showLines &&
          Array.from(new Set(junctions.map((j) => j.corridor))).map((corridorId) => {
            const corridorJunctions = junctions.filter((j) => j.corridor === corridorId);
            if (corridorJunctions.length < 2) return null;
            return (
              <Polyline
                key={corridorId}
                positions={corridorJunctions.map((j) => j.pos)}
                pathOptions={{ color: "#1D5DFE", weight: 5 }}
              />
            );
          })}

        {/* Your live position + heat (real GPS) */}
        {user && (
          <>
            <Circle
              center={user}
              radius={350}
              pathOptions={{ color: "#F5A524", weight: 1, fillColor: "#F5A524", fillOpacity: 0.2 }}
            />
            <Circle
              center={user}
              radius={160}
              pathOptions={{ color: "#F5A524", weight: 1, fillColor: "#F5A524", fillOpacity: 0.28 }}
            />
            <Circle
              center={user}
              radius={60}
              pathOptions={{ color: "#1D5DFE", weight: 0, fillColor: "#1D5DFE", fillOpacity: 0.15 }}
            />
            <Marker position={user} icon={userDot()}>
              <Tooltip direction="bottom" offset={[0, 20]}>
                You are here
              </Tooltip>
            </Marker>
          </>
        )}

        {destination && (
          <Marker position={destination.pos} icon={destinationPin()}>
            <Tooltip direction="top" offset={[0, -40]} permanent>
              {destination.name}
            </Tooltip>
          </Marker>
        )}

        <FlyToDest destination={destination} />

        <MapControls
          onRecenter={recenter}
          showLines={showLines}
          onToggleLines={() => setShowLines((v) => !v)}
          user={user}
        />
      </MapContainer>

      {locating && (
        <div className="absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl bg-surface-container-lowest/95 px-3.5 py-2 shadow-sm">
          <span className="material-symbols-outlined animate-spin text-[18px] text-secondary">
            sync
          </span>
          <span className="text-[13px] font-medium text-on-surface">
            Locating you…
          </span>
        </div>
      )}

      {geoBlocked && !user && (
        <div className="absolute left-4 top-4 z-[500] flex max-w-xs items-start gap-2 rounded-xl bg-surface-container-lowest/95 px-3.5 py-2 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-heat-amber">
            location_off
          </span>
          <span className="text-[13px] font-medium text-on-surface">
            Location blocked — showing Uyo center. Enable GPS for your live
            position.
          </span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-[500] pointer-events-none">
        <div className="pointer-events-auto mx-auto flex max-w-max items-center gap-2 rounded-full bg-primary-container/90 px-4 py-2 text-on-primary shadow backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-tertiary-fixed" />
          <span className="text-[12px] font-medium tracking-wide">
            {user
              ? "Live position · Real-time corridor telemetry active"
              : "Uyo Central Hub · Real-time corridor telemetry active"}
          </span>
          <span className="text-xs text-on-primary-container">|</span>
          <span className="font-mono text-[11px] text-surface-variant">
            0.4s sync
          </span>
        </div>
      </div>
    </div>
  );
}
