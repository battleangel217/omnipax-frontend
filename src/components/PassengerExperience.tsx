"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import CommandPanel from "./CommandPanel";
import PassengerMap from "./PassengerMap";
import { ApiUnreachable, api, loadTokens } from "@/lib/api";
import { getDeviceId } from "@/lib/device";
import type { LatLng } from "@/components/map-data";
import { useActivePin, type ActivePin } from "@/hooks/useActivePin";
import {
  blockingZone,
  nearestJunction,
  useGeoFeeds,
  type FeedJunction,
} from "@/hooks/useGeo";

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

function currentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("No geolocation"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      () => reject(new Error("Location blocked")),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

export default function PassengerExperience() {
  const router = useRouter();
  const { junctions, zones } = useGeoFeeds();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [searching, setSearching] = useState(false);
  const [geoError, setGeoError] = useState("");
  const { pin, setPin: persistPin } = useActivePin();
  const [pinBusy, setPinBusy] = useState(false);
  const [pinError, setPinError] = useState("");

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

  const requestPin = useCallback(async () => {
    setPinError("");
    if (!loadTokens()) {
      router.push("/signup?next=/passenger");
      return;
    }
    setPinBusy(true);
    try {
      const pos = await currentPosition();
      const zone = blockingZone(pos, zones);
      if (zone) {
        router.push("/passenger/restricted");
        return;
      }
      const junction: FeedJunction | null = nearestJunction(pos, junctions);
      if (!junction) throw new Error("No corridor nearby.");
      const created = await api.pin.create({
        device_id: getDeviceId(),
        latitude: pos[0],
        longitude: pos[1],
        corridor_id: junction.corridor,
        vehicle_type: "keke",
      });
      persistPin(created as unknown as ActivePin);
    } catch (e) {
      if (e instanceof ApiUnreachable) {
        setPinError("Backend unreachable — pin not issued. Retry shortly.");
      } else if (
        e instanceof Error &&
        "status" in e &&
        (e as { status: number }).status === 403
      ) {
        router.push("/passenger/restricted");
      } else {
        setPinError(e instanceof Error ? e.message : "Pin request failed.");
      }
    } finally {
      setPinBusy(false);
    }
  }, [junctions, zones, persistPin, router]);

  const cancelPin = useCallback(async () => {
    if (!pin) return;
    setPinBusy(true);
    try {
      if (loadTokens()) await api.pin.cancel(pin.id);
    } catch {
      // Clear locally regardless; server expiry sweeps the rest.
    } finally {
      persistPin(null);
      setPinBusy(false);
    }
  }, [pin, persistPin]);

  return (
    <>
      <CommandPanel
        onSearch={search}
        searching={searching}
        geoError={geoError}
        onClearDestination={clearDestination}
        pin={pin}
        pinBusy={pinBusy}
        pinError={pinError}
        onRequestPin={requestPin}
        onCancelPin={cancelPin}
      />
      <PassengerMap destination={destination} />
    </>
  );
}
