export default function DemandSection() {
  return (
    <section className="w-full border-y border-line/60 bg-surface-container-low px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 md:gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Live demand
          </p>
          <h2 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px] md:leading-[1.2]">
            Know where the crowd is — by corridor.
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-on-surface-variant">
            No more “somebody is waiting somewhere.” Each corridor carries its
            own count and wait time. Crowds clear themselves as drivers arrive —
            and the map never shows individual people, only the crowd.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-error-container px-4 py-2 text-[13px] font-semibold text-on-error-container">
              <span className="h-2 w-2 rounded-full bg-error" />
              Surge demand
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-[13px] font-semibold text-on-surface">
              <span className="h-2 w-2 rounded-full bg-heat-amber" />
              Medium density
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-[13px] font-semibold text-on-surface">
              <span className="h-2 w-2 rounded-full bg-on-tertiary-container" />
              Moving normally
            </span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-[2rem] border border-line bg-surface-container-lowest p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Plaza right now
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-on-surface">
                  Ibom Plaza Axis
                </span>
                <span className="text-[15px] font-bold text-primary">
                  14 waiting
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
                <div className="h-full w-2/3 rounded-full bg-secondary" />
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className="text-[15px] font-medium text-on-surface">
                  Itam Market Hub
                </span>
                <span className="rounded-full bg-error-container px-3 py-1 text-[13px] font-bold text-on-error-container">
                  High surge
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <span className="text-[15px] font-medium text-on-surface">
                  Average wait
                </span>
                <span className="text-[15px] font-bold text-primary">
                  2–4 mins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
