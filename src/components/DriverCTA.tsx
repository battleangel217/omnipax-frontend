import Link from "next/link";

export default function DriverCTA() {
  return (
    <section id="drivers" className="w-full scroll-mt-24 px-6 py-16 md:px-12 md:py-24">
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 overflow-hidden rounded-[2rem] bg-primary-container px-6 py-14 text-on-primary md:gap-12 md:px-12 md:py-24 lg:grid-cols-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary-container/20 blur-3xl"
        />
        <div className="relative lg:col-span-7">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim">
            For drivers
          </p>
          <h2 className="mt-3 text-balance text-[34px] font-extrabold leading-[1.15] tracking-tight md:text-[56px]">
            Drive empty miles never again.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-on-primary-container">
            Join the operators turning slow days into full loads — verified
            corridors, live queues, and regulated fares in one place.
          </p>
          <div className="mt-8">
            <Link
              href="/complete-profile"
              className="inline-flex h-14 items-center gap-2 rounded-xl bg-surface-container-lowest px-8 text-[16px] font-semibold text-primary transition-all hover:-translate-y-0.5"
            >
              <span>Start driving free</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
          <p className="mt-6 text-xs text-on-primary-container/70">
            Verified by Ministry of Transport · Uyo Metropolitan Area
          </p>
        </div>
        <div className="relative lg:col-span-5">
          <div className="rounded-[2rem] bg-primary p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container">
              Tonight&apos;s close · Oron corridor
            </p>
            <p className="mt-3 text-[40px] font-extrabold tracking-tight">
              ₦48,200
            </p>
            <p className="mt-1 text-[14px] text-on-primary-container">
              14 trips · 9 queues cleared · best hour 12pm
            </p>
            <div className="mt-6 space-y-3 border-t border-on-primary/10 pt-6 text-[14px]">
              <div className="flex justify-between">
                <span className="text-on-primary-container">Queue pickups</span>
                <strong>11</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-primary-container">Empty miles</span>
                <strong>−62%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
