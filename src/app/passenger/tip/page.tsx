import type { Metadata } from "next";
import TipPageClient from "@/components/TipPageClient";

export const metadata: Metadata = {
  title: "Priority Tip — TransitSight Uyo",
  description:
    "Boost your pickup pin visibility with an optional priority tip for drivers.",
};

import RequireAuth from "@/components/RequireAuth";

export default function TipPage() {
  return (
    <RequireAuth>
      <TipPageClient />
    </RequireAuth>
  );
}
