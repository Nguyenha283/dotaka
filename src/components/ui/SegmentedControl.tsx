import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SegmentedControlProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const SegmentedControl = ({ options, value, onChange, className }: SegmentedControlProps) => (
  <div className={cn("flex p-1.5 bg-slate-100 rounded-[20px] relative overflow-hidden shadow-inner", className)}>
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={cn(
          "relative flex-1 flex items-center justify-center gap-2.5 py-3 text-sm font-bold transition-all z-10",
          value === opt.value ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
        )}
      >
        {opt.icon && <span className={cn("transition-colors", value === opt.value ? "text-indigo-600" : "text-slate-400")}>{opt.icon}</span>}
        {opt.label}
        {value === opt.value && (
          <motion.div
            layoutId="segment-active"
            className="absolute inset-0 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>
    ))}
  </div>
);
