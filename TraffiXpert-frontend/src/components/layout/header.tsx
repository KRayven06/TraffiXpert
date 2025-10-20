"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/analytics')) return 'Analytics & Performance';
    if (pathname.startsWith('/violations')) return 'Violations & Incidents';
    if (pathname.startsWith('/emergency')) return 'Emergency Management';
    if (pathname.startsWith('/how-it-works')) return 'How It Works';
    if (pathname === '/') return 'Live Dashboard';
    return 'VerdantFlow';
}

export function Header() {
    const pathname = usePathname();
    const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold font-headline md:text-xl">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
