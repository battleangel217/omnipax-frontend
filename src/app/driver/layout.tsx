import RequireAuth from "@/components/RequireAuth";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth roles={["driver"]}>{children}</RequireAuth>;
}
