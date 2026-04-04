"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  GraduationCap,
  Send,
  DollarSign,
  Users,
  Settings,
  Menu,
  X,
  FolderOpen,
  BarChart3,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { SidelineWordmark } from "@/components/sideline-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navGroups = [
  {
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Clinics", href: "/clinics", icon: Building2 },
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Courses", href: "/courses", icon: GraduationCap },
      { name: "Materials", href: "/materials", icon: FolderOpen },
    ],
  },
  {
    items: [
      { name: "Outreach", href: "/outreach", icon: Send },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "CEU Compliance", href: "/ceu-compliance", icon: ShieldCheck },
      { name: "Finances", href: "/finances", icon: DollarSign },
      { name: "Instructors", href: "/instructors", icon: Users },
      { name: "Roster Import", href: "/roster-import", icon: Upload },
    ],
  },
  {
    items: [{ name: "Settings", href: "/settings", icon: Settings }],
  },
];

function NavContent({ pathname, onItemClick }: { pathname: string; onItemClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <SidelineWordmark />
      </div>
      <Separator className="bg-[rgba(215,211,205,0.07)]" />
      <nav className="flex-1 p-3 space-y-1">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <Separator className="bg-[rgba(215,211,205,0.07)] my-2" />}
            {group.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-[#8FBDA3]/10 text-[#8FBDA3]"
                      : "text-[#B9B6AF] hover:text-[#D7D3CD] hover:bg-[#2C2828]"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-[rgba(215,211,205,0.07)]">
        <p className="text-[9px] tracking-[0.16em] uppercase text-[rgba(215,211,205,0.25)]">
          Sideline · 2026
        </p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#231F20]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:fixed lg:inset-y-0 bg-[#1B1919] border-r border-[rgba(215,211,205,0.07)]">
        <NavContent pathname={pathname} />
      </aside>

      {/* Mobile Header + Sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#1B1919] border-b border-[rgba(215,211,205,0.07)] flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-[#D7D3CD] hover:bg-[#2C2828] transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-[#1B1919] border-r-[rgba(215,211,205,0.07)]">
            <NavContent pathname={pathname} onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="ml-3">
          <SidelineWordmark />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pl-[260px] pt-14 lg:pt-0 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
