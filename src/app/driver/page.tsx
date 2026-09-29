import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import DriverDashboard from "@/components/DriverDashboard";

export const metadata: Metadata = {
  title: "Driver Dashboard — TransitSight Uyo",
  description:
    "Live passenger heatmap, surge alerts, and corridor telemetry for Uyo operators.",
};

export default function DriverPage() {
  return (
    <div className="bg-surface font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <AppHeader active="fleet" />
      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        <DriverDashboard />
        <footer className="w-full bg-surface-container-low mt-auto">
          <div className="w-full px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-on-surface">
                  TransitSight Uyo Operations
                </span>
                <span className="text-[13px] text-on-surface-variant">
                  · Ministry of Transport Akwa Ibom State
                </span>
              </div>
              <p className="text-[13px] text-on-surface-variant text-center md:text-left">
                © 2024 Akwa Ibom State Government. All regulatory telemetry
                and fare schedules enforced.
              </p>
            </div>
            <div className="flex items-center flex-wrap justify-center gap-4">
              {[
                { label: "Transit Bylaws", href: "/#faq" },
                { label: "Operator Standards", href: "/complete-profile" },
                { label: "Civic Compliance", href: "/#faq" },
                { label: "Emergency Dispatch", href: "/driver/settings" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[13px] text-on-surface-variant hover:text-on-surface"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
