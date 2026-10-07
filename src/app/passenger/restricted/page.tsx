import type { Metadata } from "next";
import RestrictedClient from "@/components/RestrictedClient";

export const metadata: Metadata = {
  title: "Closed Road — TransitSight Uyo",
  description:
    "Aka Road is closed to transit. Move your pin to the nearest open corridor.",
};

import RequireAuth from "@/components/RequireAuth";

export default function RestrictedPage() {
  return (
    <RequireAuth>
      <RestrictedClient />
    </RequireAuth>
  );
}
