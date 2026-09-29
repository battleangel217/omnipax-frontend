import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-secondary">
        Off the corridor map
      </p>
      <h1 className="mt-3 text-[44px] font-extrabold tracking-tight text-primary">
        404
      </h1>
      <p className="mt-2 max-w-sm text-[15px] text-on-surface-variant">
        This stop doesn&apos;t exist. Let&apos;s get you back to a live
        corridor.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-xl bg-primary-container px-6 text-[15px] font-semibold text-on-primary"
      >
        Back to welcome
      </Link>
    </div>
  );
}
