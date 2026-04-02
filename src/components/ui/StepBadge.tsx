import React from 'react';
import { cn } from '../../lib/utils';

interface StepBadgeProps {
  step: number;
  title: string;
  active?: boolean;
  completed?: boolean;
}

export const StepBadge = ({ step, title, active, completed }: StepBadgeProps) => (
  <div className={cn(
    "flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all border shadow-sm",
    active ? "bg-indigo-600 border-indigo-500 text-white shadow-indigo-100" : 
    completed ? "bg-emerald-50 border-emerald-100 text-emerald-700" : 
    "bg-white border-slate-100 text-slate-400"
  )}>
    <span className={cn(
      "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black",
      active ? "bg-white/20" : completed ? "bg-emerald-200" : "bg-slate-100"
    )}>{step}</span>
    <span className="text-sm font-bold tracking-tight">{title}</span>
  </div>
);
