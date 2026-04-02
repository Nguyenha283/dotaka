import React from 'react';
import { cn } from '../../lib/utils';

interface StepIndicatorProps {
  step: string;
  theme?: 'light' | 'dark';
}

export const StepIndicator = ({ step, theme }: StepIndicatorProps) => (
  <div className={cn(
    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
    theme === 'dark' 
      ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 border border-indigo-500/30" 
      : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200"
  )}>
    {step}
  </div>
);
