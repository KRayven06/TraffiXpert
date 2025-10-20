
"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from 'next/link';
import { Icons } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function AppShell({ children }: { children: React.ReactNode }) {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2" aria-label="Home">
            <Icons.logo className="w-8 h-8 text-primary" />
            <span className="text-xl font-headline font-semibold group-data-[collapsible=icon]:hidden">VerdantFlow</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userAvatar?.imageUrl} alt="Admin" data-ai-hint={userAvatar?.imageHint} />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="font-medium text-sm truncate">Admin User</span>
                <span className="text-xs text-muted-foreground truncate">admin@verdant.flow</span>
            </div>
            <Button asChild variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:ml-0">
                <Link href="/login">
                    <LogOut />
                    <span className="sr-only">Log Out</span>
                </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 lg:p-6 bg-background overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
