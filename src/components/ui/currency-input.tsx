"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string;
  onChange: (val: number) => void;
  currencySymbol?: string;
  error?: boolean;
}

export function CurrencyInput({ value, onChange, currencySymbol = "$", error, className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value === "" || isNaN(Number(value))) {
      setDisplayValue("");
      return;
    }
    // Format the number with commas
    const parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setDisplayValue(parts.join("."));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/,/g, "");
    
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(raw)) {
      return;
    }

    if (raw === "") {
      setDisplayValue("");
      // No mandamos onChange porque puede romper la validacion si espera numero, 
      // pero para limpiar permitiremos mandar 0 o dejaremos que el padre maneje.
      onChange(0);
      return;
    }

    // Actualizamos display mientras el usuario escribe para que vea la coma
    const parts = raw.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setDisplayValue(parts.join("."));
    
    onChange(Number(raw));
  };

  const handleIncrement = () => {
    const current = Number(value) || 0;
    onChange(Math.floor(current) + 1);
  };

  const handleDecrement = () => {
    const current = Number(value) || 0;
    if (current > 1) {
      onChange(Math.ceil(current) - 1);
    } else {
      onChange(0);
    }
  };

  return (
    <div 
      className={`relative flex items-center border rounded-xl focus-within:ring-2 focus-within:ring-brand/50 transition-all h-14 bg-white overflow-hidden ${
        error ? 'border-red-400 focus-within:border-red-500' : 'border-gray-200 focus-within:border-brand'
      } ${className || ''}`}
    >
      <span className="pl-4 pr-2 text-gray-500 font-medium text-lg pointer-events-none whitespace-nowrap">
        {currencySymbol}
      </span>
      <input type="hidden" name={props.name} value={value || ""} />
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        className="flex-1 w-full bg-transparent py-3 pr-12 outline-none text-gray-700 text-lg font-medium"
        {...{...props, name: undefined, className: undefined}}
      />
      <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center w-10 border-l border-gray-100 bg-gray-50/50">
        <button
          type="button"
          onClick={handleIncrement}
          className="flex-1 w-full flex items-end pb-0.5 justify-center text-gray-400 hover:text-brand hover:bg-gray-100 transition-colors"
          tabIndex={-1}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          className="flex-1 w-full flex items-start pt-0.5 justify-center text-gray-400 hover:text-brand hover:bg-gray-100 transition-colors"
          tabIndex={-1}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
