"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignupFlow from "@/components/SignupFlow";

type Step = 1 | 2 | 3 | 4;

const STEPS = ["Phone check", "Email", "Password", "Verification code"];

const TITLES: Record<Step, string> = {
  1: "What's your phone number?",
  2: "What's your email address?",
  3: "Create your password",
  4: "Enter the 6-digit code",
};

const SUBS: Record<Step, string> = {
  1: "We send one code to confirm it is you. This keeps fake pins off the map.",
  2: "Your account is created on the next step.",
  3: "Secure your account. Then verify the code we email you.",
  4: "Type the code below. It expires after 5 minutes.",
};

function Stepper({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <span key={label} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[13px] text-outline-variant">→</span>
            )}
            <span
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] ${
                done
                  ? "bg-surface-container font-medium text-on-tertiary-container"
                  : active
                    ? "bg-primary-container font-semibold text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {done ? (
                <span className="material-symbols-outlined text-[16px]">
                  check_circle
                </span>
              ) : active ? (
                <span className="h-2 w-2 rounded-full bg-secondary-container" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-outline-variant" />
              )}
              {n}. {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function SignupPageInner() {
  const searchParams = useSearchParams();
  const verifyEmail = searchParams.get("verify") ?? "";
  const [step, setStep] = useState<Step>(verifyEmail ? 4 : 1);
  const [phone, setPhone] = useState("803 492 8190");
  const [email, setEmail] = useState(verifyEmail);
  const [resendIn, setResendIn] = useState(0);
  const [mock, setMock] = useState(false);

  return (
    <div className="w-full bg-surface min-h-screen">
      <Header />
      <main className="w-full bg-surface pt-16 md:pt-20">
        <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-12 md:px-12 md:pb-24 md:pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              Free to start · Step {step} of 4
            </p>
            <h1 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px] md:leading-[1.2]">
              {TITLES[step]}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-on-surface-variant">
              {step === 4 && email ? (
                <>
                  Sent to <strong className="font-semibold text-on-surface">{email}</strong>{" "}
                  ·{" "}
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="font-medium text-secondary hover:underline"
                  >
                    Change email
                  </button>
                  <br />
                </>
              ) : null}
              {SUBS[step]}
            </p>
          </div>

          <div className="mt-8">
            <Stepper step={step} />
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SignupFlow
                step={step}
                setStep={setStep}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                resendIn={resendIn}
                setResendIn={setResendIn}
                mock={mock}
                setMock={setMock}
              />
            </div>

            <div className="flex flex-col gap-6 lg:col-span-6">
              {step === 4 ? (
                <>
                  <div className="rounded-[2rem] bg-surface-container-lowest p-6 md:p-8">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container">
                        <span className="material-symbols-outlined text-[22px] text-secondary">
                          mail
                        </span>
                      </div>
                      <div>
                        <p className="text-[16px] font-semibold text-primary">
                          Email verification active
                        </p>
                        <p className="mt-1 text-[14px] leading-relaxed text-on-surface-variant">
                          Real riders pin real locations along Uyo corridors.
                          Codes expire after 5 minutes.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl bg-surface-container-low p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-on-surface-variant">
                          <span className="material-symbols-outlined text-[18px]">
                            schedule
                          </span>
                          {resendIn > 0
                            ? `Resend code in 0:${resendIn < 10 ? "0" : ""}${resendIn}`
                            : "Code expired"}
                        </span>
                        <button
                          type="button"
                          disabled={resendIn > 0}
                          onClick={() => {
                            setResendIn(40);
                            if (!mock && email) {
                              import("@/lib/api").then(({ api }) =>
                                api.otpRequest(email).catch(() => {})
                              );
                            }
                          }}
                          className={`text-[13px] font-semibold ${
                            resendIn > 0
                              ? "cursor-not-allowed text-outline"
                              : "cursor-pointer text-secondary hover:underline"
                          }`}
                        >
                          Resend code
                        </button>
                      </div>
                      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                        <div
                          className="h-full bg-secondary transition-all duration-1000"
                          style={{
                            width: `${Math.max(0, (resendIn / 40) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      {
                        icon: "network_cell",
                        title: "Works on 2G/3G",
                        body: "Optimized for low-bandwidth base stations.",
                      },
                      {
                        icon: "toll",
                        title: "Zero airtime toll",
                        body: "Toll-free verification protocol.",
                      },
                      {
                        icon: "verified_user",
                        title: "Anti-spoof",
                        body: "Keeps ride queues legitimate.",
                      },
                    ].map((c) => (
                      <div
                        key={c.title}
                        className="rounded-[2rem] border border-line bg-surface-container-lowest p-6"
                      >
                        <span className="material-symbols-outlined text-[22px] text-secondary">
                          {c.icon}
                        </span>
                        <p className="mt-3 text-[14px] font-semibold text-primary">
                          {c.title}
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-on-surface-variant">
                          {c.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
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

                  <div className="flex items-center gap-3 rounded-[2rem] bg-surface-container-low p-6">
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      lock
                    </span>
                    <p className="text-[14px] leading-relaxed text-on-surface-variant">
                      We never show your phone number to operators or other
                      commuters.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="mt-10 text-center text-[14px] text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-secondary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SignupPageClient() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
}
