"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiUnreachable, api, saveTokens, setRole } from "@/lib/api";

type Step = 1 | 2 | 3 | 4;

function formatPhone(digits: string) {
  const cleaned = digits.replace(/\D/g, "").slice(0, 10);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

const STEP_LABELS = ["Phone", "Email", "Password", "OTP"];

export default function SignupFlow({
  step,
  setStep,
  phone,
  setPhone,
  email,
  setEmail,
  resendIn,
  setResendIn,
  mock,
  setMock,
  nextPath,
}: {
  step: Step;
  setStep: (s: Step) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  resendIn: number;
  setResendIn: (v: number | ((p: number) => number)) => void;
  mock: boolean;
  setMock: (v: boolean) => void;
  nextPath: string;
}) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((v: number) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn, setResendIn]);

  function phoneE164() {
    return `+234${phone.replace(/\D/g, "")}`;
  }

  function submitPhone() {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit number.");
      return;
    }
    setError("");
    setStep(2);
  }

  function submitEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStep(3);
  }

  async function submitPassword() {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      // Backend order: signup creates the user AND sends the OTP.
      await api.signup({
        email: email.trim(),
        phone_number: phoneE164(),
        password,
      });
      setMock(false);
      setOtp(["", "", "", "", "", ""]);
      setResendIn(40);
      setStep(4);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (e) {
      if (e instanceof ApiUnreachable) {
        // Backend down: continue the demo flow offline.
        setMock(true);
        setOtp(["", "", "", "", "", ""]);
        setResendIn(40);
        setStep(4);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      } else if (
        e instanceof Error &&
        e.message.toLowerCase().includes("already registered")
      ) {
        // Account exists (e.g. unverified): send a fresh code and verify it.
        try {
          await api.otpRequest(email.trim());
        } catch {
          // Request failures surface on verify/resend instead.
        }
        setMock(false);
        setOtp(["", "", "", "", "", ""]);
        setResendIn(40);
        setStep(4);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      } else {
        setError(e instanceof Error ? e.message : "Signup failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp() {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    setError("");
    if (mock) {
      setRole("passenger");
      setDone(true);
      return;
    }
    setBusy(true);
    try {
      const tokens = await api.otpVerify(email.trim(), code);
      saveTokens({ access: tokens.access, refresh: tokens.refresh });
      setRole("passenger");
      setDone(true);
    } catch (e) {
      if (e instanceof ApiUnreachable) {
        setMock(true);
        setRole("passenger");
        setDone(true);
      } else {
        setError(e instanceof Error ? e.message : "Verification failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex w-full flex-col items-center gap-5 rounded-[2rem] bg-surface-container-lowest p-6 text-center md:p-8">
        <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[24px]">
            check
          </span>
        </div>
        <div>
          <p className="text-[20px] font-bold text-primary-container">
            Account secured
          </p>
          <p className="text-[13px] text-on-surface-variant mt-1">
            {phone ? `+234 ${phone}` : ""} · {email}
          </p>
        </div>
        <p className="text-[14px] text-on-surface-variant">
          You can now pin your waiting spot.
        </p>
        <button
          onClick={() => router.push(nextPath)}
          className="w-full h-14 rounded-xl bg-primary-container text-on-primary text-[16px] font-semibold hover:bg-primary transition-colors"
        >
          Continue to set destination
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-[2rem] bg-surface-container-lowest p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <span className="text-[22px] font-bold tracking-tight text-primary">
          {step === 1 && "Commuter Verification"}
          {step === 2 && "Add your email"}
          {step === 3 && "Set a password"}
          {step === 4 && "Check your email"}
        </span>
        <span className="text-[14px] leading-relaxed text-on-surface-variant">
          {step === 1 && "Your 10-digit mobile line."}
          {step === 2 && "The code goes to this email."}
          {step === 3 && "Choose a password."}
          {step === 4 && `Enter the 6-digit code sent to ${email || "your email"}.`}
        </span>
        {mock && step >= 3 && (
          <span className="text-[13px] font-medium text-heat-amber">
            Demo mode — backend offline, continuing without live verification.
          </span>
        )}
      </div>

      {step === 1 && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="commuter-phone-input"
              className="text-[13px] font-semibold text-on-surface"
            >
              Phone number
            </label>
            <div className="flex items-center w-full rounded-xl bg-surface-container-low px-4 py-1.5 focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-secondary transition-all">
              <div className="flex items-center gap-2 pr-3 shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-4 rounded overflow-hidden bg-surface-container">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 16">
                    <rect fill="#008751" height="16" width="8" />
                    <rect fill="#FFFFFF" height="16" width="8" x="8" />
                    <rect fill="#008751" height="16" width="8" x="16" />
                  </svg>
                </span>
                <span className="text-[13px] font-semibold text-primary-container">
                  +234
                </span>
                <span className="material-symbols-outlined text-outline text-[18px]">
                  arrow_drop_down
                </span>
              </div>
              <input
                id="commuter-phone-input"
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
                  if (e.key === "Enter") submitPhone();
                }}
                className="w-full bg-transparent text-[20px] font-semibold text-primary-container tracking-wider outline-none placeholder:text-outline"
              />
            </div>
            <span className="text-[13px] text-on-surface-variant">
              Enter your active mobile line.
            </span>
          </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="signup-email"
            className="text-[13px] font-semibold text-on-surface"
          >
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitEmail();
            }}
            className="w-full rounded-xl bg-surface-container-low px-4 h-14 text-[16px] text-primary-container outline-none placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
          />
          <span className="text-[13px] text-on-surface-variant">
            Code goes here, not SMS.
          </span>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[20px] font-semibold text-primary block">
              Enter 6-Digit Code
            </span>
            <span className="text-[14px] text-on-surface-variant block mt-space-xs">
              Type with your keyboard.
            </span>
          </div>
          <div className="grid grid-cols-6 gap-3 w-full">
            {otp.map((v, i) => {
              const filled = v !== "";
              const isActive = i === otp.findIndex((x) => x === "") || (otp.every((x) => x !== "") && i === 5);
              return (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={v}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 1);
                    const next = [...otp];
                    next[i] = d;
                    setOtp(next);
                    setError("");
                    if (d && i < 5) otpRefs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0)
                      otpRefs.current[i - 1]?.focus();
                    if (e.key === "Enter") submitOtp();
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    if (!text) return;
                    e.preventDefault();
                    const next = ["", "", "", "", "", ""];
                    text.split("").forEach((ch, idx) => {
                      next[idx] = ch;
                    });
                    setOtp(next);
                    setError("");
                    otpRefs.current[Math.min(text.length, 5)]?.focus();
                  }}
                  aria-label={`Digit ${i + 1}`}
                  className={`h-16 flex items-center justify-center text-center rounded-xl text-[28px] font-bold outline-none transition-all ${
                    filled
                      ? "bg-surface-container text-primary"
                      : isActive
                        ? "bg-surface-container-lowest text-secondary ring-2 ring-secondary"
                        : "bg-surface-container-low text-primary"
                  }`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between px-space-xs">
            <span className="text-[13px] text-on-surface-variant flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {otp.join("").length === 6
                ? "Code complete — verify to continue"
                : `Awaiting remaining ${6 - otp.join("").length} digits`}
            </span>
            <span className="text-[13px] text-on-surface-variant">
              {resendIn > 0
                ? `Resend code in 0:${resendIn < 10 ? "0" : ""}${resendIn}`
                : "Code expired"}
            </span>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={submitOtp}
            className="w-full h-14 bg-secondary text-on-secondary rounded-xl text-[16px] font-semibold flex items-center justify-center gap-2 hover:bg-on-secondary-fixed-variant transition-colors disabled:opacity-70"
          >
            <span>{busy ? "Verifying…" : "Verify and continue"}</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>
          <div className="flex items-center justify-center pt-space-xs">
            <span className="text-[13px] text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                support_agent
              </span>
              <span>Having issues? Contact Terminal Dispatch</span>
            </span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-password"
              className="text-[13px] font-semibold text-on-surface"
            >
              Password
            </label>
            <div className="flex items-center w-full rounded-xl bg-surface-container-low px-4 focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-secondary transition-all">
              <input
                id="signup-password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
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
          <div className="flex flex-col gap-2">
            <label
              htmlFor="signup-confirm"
              className="text-[13px] font-semibold text-on-surface"
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitPassword();
              }}
              className="w-full rounded-xl bg-surface-container-low px-4 h-14 text-[16px] text-primary-container outline-none placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary transition-all"
            />
          </div>
        </div>
      )}

      {error && <p className="text-[13px] text-error font-medium">{error}</p>}

      <div className="flex flex-col gap-3 pt-2">
        <div className="flex gap-2">
          {step > 1 && step !== 4 && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep((step - 1) as Step);
              }}
              className="h-14 px-5 rounded-xl bg-surface-container-low text-primary-container text-[16px] font-semibold hover:bg-surface-container transition-colors"
            >
              Back
            </button>
          )}
          {step !== 4 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (step === 1) submitPhone();
                else if (step === 2) submitEmail();
                else submitPassword();
              }}
              className="flex-1 h-14 rounded-xl bg-secondary text-on-secondary text-[16px] font-semibold hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span>
                {busy && step === 3 && "Creating account…"}
                {!busy && step === 1 && "Continue"}
                {!busy && step === 2 && "Continue"}
                {!busy && step === 3 && "Create account"}
              </span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          )}
        </div>
        <p className="text-[13px] text-on-surface-variant text-center leading-relaxed">
          By continuing, you agree to Akwa Ibom State Transit passenger
          guidelines. Works on slow 2G and 3G networks.
        </p>
      </div>

      <div className="flex items-center justify-between pt-space-xs">
        <span className="text-[13px] text-on-surface-variant">
          Having issues?
        </span>
        <Link
          href="/#faq"
          className="text-[13px] text-secondary font-semibold hover:underline"
        >
          Contact Terminal Dispatch
        </Link>
      </div>

      <span className="hidden">{STEP_LABELS.join(",")}</span>
    </div>
  );
}
