import { Utensils, Bus, Bed, Ticket, Plane, MoreHorizontal } from "lucide-react";

export function CategoryIcon({ category, className = "w-5 h-5 text-brand" }: { category: string, className?: string }) {
  switch (category) {
    case 'Alimentación': return <Utensils className={className} />;
    case 'Transporte': return <Bus className={className} />;
    case 'Alojamiento': return <Bed className={className} />;
    case 'Entretenimiento': return <Ticket className={className} />;
    case 'Vuelos': return <Plane className={className} />;
    default: return <MoreHorizontal className={className} />;
  }
}
