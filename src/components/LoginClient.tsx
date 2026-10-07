"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ApiUnreachable, api, saveTokens, setRole } from "@/lib/api";

function formatPhone(digits: string) {
  const cleaned = digits.replace(/\D/g, "").slice(0, 10);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath =
    searchParams.get("next")?.startsWith("/") === true
      ? (searchParams.get("next") as string)
      : null;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter your 10-digit phone number.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const tokens = await api.login(
        `+234${phone.replace(/\D/g, "")}`,
        password
      );
      saveTokens(tokens);
      // Role isn't in the JWT: probe role-gated endpoints, most
      // privileged first. Honors ?next= for explicit destinations.
      const dest = nextPath;
      try {
        await api.corridors();
        setRole("admin");
        router.push(dest ?? "/admin");
        return;
      } catch {}
      try {
        await api.driverZones();
        setRole("driver");
        router.push(dest ?? "/driver");
      } catch {
        setRole("passenger");
        router.push(dest ?? "/passenger");
      }
    } catch (e) {
      if (e instanceof ApiUnreachable) {
        setError("Backend unreachable — check your connection and retry.");
      } else {
        setError(e instanceof Error ? e.message : "Login failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  const unverified =
    error.toLowerCase().includes("not verified") ||
    error.toLowerCase().includes("verify the otp");

  return (
    <div className="w-full bg-surface min-h-screen">
      <Header />
      <main className="w-full pt-16 md:pt-20 bg-surface">
        <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-12 md:px-12 md:pb-24 md:pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              Welcome back
            </p>
            <h1 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px] md:leading-[1.2]">
              Log in
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-on-surface-variant">
              Drivers route to dispatch, commuters to corridors — automatically.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="flex w-full flex-col gap-5 rounded-[2rem] bg-surface-container-lowest p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container">
                    <span className="material-symbols-outlined text-[24px] text-on-secondary">
                      login
                    </span>
                  </div>
                  <div>
                    <p className="text-[20px] font-bold tracking-tight text-primary">
                      Account login
                    </p>
                    <p className="text-[13px] text-on-surface-variant">
                      One login for riders and drivers.
                    </p>
                  </div>
                </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="login-phone"
                  className="text-[13px] font-semibold text-on-surface"
                >
                  Phone number
                </label>
                <div className="flex items-center w-full rounded-xl bg-surface-container-low px-4 py-1.5 focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-secondary transition-all">
                  <span className="shrink-0 pr-3 text-[13px] font-semibold text-primary-container">
                    +234
                  </span>
                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="800 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(formatPhone(e.target.value));
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    className="w-full bg-transparent text-[20px] font-semibold text-primary-container tracking-wider outline-none placeholder:text-outline"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="login-password"
                  className="text-[13px] font-semibold text-on-surface"
                >
                  Password
                </label>
                <div className="flex items-center w-full rounded-xl bg-surface-container-low px-4 focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-secondary transition-all">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    className="w-full bg-transparent h-14 text-[16px] text-primary-container outline-none placeholder:text-outline"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="material-symbols-outlined text-outline text-[20px]"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "visibility_off" : "visibility"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex flex-col gap-2">
                  <p className="text-[13px] font-medium text-error">{error}</p>
                  {unverified && (
                    <Link
                      href="/signup"
                      className="text-[13px] font-semibold text-secondary hover:underline"
                    >
                      Verify your email first — continue signup
                    </Link>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={submit}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-secondary text-[16px] font-semibold text-on-secondary transition-colors hover:bg-secondary-container disabled:opacity-70"
              >
                <span>{busy ? "Logging in…" : "Log in"}</span>
                {!busy && (
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                )}
              </button>

              <p className="text-center text-[14px] text-on-surface-variant">
                New here?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-secondary hover:underline"
                >
                  Create account
                </Link>
              </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-6">
              <div className="overflow-hidden rounded-[2rem] border border-line bg-surface-container-lowest">
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="flex items-center gap-2 text-[14px] font-medium text-on-surface">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-on-tertiary-container opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-on-tertiary-container" />
                    </span>
                    Live Corridor Feed
                  </span>
                  <span className="text-[13px] text-on-surface-variant">
                    Updated 10s ago
                  </span>
                </div>
                <div className="relative h-48 w-full">
                  <Image
                    src="/plazamap.png"
                    alt="Ibom Plaza corridor map"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-2">
                    <span className="text-[13px] font-semibold text-primary">
                      Ibom Plaza to Tropicana
                    </span>
                    <span className="text-[13px] font-medium text-secondary">
                      18 Keke nearby
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-[2rem] bg-surface-container-lowest p-5">
                  <span className="material-symbols-outlined text-[22px] text-secondary">
                    person_pin_circle
                  </span>
                  <p className="text-[13px] leading-snug text-on-surface-variant">
                    <strong className="font-semibold text-on-surface">
                      Commuters
                    </strong>{" "}
                    land on corridors.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-[2rem] bg-surface-container-lowest p-5">
                  <span className="material-symbols-outlined text-[22px] text-primary">
                    electric_rickshaw
                  </span>
                  <p className="text-[13px] leading-snug text-on-surface-variant">
                    <strong className="font-semibold text-on-surface">
                      Drivers
                    </strong>{" "}
                    land on dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[2rem] bg-surface-container-low p-6">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  lock
                </span>
                <p className="text-[14px] leading-relaxed text-on-surface-variant">
                  Sessions stay on this device. Log out anytime from Settings.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-[14px] text-on-surface-variant">
            Trouble logging in?{" "}
            <Link
              href="/signup"
              className="font-semibold text-secondary hover:underline"
            >
              Recover via signup
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
