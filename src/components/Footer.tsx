import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 md:px-12">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container">
              <span className="material-symbols-outlined text-[20px] text-primary-fixed">
                alt_route
              </span>
            </div>
            <span className="text-xl font-bold text-primary">TransitSight</span>
          </Link>
          <p className="max-w-sm text-[15px] leading-relaxed text-on-surface-variant">
            One clean record for Uyo corridors. Pins, queues, and regulated
            fares without changing how you move.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm lg:grid-cols-3">
          <div>
            <p className="font-bold text-primary">Product</p>
            <ul className="mt-3 space-y-2.5 text-on-surface-variant">
              {[
                { label: "How it works", href: "/#how" },
                { label: "Live map", href: "/#demo" },
                { label: "Drivers", href: "/#drivers" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-on-surface"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-primary">Get started</p>
            <ul className="mt-3 space-y-2.5 text-on-surface-variant">
              <li>
                <Link
                  href="/signup"
                  className="transition-colors hover:text-on-surface"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  href="/complete-profile"
                  className="transition-colors hover:text-on-surface"
                >
                  Drive with us
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="transition-colors hover:text-on-surface"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-on-surface"
                >
                  Operations console
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-primary">Corridors</p>
            <ul className="mt-3 space-y-2.5 text-on-surface-variant">
              {[
                { label: "Ibom Plaza", href: "/passenger" },
                { label: "Oron Road", href: "/passenger" },
                { label: "Itam Market", href: "/passenger" },
              ].map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className="transition-colors hover:text-on-surface"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-6 py-6 text-[13px] text-on-surface-variant md:flex-row md:px-12">
          <span>© 2026 TransitSight · Uyo Municipal Network</span>
          <span>Pin-first · Crowd-only · Regulated fares</span>
        </div>
      </div>
    </footer>
  );
}
