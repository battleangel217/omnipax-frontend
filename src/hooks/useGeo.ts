"use client";

import { useEffect, useState } from "react";
import { ApiUnreachable, api } from "@/lib/api";
import {
  AKA_SOUTH,
  IBOM_PLAZA,
  ITAM,
  TROPICANA,
  type LatLng,
} from "@/components/map-data";

export type FeedCorridor = { id: string; name: string };
export type FeedJunction = {
  id: string;
  name: string;
  corridor: string;
  pos: LatLng;
};
export type FeedZone = {
  id: string;
  name: string;
  center: LatLng;
  radius_m: number;
  reason: string;
};

export type GeoFeeds = {
  live: boolean;
  corridors: FeedCorridor[];
  junctions: FeedJunction[];
  zones: FeedZone[];
};

/** Fallback anchors used when the backend is unreachable. */
export const FALLBACK_JUNCTIONS: FeedJunction[] = [
  { id: "fb-plaza", name: "Ibom Plaza Hub", corridor: "fb-oron", pos: IBOM_PLAZA },
  { id: "fb-itam", name: "Itam Market Hub", corridor: "fb-ikot", pos: ITAM },
  { id: "fb-trop", name: "Tropicana Mall", corridor: "fb-oron", pos: TROPICANA },
  { id: "fb-aka", name: "Aka Road", corridor: "fb-aka", pos: AKA_SOUTH },
];

export const FALLBACK_CORRIDORS: FeedCorridor[] = [
  { id: "fb-oron", name: "Oron Road" },
  { id: "fb-ikot", name: "Ikot Ekpene Road" },
  { id: "fb-itam", name: "Itam Market Hub" },
  { id: "fb-aka", name: "Aka Road" },
];

let cache: GeoFeeds | null = null;

export function useGeoFeeds(): GeoFeeds {
  const [feeds, setFeeds] = useState<GeoFeeds>(
    () =>
      cache ?? {
        live: false,
        corridors: FALLBACK_CORRIDORS,
        junctions: FALLBACK_JUNCTIONS,
        zones: [],
      }
  );

  useEffect(() => {
    if (cache) return;
    let live = true;
    Promise.all([
      api.publicCorridors().catch(() => null),
      api.publicJunctions().catch(() => null),
      api.publicZones().catch(() => null),
    ])
      .then(([corridors, junctions, zones]) => {
        if (!live) return;
        if (!corridors && !junctions && !zones) return;
        const next: GeoFeeds = {
          live: true,
          corridors: corridors?.length
            ? corridors.map((c) => ({ id: c.id, name: c.name }))
            : FALLBACK_CORRIDORS,
          junctions: junctions?.length
            ? junctions.map((j) => ({
                id: j.id,
                name: j.name,
                corridor: j.corridor,
                pos: [parseFloat(j.latitude), parseFloat(j.longitude)],
              }))
            : FALLBACK_JUNCTIONS,
          zones: zones?.length
            ? zones.map((z) => ({
                id: z.id,
                name: z.name,
                center: z.coordinates.center,
                radius_m: z.coordinates.radius_m,
                reason: z.reason,
              }))
            : [],
        };
        cache = next;
        setFeeds(next);
      })
      .catch((e) => {
        if (!(e instanceof ApiUnreachable)) {
          /* keep fallbacks */
        }
      });
    return () => {
      live = false;
    };
  }, []);

  return feeds;
}

export function haversineKm(a: LatLng, b: LatLng): number {
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

export function nearestJunction(
  pos: LatLng,
  junctions: FeedJunction[]
): FeedJunction | null {
  let best: FeedJunction | null = null;
  let bestD = Infinity;
  for (const j of junctions) {
    const d = haversineKm(pos, j.pos);
    if (d < bestD) {
      bestD = d;
      best = j;
    }
  }
  return best;
}

/** True when a point sits inside any restricted zone circle. */
export function blockingZone(
  pos: LatLng,
  zones: FeedZone[]
): FeedZone | null {
  for (const z of zones) {
    if (haversineKm(pos, z.center) * 1000 <= z.radius_m) return z;
  }
  return null;
}
