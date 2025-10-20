"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BarChart3,
  ShieldAlert,
  Siren,
  Cpu,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/violations", label: "Violations", icon: ShieldAlert },
  { href: "/emergency", label: "Emergency", icon: Siren },
  { href: "/how-it-works", label: "How It Works", icon: Cpu },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === link.href}
              tooltip={{children: link.label, side: "right", align: "center"}}
            >
              <span>
                <link.icon />
                <span>{link.label}</span>
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
