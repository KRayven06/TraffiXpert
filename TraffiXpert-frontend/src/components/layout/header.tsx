"use client";

import { SidebarNav } from "@/components/layout/sidebar-nav"; // Need this
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/analytics')) return 'Analytics & Performance';
    if (pathname.startsWith('/violations')) return 'Violations & Incidents';
    if (pathname.startsWith('/emergency')) return 'Emergency Management';
    if (pathname.startsWith('/how-it-works')) return 'How It Works';
    if (pathname === '/') return 'Live Dashboard';
    return 'TraffiXpert';
}

export function Header() {
    const pathname = usePathname();
    const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex items-center gap-2 md:hidden">
        {/* Mobile Nav Trigger */}
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
                <div className="py-4 px-4 font-headline font-semibold text-lg border-b">TraffiXpert</div>
                <SidebarNav />
            </SheetContent>
        </Sheet>
      </div>
      <h1 className="text-lg font-semibold font-headline md:text-xl truncate">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
