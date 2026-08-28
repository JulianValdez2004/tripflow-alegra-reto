"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Map, Receipt } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mis Viajes", href: "/trips", icon: Map },
  { name: "Mis Gastos", href: "/expenses", icon: Receipt },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-brand text-white shadow-md shadow-brand/30 scale-105" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium leading-none">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
