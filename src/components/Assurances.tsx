"use client";

import { useState } from "react";

const NEVERS = [
  {
    title: "No app install",
    body: "The whole job runs in your browser. Opera Mini and low-end phones included.",
  },
  {
    title: "No personal tracking",
    body: "The map shows crowds, never individuals. No avatars, no phone numbers on display.",
  },
  {
    title: "No price games",
    body: "Fares follow the state scale. What you see at the pin is what you pay.",
  },
];

const FAQS = [
  {
    q: "Does it cost anything?",
    a: "Starting is free for commuters and drivers. Verification codes arrive by email — no airtime needed.",
  },
  {
    q: "Do I need to install an app?",
    a: "No. TransitSight is a lightweight web page that works on 2G/3G and low-end phones without installation.",
  },
  {
    q: "Will drivers see my phone number?",
    a: "Never. Operators see aggregate demand per corridor. Your number stays private.",
  },
  {
    q: "Are fares really fixed?",
    a: "Yes. Every corridor shows the Akwa Ibom State regulated span, for example ₦150 – ₦200 on Oron Road.",
  },
];

export default function Assurances() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section className="w-full px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            What TransitSight is not
          </p>
          <h2 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px]">
            Three things we will never make you do.
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {NEVERS.map((n) => (
            <div
              key={n.title}
              className="rounded-[2rem] border border-line bg-surface-container-lowest p-8"
            >
              <h3 className="text-[19px] font-bold text-primary">{n.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-on-surface-variant">
                {n.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="w-full scroll-mt-24 px-6 pb-16 md:px-12 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              Questions
            </p>
            <h2 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px]">
              You might be wondering…
            </h2>
          </div>
          <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface-container-lowest px-5 md:px-8">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 rounded-none px-0 py-5 text-left text-base font-semibold text-primary"
                  >
                    <span>{f.q}</span>
                    <span
                      className={`shrink-0 rounded-full border border-line px-2.5 py-1 text-sm transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-[15px] leading-relaxed text-on-surface-variant">
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
