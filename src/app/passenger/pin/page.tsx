import type { Metadata } from "next";
import PinTrackClient from "@/components/PinTrackClient";

export const metadata: Metadata = {
  title: "Active Pin — TransitSight Uyo",
  description:
    "Track your gold priority beacon, responding drivers, and pin countdown.",
};

import RequireAuth from "@/components/RequireAuth";

export default function PinPage() {
  return (
    <RequireAuth>
      <PinTrackClient />
    </RequireAuth>
  );
}
