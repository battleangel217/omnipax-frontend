"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-secondary">
        Telemetry hiccup
      </p>
      <h1 className="mt-3 text-[32px] font-extrabold tracking-tight text-primary">
        Something stalled
      </h1>
      <p className="mt-2 max-w-sm text-[15px] text-on-surface-variant">
        The corridor feed hit a bump. Try again — your progress is safe.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex h-12 items-center rounded-xl bg-primary-container px-6 text-[15px] font-semibold text-on-primary"
      >
        Retry
      </button>
    </div>
  );
}
