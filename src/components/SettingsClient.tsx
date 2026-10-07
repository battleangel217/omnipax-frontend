"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveTokens, setRole } from "@/lib/api";

type Prefs = {
  mode: "day" | "night";
  keepAwake: boolean;
  sound: boolean;
  dataSaver: boolean;
  language: string;
};

const LANGS = ["English", "Pidgin", "Yoruba", "Hausa", "Igbo"];
const DEFAULTS: Prefs = {
  mode: "day",
  keepAwake: true,
  sound: true,
  dataSaver: true,
  language: "English",
};

function load(): Prefs {
  try {
    const raw = localStorage.getItem("transitsight-driver-prefs");
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function Toggle({
  on,
  onFlip,
  label,
}: {
  on: boolean;
  onFlip: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onFlip}
      className={`relative flex h-[32px] w-[52px] shrink-0 cursor-pointer items-center border-0 p-0 transition-colors rounded-full ${
        on ? "bg-tertiary-fixed-dim" : "bg-surface-container-highest"
      }`}
    >
      <span
        className={`flex h-[26px] w-[26px] items-center justify-center rounded-full bg-surface-container-lowest transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            on ? "bg-tertiary-container" : "bg-outline-variant"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsClient() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(() => load());
  const hydrated = useRef(false);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    try {
      localStorage.setItem("transitsight-driver-prefs", JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  function set<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setPrefs((p) => ({ ...p, [k]: v }));
  }

  function cycleLang() {
    const i = LANGS.indexOf(prefs.language);
    set("language", LANGS[(i + 1) % LANGS.length]);
  }

  function logout() {
    if (!loggedOut) {
      setLoggedOut(true);
      return;
    }
    saveTokens(null);
    setRole(null);
    router.push("/");
  }

  const night = prefs.mode === "night";

  return (
    <div
      className="min-h-full bg-surface font-sans text-[14px] text-on-surface flex flex-col pt-safe pb-safe"
      style={
        night ? { filter: "brightness(0.82) contrast(1.08)" } : undefined
      }
    >
      <main className="flex-1 flex flex-col relative w-full bg-surface">
        <div className="flex flex-col w-full px-4 pb-6 max-w-md mx-auto">
          <header className="flex items-center justify-between py-4 bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Go back"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary-container transition-colors active:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_back
                </span>
              </button>
              <h1 className="text-[20px] font-semibold text-on-surface">
                Settings
              </h1>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1 text-[13px] text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-tertiary-fixed-dim" />
              Online
            </div>
          </header>

          <div className="mt-1 flex flex-col gap-6">
            <section className="flex items-center justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 select-none items-center justify-center rounded-full bg-primary-container text-[16px] font-semibold text-on-primary">
                  EU
                </div>
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[17px] font-semibold leading-5 text-on-surface">
                      Emem Udo
                    </span>
                    <span
                      className="material-symbols-outlined text-[16px] text-secondary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </div>
                  <span className="mt-0.5 truncate text-[13px] text-on-surface-variant">
                    Keke Napep · AKS 123 XY
                  </span>
                </div>
              </div>
              <Link
                href="/complete-profile"
                className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium text-secondary transition-colors hover:bg-surface-container-low active:bg-surface-container"
              >
                Edit
              </Link>
            </section>

            <section className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Transit Controls
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Uyo Municipal Hub
                </span>
              </div>
              <div className="divide-y divide-outline-variant/40 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest">
                <Link
                  href="/complete-profile"
                  className="group flex w-full items-center justify-between p-4 text-left transition-colors active:bg-surface-container-low"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">
                        alt_route
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-medium text-on-surface">
                        Approved corridor
                      </span>
                      <span className="truncate text-[13px] text-on-surface-variant">
                        Assigned service territory
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 pl-3">
                    <span className="text-[13px] font-semibold text-primary-container">
                      Oron Road
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-outline transition-transform group-hover:translate-x-0.5">
                      chevron_right
                    </span>
                  </div>
                </Link>

                <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">
                        lightbulb
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-on-surface">
                        Screen mode
                      </span>
                      <span className="text-[13px] text-on-surface-variant">
                        Sunlight visibility tuning
                      </span>
                    </div>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label="Screen mode"
                    className="flex w-full items-center self-start rounded-lg bg-surface-container p-1 sm:w-auto sm:self-auto"
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={prefs.mode === "day"}
                      onClick={() => set("mode", "day")}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-md px-3.5 py-1.5 text-center text-[13px] font-medium transition-all sm:flex-none ${
                        prefs.mode === "day"
                          ? "bg-primary-container text-on-primary"
                          : "text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        wb_sunny
                      </span>
                      Day (high contrast)
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={prefs.mode === "night"}
                      onClick={() => set("mode", "night")}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-md px-3.5 py-1.5 text-center text-[13px] font-medium transition-all sm:flex-none ${
                        prefs.mode === "night"
                          ? "bg-primary-container text-on-primary"
                          : "text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        dark_mode
                      </span>
                      Night
                    </button>
                  </div>
                </div>

                {[
                  {
                    icon: "stay_current_portrait",
                    title: "Keep screen on while driving",
                    sub: "Prevents lock while vehicle is active",
                    key: "keepAwake" as const,
                  },
                  {
                    icon: "volume_up",
                    title: "Sound alert for new hotspots",
                    sub: "Beep during passenger surges",
                    key: "sound" as const,
                  },
                  {
                    icon: "data_saver_on",
                    title: "Data saver",
                    sub: "Loads a simpler map on slow networks",
                    key: "dataSaver" as const,
                  },
                ].map((r) => (
                  <div
                    key={r.key}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4 pr-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                        <span className="material-symbols-outlined text-[20px]">
                          {r.icon}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[14px] font-medium text-on-surface">
                          {r.title}
                        </span>
                        <span className="text-[13px] text-on-surface-variant">
                          {r.sub}
                        </span>
                      </div>
                    </div>
                    <Toggle
                      on={prefs[r.key]}
                      onFlip={() => set(r.key, !prefs[r.key])}
                      label={r.title}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={cycleLang}
                  className="group flex w-full items-center justify-between p-4 text-left transition-colors active:bg-surface-container-low"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">
                        translate
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-medium text-on-surface">
                        Language
                      </span>
                      <span className="text-[13px] text-on-surface-variant">
                        Interface localization · tap to change
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 pl-3">
                    <span className="text-[13px] text-on-surface">
                      {prefs.language}
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-outline transition-transform group-hover:translate-x-0.5">
                      chevron_right
                    </span>
                  </div>
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Help
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Guidance and feedback
                </span>
              </div>
              <div className="divide-y divide-outline-variant/40 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest">
                <button
                  type="button"
                  onClick={() => setHeatmapOpen((v) => !v)}
                  className="group flex w-full items-center justify-between p-4 text-left transition-colors active:bg-surface-container-low"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">
                        info
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-medium text-on-surface">
                        How the heatmap works
                      </span>
                      <span className="truncate text-[13px] text-on-surface-variant">
                        Corridor density and update rates
                      </span>
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined shrink-0 text-[20px] text-outline transition-transform ${
                      heatmapOpen ? "rotate-90" : ""
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
                {heatmapOpen && (
                  <p className="px-4 pb-4 text-[13px] leading-relaxed text-on-surface-variant">
                    Red means 14+ commuters waiting, amber means moderate
                    density. Blobs are aggregate corridor counts refreshed
                    every few seconds — never individual people. Tapping a
                    hotspot flies your map to it.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setReportOpen((v) => !v)}
                  className="group flex w-full items-center justify-between p-4 text-left transition-colors active:bg-surface-container-low"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                      <span className="material-symbols-outlined text-[20px]">
                        report_problem
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-medium text-on-surface">
                        Report a wrong hotspot
                      </span>
                      <span className="truncate text-[13px] text-on-surface-variant">
                        Flag incorrect passenger cluster
                      </span>
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined shrink-0 text-[20px] text-outline transition-transform ${
                      reportOpen ? "rotate-90" : ""
                    }`}
                  >
                    chevron_right
                  </span>
                </button>
                {reportOpen && (
                  <div className="flex flex-col gap-2 px-4 pb-4">
                    {reportSent ? (
                      <p className="flex items-center gap-2 text-[13px] font-medium text-on-tertiary-container">
                        <span className="material-symbols-outlined text-[18px]">
                          done
                        </span>
                        Report sent — dispatch will verify the cluster.
                      </p>
                    ) : (
                      <>
                        <textarea
                          value={report}
                          onChange={(e) => setReport(e.target.value)}
                          rows={2}
                          placeholder="e.g. Itam blob shows surge but the park is empty"
                          className="w-full rounded-lg bg-surface-container-low p-3 text-[14px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
                        />
                        <button
                          type="button"
                          disabled={!report.trim()}
                          onClick={() => setReportSent(true)}
                          className="h-11 rounded-lg bg-primary-container text-[14px] font-semibold text-on-primary disabled:opacity-40"
                        >
                          Send report
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-col items-center justify-center gap-4 pb-6 pt-1">
              <button
                type="button"
                onClick={logout}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-[16px] font-semibold text-error transition-colors active:bg-error-container"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                {loggedOut ? "Tap again to confirm log out" : "Log out"}
              </button>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-[13px] text-on-surface-variant">
                  TransitSight v1.2.0 · Akwa Ibom State Transport
                </p>
                <div className="flex items-center gap-2 text-[11px] text-outline">
                  <span>Terminal ID: UYO-774</span>
                  <span>•</span>
                  <span>Sync: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
