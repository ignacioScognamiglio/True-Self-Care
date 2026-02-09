"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { sidebarNavigation } from "@/lib/constants";

function getPageTitle(pathname: string): string {
  for (const group of sidebarNavigation) {
    for (const item of group.items) {
      if (
        pathname === item.url ||
        (item.url !== "/dashboard" && pathname.startsWith(item.url))
      ) {
        return item.title;
      }
    }
  }

  if (pathname.includes("/settings")) return "Settings";
  return "Dashboard";
}

export function DashboardHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <ModeToggle />
      </div>
    </header>
  );
}
