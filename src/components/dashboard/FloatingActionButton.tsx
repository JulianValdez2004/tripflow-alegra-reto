"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Receipt, Map } from "lucide-react";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end">
      
      {/* Opciones desplegables */}
      <div 
        className={`flex flex-col items-end gap-3 mb-4 transition-all duration-300 origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-12 pointer-events-none"
        }`}
      >
        <Link 
          href="/trips/new"
          className="flex items-center gap-3 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-xl border border-gray-100 hover:scale-105 transition-all group"
          onClick={() => setIsOpen(false)}
        >
          <span className="text-sm font-bold text-gray-700 group-hover:text-brand transition-colors">Nuevo Viaje</span>
          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center shadow-inner">
            <Map className="w-5 h-5" />
          </div>
        </Link>
        
        <Link 
          href="/expenses/new"
          className="flex items-center gap-3 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-xl border border-gray-100 hover:scale-105 transition-all group"
          onClick={() => setIsOpen(false)}
        >
          <span className="text-sm font-bold text-gray-700 group-hover:text-brand transition-colors">Nuevo Gasto</span>
          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center shadow-inner">
            <Receipt className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Botón Principal */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-brand hover:bg-brand-hover shadow-[0_8px_30px_rgb(255,52,130,0.5)] flex items-center justify-center transition-all duration-300 relative z-10 ${
          isOpen ? "rotate-45 scale-105" : "hover:scale-110"
        }`}
      >
        <Plus className="w-7 h-7 text-white transition-transform" />
      </button>
    </div>
  );
}
