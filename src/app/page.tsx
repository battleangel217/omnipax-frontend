import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LiveDemo from "@/components/LiveDemo";
import HowItWorks from "@/components/HowItWorks";
import DemandSection from "@/components/DemandSection";
import DriverCTA from "@/components/DriverCTA";
import Assurances from "@/components/Assurances";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="w-full bg-surface min-h-screen">
      <Header />
      <main className="w-full pt-16 md:pt-20 bg-surface">
        <Hero />
        <LiveDemo />
        <HowItWorks />
        <DemandSection />
        <DriverCTA />
        <Assurances />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
