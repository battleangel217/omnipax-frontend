import type { Metadata } from "next";
import SettingsClient from "@/components/SettingsClient";

export const metadata: Metadata = {
  title: "Settings — TransitSight Uyo",
  description:
    "Driver transit controls, display preferences, and support.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
