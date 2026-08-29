"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string;
  onDateChange: (date: DateRange | undefined) => void;
  date: DateRange | undefined;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger
          id="date"
          className={cn(
            "inline-flex items-center whitespace-nowrap text-sm border hover:bg-accent hover:text-accent-foreground h-10 w-full justify-start text-left font-normal py-6 px-4 rounded-xl border-gray-200 focus:ring-2 focus:ring-brand/50 focus:border-brand",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                {format(date.to, "LLL dd, y", { locale: es })}
              </>
            ) : (
              format(date.from, "LLL dd, y", { locale: es })
            )
          ) : (
            <span>Selecciona tu fecha de viaje</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
