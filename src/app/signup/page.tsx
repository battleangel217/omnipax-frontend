import type { Metadata } from "next";
import SignupPageClient from "@/components/SignupPageClient";

export const metadata: Metadata = {
  title: "Verify Ticket — TransitSight Uyo Metro",
  description:
    "Phone, email OTP, and password signup for Uyo commuters. Keeps fake pins off the map.",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
