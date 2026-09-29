"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Vehicle = "keke" | "minibus";

export default function DriverSetupForm() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle>("keke");
  const [plate, setPlate] = useState("AKS 123 XY");
  const [showOffCorridor, setShowOffCorridor] = useState(true);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push("/driver");
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-[13px] tracking-wider uppercase text-on-surface-variant font-semibold">
          Vehicle Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVehicle("keke")}
            aria-pressed={vehicle === "keke"}
            className={`relative cursor-pointer p-6 rounded-2xl transition-colors flex flex-col justify-between min-h-[150px] text-left ${
              vehicle === "keke"
                ? "bg-surface-container-low outline outline-2 outline-primary-container"
                : "bg-surface-container-lowest outline outline-1 outline-outline-variant"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  vehicle === "keke"
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  electric_rickshaw
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  vehicle === "keke"
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container-highest text-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  check
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p
                className={`text-[16px] font-semibold ${
                  vehicle === "keke" ? "text-primary" : "text-on-surface"
                }`}
              >
                Keke
              </p>
              <p className="text-[13px] text-on-surface-variant">
                Three-wheeler · Max 4 passengers
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setVehicle("minibus")}
            aria-pressed={vehicle === "minibus"}
            className={`relative cursor-pointer p-6 rounded-2xl transition-colors flex flex-col justify-between min-h-[150px] text-left ${
              vehicle === "minibus"
                ? "bg-surface-container-low outline outline-2 outline-primary-container"
                : "bg-surface-container-lowest outline outline-1 outline-outline-variant"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  vehicle === "minibus"
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  directions_bus
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  vehicle === "minibus"
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container-highest text-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  check
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p
                className={`text-[16px] font-semibold ${
                  vehicle === "minibus" ? "text-primary" : "text-on-surface"
                }`}
              >
                Mini-bus
              </p>
              <p className="text-[13px] text-on-surface-variant">
                Suzuki Every / Daihatsu · Max 7
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="plate-input"
          className="text-[13px] tracking-wider uppercase text-on-surface-variant font-semibold"
        >
          Plate Number
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-on-surface-variant material-symbols-outlined text-[20px]">
            badge
          </span>
          <input
            id="plate-input"
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="AKS 000 XX"
            className="w-full h-12 pl-11 pr-4 bg-surface-container-lowest rounded-lg text-[16px] font-semibold tracking-widest text-on-surface uppercase outline outline-1 outline-outline-variant focus:outline-2 focus:outline-secondary transition-all"
          />
        </div>
        <span className="text-[13px] text-on-surface-variant">
          Must match your Akwa Ibom State Ministry of Transport permit.
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="off-corridor-toggle"
            className="text-[13px] font-medium text-on-surface cursor-pointer select-none"
          >
            Show me demand on other roads too
          </label>
          <button
            id="off-corridor-toggle"
            role="switch"
            aria-checked={showOffCorridor}
            type="button"
            onClick={() => setShowOffCorridor((v) => !v)}
            className={`w-[52px] h-[30px] rounded-full p-0.5 transition-colors relative flex items-center shrink-0 focus:outline-none ${
              showOffCorridor ? "bg-on-tertiary-container" : "bg-outline-variant"
            }`}
          >
            <span
              className="w-6 h-6 rounded-full bg-surface-container-lowest transition-transform duration-200"
              style={{
                transform: showOffCorridor
                  ? "translateX(22px)"
                  : "translateX(0px)",
              }}
            />
          </button>
        </div>
        <p className="text-[13px] text-on-surface-variant pr-8">
          Nearby off-corridor passenger requests will appear dimmed on your
          radar.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-space-xs">
        <button
          className="w-full h-14 bg-primary-container hover:bg-primary text-on-primary rounded-2xl text-[16px] font-semibold flex items-center justify-center gap-2 transition-colors"
          type="submit"
        >
          <span>Start driving</span>
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </button>
        <div className="flex items-center justify-center gap-2 text-[13px] text-on-surface-variant py-space-xs text-center">
          <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
            verified_user
          </span>
          <span>
            Verified by Akwa Ibom State Ministry of Transport Dispatch Protocol
            v2.4
          </span>
        </div>
      </div>
    </form>
  );
}
