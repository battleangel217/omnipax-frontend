import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full px-6 pt-32 pb-16 md:px-12 md:pb-24 md:pt-36">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          Free to start · Uyo Metro Network
        </p>
        <h1 className="mt-4 text-balance text-[38px] font-extrabold leading-[1.12] tracking-tight text-primary md:text-[64px] md:leading-[1.15]">
          Get a ride. <span className="text-secondary">Or find one.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-[20px]">
          Pin where you wait in Uyo. Drivers see live demand and meet the
          queue — no app install, no haggling.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-14 items-center gap-2 rounded-xl bg-secondary-container px-8 text-[16px] font-semibold text-on-secondary transition-all hover:-translate-y-0.5 hover:bg-secondary"
          >
            <span>Continue as passenger</span>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </Link>
          <Link
            href="/driver"
            className="inline-flex h-14 items-center rounded-xl border border-line bg-surface-container-lowest px-8 text-[16px] font-semibold text-primary transition-all hover:-translate-y-0.5"
          >
            Enter driver portal
          </Link>
        </div>
        <p className="mt-6 text-[13px] text-on-surface-variant">
          Email OTP login · Regulated fares · Works on 2G/3G
        </p>
      </div>
    </section>
  );
}
