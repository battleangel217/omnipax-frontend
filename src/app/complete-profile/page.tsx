import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import DriverSetupForm from "@/components/DriverSetupForm";
import DriverDemandMap from "@/components/DriverDemandMap";

export const metadata: Metadata = {
  title: "Complete Profile — TransitSight Uyo",
  description:
    "Verify your vehicle to see live demand across Uyo corridors.",
};

export default function CompleteProfilePage() {
  return (
    <div className="w-full bg-surface min-h-screen">
      <AppHeader active="fleet" />
      <main className="w-full bg-surface pt-16 md:pt-20">
        <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-12 md:px-12 md:pb-24 md:pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              For drivers · Free to start
            </p>
            <h1 className="mt-3 text-balance text-[32px] font-extrabold leading-[1.15] tracking-tight text-primary md:text-[44px] md:leading-[1.2]">
              Set up your driver profile
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-on-surface-variant">
              Verify your vehicle to see live demand across all Uyo corridors.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span>Back to welcome</span>
            </Link>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <section className="rounded-[2rem] bg-surface-container-lowest p-6 md:p-8 lg:col-span-5">
              <DriverSetupForm />
            </section>

            <div className="lg:col-span-7">
              <DriverDemandMap />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
