import RequireAuth from "@/components/RequireAuth";

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
