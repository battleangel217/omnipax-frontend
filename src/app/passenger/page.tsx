import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import PassengerExperience from "@/components/PassengerExperience";

export const metadata: Metadata = {
  title: "Corridors — TransitSight Uyo",
  description:
    "Set your destination and request a transit pin across Uyo corridors.",
};

export default function PassengerPage() {
  return (
    <div className="bg-background font-sans text-on-surface antialiased min-h-screen flex flex-col">
      <AppHeader active="corridors" />
      <main className="w-full pt-16 flex-1 flex flex-col bg-background">
        <div className="flex flex-col w-full">
          <section className="relative flex w-full flex-col overflow-hidden bg-surface lg:h-[calc(100vh-4rem)] lg:flex-row">
            <PassengerExperience />
          </section>
        </div>
      </main>
      <footer className="w-full bg-surface-container-lowest py-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] mt-auto">
        <div className="w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[13px] text-on-surface-variant">
            © 2024 TransitSight Uyo. Metropolitan Transport Telemetry.
          </span>
          <span className="text-[13px] text-on-surface-variant">
            Ibom Plaza · Itam Market · Tropicana Corridors
          </span>
        </div>
      </footer>
    </div>
  );
}
