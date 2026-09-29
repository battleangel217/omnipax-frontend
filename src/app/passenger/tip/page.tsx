import type { Metadata } from "next";
import TipPageClient from "@/components/TipPageClient";

export const metadata: Metadata = {
  title: "Priority Tip — TransitSight Uyo",
  description:
    "Boost your pickup pin visibility with an optional priority tip for drivers.",
};

export default function TipPage() {
  return <TipPageClient />;
}
