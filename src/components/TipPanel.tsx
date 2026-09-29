"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIPS = [
  { amount: 100, tag: "Recommended" },
  { amount: 200, tag: "Fast pickup" },
  { amount: 300, tag: "Peak surge" },
];

const FEE = 10;

export default function TipPanel() {
  const router = useRouter();
  const [selected, setSelected] = useState<number>(100);
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [payState, setPayState] = useState<"idle" | "paying" | "active">("idle");

  const total = selected + FEE;

  function pick(amount: number) {
    setSelected(amount);
    setCustomOpen(false);
  }

  function applyCustom() {
    const num = parseInt(custom, 10);
    if (!Number.isNaN(num) && num >= 50) {
      setSelected(num);
      setCustomOpen(false);
    }
  }

  function pay() {
    if (payState !== "idle") return;
    setPayState("paying");
    setTimeout(() => setPayState("active"), 1000);
    setTimeout(() => router.push("/passenger/pin"), 2200);
  }

  return (
    <aside className="flex flex-col gap-4 lg:col-span-4">
      <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-secondary">
              Visibility Boost
            </span>
            <span className="rounded bg-surface-container px-2 py-0.5 text-[13px] text-on-surface-variant">
              Optional
            </span>
          </div>
          <h1 className="mt-1 text-[28px] font-bold leading-[35px] text-primary-container">
            Add a priority tip
          </h1>
          <p className="mt-1 text-[14px] text-on-surface-variant">
            Your area glows gold for drivers. Tips are optional.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg bg-surface-container-high p-3">
          <span className="material-symbols-outlined mt-0.5 text-[20px] text-secondary-container">
            radar
          </span>
          <p className="text-[13px] text-on-surface">
            Drivers in range (7 Keke, 2 Mini-buses) will see an intensified
            gold beacon on your pickup zone at Ibom Plaza Central Circus.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-on-surface">
            Select priority tip amount
          </label>
          <div className="grid grid-cols-3 gap-1">
            {TIPS.map((t) => {
              const active = selected === t.amount && !customOpen;
              return (
                <button
                  key={t.amount}
                  type="button"
                  onClick={() => pick(t.amount)}
                  className={`flex h-12 flex-col items-center justify-center rounded-lg text-[20px] font-semibold transition-colors ${
                    active
                      ? "bg-primary-container text-on-primary"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <span>₦{t.amount}</span>
                  <span
                    className={`text-[11px] font-normal leading-none ${
                      active ? "opacity-80" : "text-on-surface-variant"
                    }`}
                  >
                    {t.tag}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setCustomOpen((v) => !v)}
              className="flex items-center gap-1 text-[13px] text-secondary hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">
                tune
              </span>
              Custom tip amount
            </button>
          </div>
          {customOpen && (
            <div className="flex gap-2">
              <input
                type="number"
                min={50}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyCustom();
                }}
                placeholder="Min ₦50"
                className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-[16px] text-primary outline-none placeholder:text-outline focus:ring-2 focus:ring-secondary"
              />
              <button
                type="button"
                onClick={applyCustom}
                className="h-12 shrink-0 rounded-lg bg-primary-container px-5 text-[14px] font-semibold text-on-primary"
              >
                Set
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-4">
          <span className="text-[13px] font-semibold text-on-surface-variant">
            Payment Summary
          </span>
          <div className="flex items-center justify-between text-[14px] text-on-surface">
            <span>Priority driver tip</span>
            <span>₦{selected}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] text-on-surface-variant">
            <span>Payment network fee</span>
            <span>₦{FEE}</span>
          </div>
          <div className="my-1 h-px bg-surface-variant" />
          <div className="flex items-center justify-between text-[20px] font-bold text-on-surface">
            <span>Total payable</span>
            <span className="text-primary-container">₦{total}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface-container p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container-lowest text-primary-container">
              <span className="material-symbols-outlined text-[20px]">
                account_balance_wallet
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-on-surface">
                Pay with Bachs Wallet
              </span>
              <span className="text-[13px] text-on-surface-variant">
                Balance: ₦4,250 · Instant release
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-[13px] font-semibold text-secondary hover:underline"
          >
            Change
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={pay}
            disabled={payState === "paying"}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-lg text-[20px] font-semibold transition-colors ${
              payState === "active"
                ? "bg-on-tertiary-container text-on-primary"
                : "bg-primary-container text-on-primary hover:bg-primary"
            } ${payState === "paying" ? "opacity-80" : ""}`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {payState === "active" ? "verified" : "lock"}
            </span>
            <span className="text-[16px]">
              {payState === "idle" && `Pay ₦${total}`}
              {payState === "paying" && "Activating Gold Beacon..."}
              {payState === "active" && "Priority Beacon Active"}
            </span>
          </button>
          <p className="text-center text-[13px] text-on-surface-variant">
            Secure payment powered by Bachs · Zero charge on failed rides
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-surface-container-low p-3">
          <span className="material-symbols-outlined mt-0.5 text-[18px] text-on-surface-variant">
            verified_user
          </span>
          <p className="text-[13px] leading-relaxed text-on-surface-variant">
            Tips are credited directly to the driver who picks you up. If you
            cancel your pin before pickup, your full amount is refunded
            immediately to your Bachs wallet.
          </p>
        </div>
      </div>
    </aside>
  );
}
