import type { Metadata } from "next";
import LoginClient from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Log in — TransitSight Uyo",
  description: "Log in with your phone number and password.",
};

export default function LoginPage() {
  return <LoginClient />;
}
