const STEPS = [
  {
    n: "1",
    icon: "person_pin_circle",
    title: "Pin your waiting spot",
    body: "Stand anywhere and drop a pin. 30 seconds, no app.",
    visualTitle: "Ibom Plaza Hub",
    visualBody: "14 waiting · ~3 min",
    dark: true,
  },
  {
    n: "2",
    icon: "groups",
    title: "Drivers see the crowd",
    body: "Drivers see your pin on one live map.",
    visualTitle: "18 Keke nearby",
    visualBody: "Itam Hub · High surge",
    dark: false,
  },
  {
    n: "3",
    icon: "payments",
    title: "Meet and go",
    body: "Fixed fares. No haggling.",
    visualTitle: "₦150 – ₦200",
    visualBody: "2–4 min average wait",
    dark: false,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="w-full scroll-mt-24 px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          How it works
        </p>
        <h2 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px] md:leading-[1.2]">
          Three small habits. One complete trip.
        </h2>
        <p className="mt-3 text-[16px] text-on-surface-variant">
          Three steps. Two minutes.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1400px] gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className={`flex flex-col rounded-[2rem] p-8 ${
              s.dark
                ? "bg-primary-container text-on-primary"
                : "border border-line bg-surface-container-lowest"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[13px] font-bold uppercase tracking-widest ${
                  s.dark ? "text-on-primary-container" : "text-secondary"
                }`}
              >
                Step {s.n}
              </span>
              <span className="material-symbols-outlined text-[24px] opacity-70">
                {s.icon}
              </span>
            </div>
            <h3
              className={`mt-6 text-[22px] font-bold tracking-tight ${
                s.dark ? "text-on-primary" : "text-primary"
              }`}
            >
              {s.title}
            </h3>
            <p
              className={`mt-2 text-[15px] leading-relaxed ${
                s.dark ? "text-on-primary-container" : "text-on-surface-variant"
              }`}
            >
              {s.body}
            </p>
            <div
              className={`mt-auto pt-8 text-center ${
                s.dark ? "text-on-primary" : "text-primary"
              }`}
            >
              <p className="text-[20px] font-extrabold tracking-tight">
                {s.visualTitle}
              </p>
              <p
                className={`mt-1 text-[13px] ${
                  s.dark ? "text-on-primary-container" : "text-on-surface-variant"
                }`}
              >
                {s.visualBody}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
