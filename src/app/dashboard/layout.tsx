import { AppShell } from "@/components/shell/app-shell";
import { verifySession } from "@/lib/dal";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession("dashboard:view");
  return <AppShell session={session}>{children}</AppShell>;
}
