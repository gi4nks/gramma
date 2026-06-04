"use client";

import { type SelectHTMLAttributes } from "react";

const UNITS = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "cl", label: "cl" },
  { value: "dl", label: "dl" },
  { value: "l", label: "l" },
  { value: "pz", label: "pz (pezzi)" },
  { value: "cucchiaio", label: "cucchiaio" },
  { value: "cucchiai", label: "cucchiai" },
  { value: "cucchiaino", label: "cucchiaino" },
  { value: "cucchiaini", label: "cucchiaini" },
  { value: "fetta", label: "fetta/e" },
  { value: "foglia", label: "foglia/e" },
  { value: "spicchio", label: "spicchio/i" },
  { value: "bicchiere", label: "bicchiere/i" },
  { value: "pizzico", label: "pizzico" },
  { value: "bustina", label: "bustina/e" },
  { value: "mazzetto", label: "mazzetto/i" },
  { value: "panetto", label: "panetto/i" },
  { value: "q.b.", label: "q.b." },
];

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  allowCustom?: boolean;
}

export function UnitSelect({ allowCustom, className = "", ...props }: Props) {
  return (
    <select {...props} className={`select select-bordered rounded-lg h-9 text-sm ${className}`}>
      <option value="" disabled>Unità</option>
      {UNITS.map((u) => (
        <option key={u.value} value={u.value}>{u.label}</option>
      ))}
    </select>
  );
}

export { UNITS };
