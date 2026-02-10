import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SkipNav } from "@/components/a11y/skip-nav";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SkipNav />
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <InstallPrompt />
    </SidebarProvider>
  );
}
