const QUOTES = [
  {
    quote:
      "Before, I dey guess where crowd dey. Now I close the day and I know. Plaza or Itam, e dey inside one map.",
    name: "Effiong",
    meta: "Keke operator · Oron Road",
  },
  {
    quote:
      "Drivers wey say ‘I dey come’ — I fit see them for map. No more story at the junction.",
    name: "Blessing",
    meta: "Commuter · Itam Market",
  },
  {
    quote:
      "I ask where queue long pass today and e answer me. My weekly pattern show me Friday na my day.",
    name: "Ibrahim",
    meta: "Minibus driver · Ikot Ekpene Road",
  },
];

export default function Stories() {
  return (
    <section className="w-full border-y border-line/60 bg-surface-container-low px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Three corridors, one city
          </p>
          <h2 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px] md:leading-[1.2]">
            Real days, real records.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="flex flex-col rounded-[2rem] bg-primary-container p-8 text-on-primary"
            >
              <blockquote className="text-[17px] font-semibold leading-relaxed">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold">
                {q.name}{" "}
                <span className="font-normal text-on-primary-container">
                  · {q.meta}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
