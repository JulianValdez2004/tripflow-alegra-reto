"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Map, Receipt } from "lucide-react";

// Rutas base según mockups dados para la prueba
const navItems = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mis Viajes", href: "/trips", icon: Map },
  { name: "Gastos", href: "/expenses", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full p-4">
      {/* Logo Area */}
      <div className="flex items-center gap-2 px-4 mb-8 mt-2">
        <Image src="/icon.svg" alt="Tripflow Icon" width={36} height={36} className="object-contain" priority />
        <span className="font-bold text-2xl text-gray-900 tracking-tight">Tripflow</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                isActive
                  ? "bg-brand text-white shadow-sm shadow-brand/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
