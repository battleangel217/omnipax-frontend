"use client";

import { useCallback, useState } from "react";
import CommandPanel from "./CommandPanel";
import PassengerMap from "./PassengerMap";

export type Destination = {
  name: string;
  pos: [number, number];
};

const geoCache = new Map<string, Destination>();

async function geocode(query: string): Promise<Destination | null> {
  const key = query.trim().toLowerCase();
  if (geoCache.has(key)) return geoCache.get(key)!;
  const q = `${query}, Uyo, Akwa Ibom, Nigeria`;
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ng" +
    `&viewbox=7.85,5.08,8.0,4.95&bounded=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const [lon, lat] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  const found = {
    name: data[0].display_name.split(",").slice(0, 2).join(","),
    pos: [lat, lon] as [number, number],
  };
  geoCache.set(key, found);
  return found;
}

export default function PassengerExperience() {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState("");

  const search = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setGeoError("");
    try {
      const found = await geocode(q);
      if (found) {
        setDestination({ name: q, pos: found.pos });
      } else {
        setGeoError("Place not found — try a landmark or road.");
      }
    } catch {
      setGeoError("Search failed — check your connection and retry.");
    } finally {
      setSearching(false);
    }
  }, []);

  const clearDestination = useCallback(() => setDestination(null), []);

  return (
    <>
      <CommandPanel
        onSearch={search}
        searching={searching}
        geoError={geoError}
        onClearDestination={clearDestination}
      />
      <PassengerMap destination={destination} />
    </>
  );
}
