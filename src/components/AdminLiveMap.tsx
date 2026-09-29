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
import { Fragment } from "react";
import L from "leaflet";
import {
  FixSize,
  IBOM_PLAZA,
  OsmTiles,
  type LatLng,
} from "./map-shared";

export type ClosureSegment = {
  id: string;
  name: string;
  line: LatLng[];
};

function hubIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="width:28px;height:28px;border-radius:9999px;background:#0B1F33;border:4px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  });
}

function FixView({ selected }: { selected: ClosureSegment | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) map.flyToBounds(L.latLngBounds(selected.line).pad(0.6), { duration: 1 });
  }, [map, selected]);
  return null;
}

function Controls({
  overlayOn,
  onToggleOverlay,
}: {
  overlayOn: boolean;
  onToggleOverlay: () => void;
}) {
  const map = useMap();
  return (
    <div className="absolute right-4 top-4 z-[500] flex flex-col items-end gap-2">
      <div className="flex items-center rounded-xl bg-surface-container-low p-1 gap-1">
        <button
          type="button"
          title="Zoom in"
          onClick={() => map.zoomIn()}
          className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-lowest hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
        <button
          type="button"
          title="Zoom out"
          onClick={() => map.zoomOut()}
          className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container-lowest hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <div className="mx-1 h-5 w-px bg-outline-variant" />
        <button
          type="button"
          onClick={onToggleOverlay}
          className={`flex h-8 items-center gap-1 rounded px-3 text-[13px] font-medium transition-colors ${
            overlayOn
              ? "text-primary hover:bg-surface-container-lowest"
              : "text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            layers
          </span>
          <span>Corridor Overlay</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLiveMap({
  closures,
  selectedId,
  onSelect,
  overlayOn,
  onToggleOverlay,
}: {
  closures: ClosureSegment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  overlayOn: boolean;
  onToggleOverlay: () => void;
}) {
  const selected = closures.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={IBOM_PLAZA}
        zoom={14}
        minZoom={11}
        maxZoom={19}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: "#EDF4FF" }}
      >
        <FixSize />
        <OsmTiles />
        <FixView selected={selected} />

        {overlayOn &&
          closures.map((c) => {
            const isSel = c.id === selectedId;
            return (
              <Fragment key={c.id}>
                <Polyline
                  positions={c.line}
                  pathOptions={{
                    color: isSel ? "#1D5DFE" : "#64748B",
                    weight: isSel ? 8 : 7,
                    opacity: isSel ? 1 : 0.85,
                  }}
                  eventHandlers={{ click: () => onSelect(c.id) }}
                />
                {isSel && (
                  <Polyline
                    positions={c.line}
                    pathOptions={{
                      color: "#FFFFFF",
                      weight: 2.5,
                      dashArray: "6 6",
                    }}
                  />
                )}
              </Fragment>
            );
          })}

        <Marker position={IBOM_PLAZA} icon={hubIcon()} zIndexOffset={50}>
          <Tooltip direction="top" offset={[0, -16]}>
            Ibom Plaza Hub
          </Tooltip>
        </Marker>

        {selected && (
          <Circle
            center={selected.line[Math.floor(selected.line.length / 2)]}
            radius={120}
            pathOptions={{
              color: "#1D5DFE",
              weight: 1,
              dashArray: "4 4",
              fillColor: "#1D5DFE",
              fillOpacity: 0.08,
            }}
          />
        )}

        <Controls overlayOn={overlayOn} onToggleOverlay={onToggleOverlay} />
      </MapContainer>

      {selected && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-[500] -translate-x-1/2">
          <div className="flex items-center gap-4 rounded-lg bg-primary px-4 py-2 text-on-primary shadow-md">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary-container" />
              <span className="text-[13px] font-medium">
                {closures.find((c) => c.id === selectedId)?.name ??
                  "Corridor"}
              </span>
            </div>
            <div className="h-4 w-px bg-on-primary-container/40" />
            <div className="flex items-center gap-1.5 text-[13px] text-on-primary-container">
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                tune
              </span>
              <span>Editing safety buffer (30m)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
