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
              Corridors covered
            </p>
            <div className="mt-5 space-y-1">
              {[
                { name: "Oron Road", fare: "₦150 – ₦250" },
                { name: "Ikot Ekpene Road", fare: "Regulated" },
                { name: "Itam Market Hub", fare: "Regulated" },
                { name: "Aka Road", fare: "Regulated" },
                { name: "Abak Road", fare: "Regulated" },
              ].map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between border-t border-line py-3 first:border-t-0 first:pt-0"
                >
                  <span className="text-[15px] font-medium text-on-surface">
                    {c.name}
                  </span>
                  <span className="rounded-full bg-surface-container px-3 py-1 text-[13px] font-semibold text-on-surface-variant">
                    {c.fare}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-on-surface-variant">
              Every corridor runs on the state fare scale. What you see at
              the pin is what you pay.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
