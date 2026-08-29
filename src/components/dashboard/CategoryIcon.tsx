import { Utensils, Bus, Bed, Ticket, Plane, MoreHorizontal } from "lucide-react";

export function CategoryIcon({ category, className = "w-5 h-5" }: { category: string, className?: string }) {
  let Icon = MoreHorizontal;
  let colorClass = "text-gray-500 bg-gray-100";

  switch (category) {
    case 'Alimentación':
    case 'Comida':
      Icon = Utensils;
      colorClass = "text-orange-500 bg-orange-100";
      break;
    case 'Transporte':
      Icon = Bus;
      colorClass = "text-blue-500 bg-blue-100";
      break;
    case 'Alojamiento':
      Icon = Bed;
      colorClass = "text-purple-500 bg-purple-100";
      break;
    case 'Entretenimiento':
      Icon = Ticket;
      colorClass = "text-pink-500 bg-pink-100";
      break;
    case 'Vuelos':
      Icon = Plane;
      colorClass = "text-cyan-500 bg-cyan-100";
      break;
    default:
      Icon = MoreHorizontal;
      colorClass = "text-gray-500 bg-gray-100";
      break;
  }

  return (
    <div className={`p-2 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon className={className} />
    </div>
  );
}
