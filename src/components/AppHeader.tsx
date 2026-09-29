import Link from "next/link";

export type AppNavKey = "corridors" | "verify" | "fleet" | "settings";

const NAV: Array<{ key: AppNavKey; label: string; href: string }> = [
  { key: "corridors", label: "Corridors", href: "/passenger" },
  { key: "verify", label: "Verify Ticket", href: "/signup" },
  { key: "fleet", label: "Fleet Radar", href: "/driver" },
  { key: "settings", label: "Settings", href: "/driver/settings" },
];

/** Single shared header for every in-app page. Logo always goes home,
 *  every section is one tap away — including Settings. */
export default function AppHeader({ active }: { active: AppNavKey }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="TransitSight home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary-fixed text-[20px]">
                alt_route
              </span>
            </div>
            <span className="text-[20px] font-semibold tracking-tight text-primary">
              TransitSight
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary-container" />
            <span className="text-[13px] text-on-surface-variant font-medium">
              Uyo Metro Network · Live
            </span>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              aria-current={l.key === active ? "page" : undefined}
              className={`px-4 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                l.key === active
                  ? "bg-primary-container text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/driver/settings" aria-label="Settings">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
