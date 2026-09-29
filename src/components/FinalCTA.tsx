import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="w-full px-6 pb-16 md:px-12 md:pb-24">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-primary-container px-6 py-14 text-center text-on-primary md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-secondary-container/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -right-24 h-[30rem] w-[30rem] rounded-full bg-surface-container-lowest/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim">
            Free to start
          </p>
          <h2 className="mt-3 text-balance text-[34px] font-extrabold leading-[1.15] tracking-tight md:text-[56px]">
            Bring your commute into writing.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-on-primary-container">
            Join the commuters and drivers turning busy days into clean trips —
            pins, queues, and fares in one place.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center gap-2 rounded-xl bg-surface-container-lowest px-8 text-[16px] font-semibold text-primary transition-all hover:-translate-y-0.5"
            >
              <span>Get started free</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
          <p className="mt-6 text-xs text-on-primary-container/70">
            Uyo Municipal Network · Ministry of Transport
          </p>
        </div>
      </div>
    </section>
  );
}
