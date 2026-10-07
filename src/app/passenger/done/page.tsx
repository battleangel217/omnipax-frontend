import type { Metadata } from "next";
import DoneClient from "@/components/DoneClient";

export const metadata: Metadata = {
  title: "Ride Completed — TransitSight Uyo",
  description:
    "Your pin is cleared. Receipt, corridor recap, and map feedback.",
};

import RequireAuth from "@/components/RequireAuth";

export default function DonePage() {
  return (
    <RequireAuth>
      <DoneClient />
    </RequireAuth>
  );
}
