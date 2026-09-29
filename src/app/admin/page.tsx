import type { Metadata } from "next";
import AdminClient from "@/components/AdminClient";

export const metadata: Metadata = {
  title: "Geofence Manager — TransitSight Uyo",
  description:
    "Admin console for transit geofencing and corridor regulation in Uyo Metro Zone.",
};

export default function AdminPage() {
  return <AdminClient />;
}
