"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { useActivePin, readStoredPin } from "@/hooks/useActivePin";
import { api, loadTokens } from "@/lib/api";

const LiveMap = dynamic(() => import("@/components/TipLiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[620px] w-full items-center justify-center bg-slate-100">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
          sync
        </span>
        <span className="text-[14px] font-medium">Loading live map…</span>
      </div>
    </div>
  ),
});

const TOTAL_WINDOW = 15 * 60;
const START_LEFT = 9 * 60 + 8;

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function PinTrackClient() {
  const { pin, clearPin } = useActivePin();
  // Real expiry when a live pin exists, demo fallback otherwise.
  const [left, setLeft] = useState(() => {
    const p = readStoredPin();
    if (!p) return START_LEFT;
    return Math.max(
      0,
      Math.floor((new Date(p.expires_at).getTime() - Date.now()) / 1000)
    );
  });
  const [rideState, setRideState] = useState<"active" | "done">("active");
  const [cancelArm, setCancelArm] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const router = useRouter();

  function gotRide() {
    setRideState("done");
    setTimeout(() => router.push("/passenger/done"), 1200);
  }

  useEffect(() => {
    if (left <= 0 || rideState !== "active" || cancelled) return;
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, rideState, cancelled]);

  const pct = Math.max(0, Math.min(100, (left / TOTAL_WINDOW) * 100));

  function cancel() {
    if (!cancelArm) {
      setCancelArm(true);
      return;
    }
    if (pin && loadTokens()) {
      api.pin.cancel(pin.id).catch(() => {});
    }
    clearPin();
    setCancelled(true);
  }

  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <AppHeader active="corridors" />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full bg-surface-container-low border-b border-surface-variant/60 px-6 py-2.5 flex flex-wrap items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-1.5 rounded-full bg-tertiary-container/10 px-2.5 py-1 text-[13px] font-medium text-on-tertiary-container">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-tertiary-container opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-on-tertiary-container" />
                </span>
                <span>
                  {cancelled
                    ? "Pin Cancelled"
                    : rideState === "done"
                      ? "Trip Complete"
                      : "Priority Dispatch Active"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-on-surface">
                <span className="material-symbols-outlined text-[17px] text-secondary">
                  timer
                </span>
                <span>
                  Pin Expires:{" "}
                  <strong className="font-semibold tabular-nums">
                    {formatTime(left)}
                  </strong>
                </span>
              </div>
          </div>

          <div className="w-full p-6 lg:p-8 max-w-[1560px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <section className="lg:col-span-4 flex flex-col gap-6">
                <div className="rounded-xl border border-surface-variant/70 bg-surface-container-lowest p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[13px] font-medium text-amber-800">
                      <span
                        className="material-symbols-outlined text-[16px] text-amber-600"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      Priority tip added
                    </span>
                    <span className="text-[13px] text-on-surface-variant">
                      Queue: 1st Position
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-[28px] font-bold leading-[35px] tracking-tight text-primary-container">
                      Your area glows gold
                    </h1>
                    <p className="text-[14px] text-on-surface-variant">
                      Nearby drivers can see your gold beacon.
                    </p>
                  </div>
                  <div className="space-y-2.5 rounded-lg bg-surface-container-low p-3.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-1.5 text-on-surface">
                        <span className="material-symbols-outlined text-[18px] text-amber-600">
                          schedule
                        </span>
                        <span className="font-semibold tabular-nums">
                          {formatTime(left)} remaining
                        </span>
                      </span>
                      <span className="text-[13px] text-on-surface-variant">
                        15 min window
                      </span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-1000"
                        style={{ width: `${pct.toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[16px] text-emerald-900">
                      <span
                        className="material-symbols-outlined text-[20px] text-emerald-700"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span className="font-bold">₦100 tip paid</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[13px] font-semibold text-emerald-800">
                      Top dispatch queue
                    </span>
                  </div>
                  <p className="text-[14px] text-emerald-900/80">
                    Drivers on Ikot Ekpene, Oron & Aka roads see your gold
                    priority beacon and active pickup request.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      icon: "group",
                      iconBg: "bg-surface-container-low text-secondary",
                      title: "14 people waiting near you",
                      sub: "Aggregate demand at this roundabout node",
                    },
                    {
                      icon: "electric_rickshaw",
                      iconBg: "bg-amber-100 text-amber-900",
                      title: "Beacon visible to drivers",
                      sub: "Nearby Keke and minibuses can see it",
                    },
                    {
                      icon: "alt_route",
                      iconBg: "bg-surface-container-low text-primary-container",
                      title: "Assigned Corridor: Oron Road",
                      sub: "Estimated Keke arrival: 2 to 4 minutes",
                    },
                  ].map((c) => (
                    <div
                      key={c.title}
                      className="flex items-start gap-3.5 rounded-xl border border-surface-variant/70 bg-surface-container-lowest p-4"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {c.icon}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[16px] font-semibold text-on-surface">
                          {c.title}
                        </span>
                        <span className="text-[13px] text-on-surface-variant">
                          {c.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {rideState === "done" ? (
                    <div className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-tertiary-container text-[16px] font-semibold text-on-tertiary-container">
                      <span className="material-symbols-outlined text-[20px]">
                        verified
                      </span>
                      Trip Confirmed · Dispatch Complete
                    </div>
                  ) : cancelled ? (
                    <div className="flex h-14 w-full items-center justify-center rounded-xl bg-surface-container px-4 text-center text-[14px] font-semibold text-error">
                      Pin cancelled · ₦100 refunded to Bachs wallet
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={gotRide}
                        className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-container text-[16px] font-semibold text-on-primary transition-all hover:bg-on-background active:scale-[0.99]"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          thumb_up
                        </span>
                        I got a ride
                      </button>
                      <button
                        type="button"
                        onClick={cancel}
                        className="w-full cursor-pointer py-2.5 text-center text-[13px] font-medium text-outline transition-colors hover:text-on-surface hover:underline"
                      >
                        {cancelArm
                          ? "Tap again to confirm cancel + refund"
                          : "Cancel pin"}
                      </button>
                    </>
                  )}
                  <div className="flex items-center gap-2 rounded-lg border border-surface-variant/50 bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
                    <span className="material-symbols-outlined shrink-0 text-[16px]">
                      info
                    </span>
                    <span>
                      If you cancel before pickup, your ₦100 priority tip is
                      refunded automatically to your Bachs wallet.
                    </span>
                  </div>
                </div>
              </section>

              <section className="lg:col-span-8 flex flex-col gap-4">
                <div className="relative h-[620px] w-full select-none overflow-hidden rounded-2xl border border-surface-variant/80 bg-slate-100">
                  <LiveMap />
                  <div className="absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-lg border border-surface-variant/80 bg-surface-container-lowest/95 px-3.5 py-2 backdrop-blur">
                    <span className="h-2.5 w-2.5 animate-ping rounded-full bg-amber-500" />
                    <span className="text-[13px] font-semibold text-on-surface">
                      Gold beacon live · Ibom Plaza node
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    {
                      icon: "speed",
                      value: "2.1x",
                      label: "Faster driver response rate",
                    },
                    {
                      icon: "pin_drop",
                      value: "#1 in queue",
                      label: "Priority dispatch rank",
                    },
                    {
                      icon: "currency_exchange",
                      value: "100% Refund",
                      label: "Automatic on cancel",
                    },
                  ].map((c) => (
                    <div
                      key={c.value}
                      className="flex items-center justify-between rounded-xl border border-surface-variant/70 bg-surface-container-lowest p-3.5"
                    >
                      <span className="text-[13px] text-on-surface-variant">
                        {c.label}
                      </span>
                      <span className="text-[16px] font-bold text-on-surface">
                        {c.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-[13px] text-on-surface-variant">
                  <span>Waiting too long?</span>
                  <Link
                    href="/passenger"
                    className="font-semibold text-secondary hover:underline"
                  >
                    Adjust your pin
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full bg-surface-container py-4 mt-auto">
        <div className="w-full px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <p className="text-[13px] text-on-surface-variant">
            © 2025 TransitSight Metropolitan Telemetry. Akwa Ibom State
            Ministry of Transport.
          </p>
          <div className="flex items-center flex-wrap justify-center gap-4 text-[13px] text-on-surface-variant">
            {[
              "Uyo Corridor Safety",
              "Operator By-laws",
              "Dispatch Protocol v2.4",
            ].map((l) => (
              <span key={l} className="hover:text-on-surface cursor-pointer">
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
