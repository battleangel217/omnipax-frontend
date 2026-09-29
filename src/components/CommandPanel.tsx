"use client";

import { useState } from "react";
import Link from "next/link";

const PILLS = [
  "Tropicana",
  "Itam Market",
  "Aka Road",
  "Nwaniba Road",
  "Oron Rd Gateway",
];

export default function CommandPanel({
  onSearch,
  searching,
  geoError,
  onClearDestination,
}: {
  onSearch: (query: string) => void;
  searching: boolean;
  geoError: string;
  onClearDestination: () => void;
}) {
  const [dest, setDest] = useState("Tropicana Mall");
  const [activePill, setActivePill] = useState("Tropicana");
  const [reqState, setReqState] = useState<"idle" | "sending" | "issued">("idle");

  function commit(q: string) {
    onSearch(q);
  }

  function pickPill(p: string) {
    setActivePill(p);
    const q = p === "Tropicana" ? "Tropicana Mall" : p;
    setDest(q);
    commit(q);
  }

  function request() {
    if (reqState !== "idle") return;
    setReqState("sending");
    setTimeout(() => setReqState("issued"), 1100);
  }

  return (
    <aside className="relative z-20 flex h-full w-full flex-col justify-between overflow-y-auto border-r border-outline-variant/30 bg-surface-container-lowest shadow-xl lg:max-w-[440px]">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[13px] text-on-surface-variant">
            <span className="font-medium tracking-wide">
              Transit Access Workflow
            </span>
            <span className="font-semibold text-secondary">Step 3 of 3</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className="h-1.5 rounded-full bg-secondary" />
            <div className="h-1.5 rounded-full bg-secondary" />
            <div className="h-1.5 rounded-full bg-secondary-container animate-pulse" />
          </div>
          <div className="flex items-center justify-between pt-0.5 text-[11px] text-on-surface-variant">
            <span className="flex items-center gap-1 font-medium text-on-tertiary-container">
              <span className="material-symbols-outlined text-[14px]">
                check_circle
              </span>{" "}
              Phone
            </span>
            <span className="flex items-center gap-1 font-medium text-on-tertiary-container">
              <span className="material-symbols-outlined text-[14px]">
                check_circle
              </span>{" "}
              Verified
            </span>
            <span className="flex items-center gap-1 font-bold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />{" "}
              Destination
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="destination-input"
            className="text-[13px] font-semibold text-primary"
          >
            Where are you heading?
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-on-surface-variant">
              search
            </span>
            <input
              id="destination-input"
              type="text"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit(dest);
              }}
              placeholder="Search corridor or landmark..."
              className="h-12 w-full rounded-xl border border-outline-variant/60 bg-surface pl-11 pr-10 text-[14px] text-primary placeholder:text-on-surface-variant/60 focus:border-secondary focus:outline-none transition-all"
            />
            {searching && (
              <span className="material-symbols-outlined absolute right-3 animate-spin text-[18px] text-secondary">
                sync
              </span>
            )}
            {!searching && dest && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setDest("");
                  onClearDestination();
                }}
                className="absolute right-3 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">
                  cancel
                </span>
              </button>
            )}
          </div>
          {geoError && (
            <span className="pt-1 text-[13px] font-medium text-error">
              {geoError}
            </span>
          )}
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {PILLS.map((p) => {
              const active = p === activePill;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => pickPill(p)}
                  className={`rounded-full border border-transparent px-3 py-1.5 text-[13px] font-medium ${
                    active
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-tertiary-container opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-on-tertiary-container" />
              </span>
              <span className="text-[13px] font-semibold text-primary">
                Live Corridor Telemetry
              </span>
            </div>
            <span className="text-[13px] font-medium text-on-surface-variant">
              Aka Corridor Sector 1
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col rounded-xl bg-surface-container-lowest p-2.5">
              <span className="text-[11px] text-on-surface-variant">
                Fleet In Proximity
              </span>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-[20px] font-bold text-primary">3</span>
                <span className="text-[13px] text-on-surface-variant">
                  Keke / Mini
                </span>
              </div>
            </div>
            <div className="flex flex-col rounded-xl bg-surface-container-lowest p-2.5">
              <span className="text-[11px] text-on-surface-variant">
                Pickup Latency
              </span>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-[20px] font-bold text-primary">
                  ~2 - 4
                </span>
                <span className="text-[13px] text-on-surface-variant">mins</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container px-2 py-1.5 text-[13px]">
            <span className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                payments
              </span>
              Standard Corridor Fare:
            </span>
            <span className="font-bold text-primary">₦150 - ₦250</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={request}
            disabled={reqState === "sending"}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-[16px] font-semibold shadow-sm transition-all active:scale-[0.99] ${
              reqState === "issued"
                ? "bg-tertiary-container text-on-tertiary-container"
                : "bg-secondary-container text-on-primary hover:bg-secondary"
            } ${reqState === "sending" ? "pointer-events-none opacity-80" : ""}`}
          >
            {reqState === "idle" && (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  pin_drop
                </span>
                <span>Request transit pin</span>
              </>
            )}
            {reqState === "sending" && (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  sync
                </span>
                <span>Dispatching Pin...</span>
              </>
            )}
            {reqState === "issued" && (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  verified
                </span>
                <span>Pin Issued: #UY-8402 (Active)</span>
              </>
            )}
          </button>
          <p className="text-center text-[13px] text-on-surface-variant">
            Your pin lasts 15 minutes
          </p>
          {reqState === "issued" && (
            <Link
              href="/passenger/tip"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-container text-[15px] font-semibold text-on-primary transition-colors hover:bg-primary"
            >
              <span className="material-symbols-outlined text-[18px]">
                star
              </span>
              Boost with priority tip
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-outline-variant/30 bg-surface-container-low/50 p-4">
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined mt-0.5 text-[18px] text-secondary">
            electric_rickshaw
          </span>
          <p className="text-[12px] leading-tight text-on-surface-variant">
            <strong className="font-semibold text-on-surface">
              Automatic Dispatch:
            </strong>{" "}
            Active tricycles (Keke Napep) and registered minibuses on Aka &
            Oron lines are alerted instantly.
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined mt-0.5 text-[18px] text-secondary">
            cell_tower
          </span>
          <p className="text-[12px] leading-tight text-on-surface-variant">
            <strong className="font-semibold text-on-surface">
              Offline Capable:
            </strong>{" "}
            Zero airtime toll. Lightweight transmission runs reliably on 2G/3G
            bandwidth.{" "}
            <Link
              href="/passenger/restricted"
              className="font-semibold text-secondary hover:underline"
            >
              Check road closures
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
