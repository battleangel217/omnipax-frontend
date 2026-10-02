import Link from "next/link";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Live map", href: "/#demo" },
  { label: "Drivers", href: "/#drivers" },
  { label: "FAQ", href: "/#faq" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-line/60">
      <div className="h-16 md:h-20 max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-fixed text-[20px]">
              alt_route
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">
            TransitSight
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[15px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex h-12 items-center px-5 text-[15px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 max-sm:h-10 max-sm:px-4 items-center px-6 bg-primary-container hover:bg-primary text-on-primary text-[15px] max-sm:text-sm font-semibold rounded-xl transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
