"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ApiUnreachable, api, saveTokens } from "@/lib/api";

function formatPhone(digits: string) {
  const cleaned = digits.replace(/\D/g, "").slice(0, 10);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

export default function LoginClient() {
  const router = useRouter();
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
      // Role isn't in the JWT: a 200 from a driver-only endpoint means driver.
      try {
        await api.driverZones();
        router.push("/driver");
      } catch {
        router.push("/passenger");
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

          <div className="mx-auto mt-10 max-w-md">
            <div className="flex w-full flex-col gap-5 rounded-[2rem] bg-surface-container-lowest p-6 md:p-8">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
