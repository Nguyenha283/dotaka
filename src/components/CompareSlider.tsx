import React from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft } from 'lucide-react';
import { GenerationResult } from '../types';
import { getAspectRatioClass, cn } from '../lib/utils';

interface CompareSliderProps {
  activeResult: GenerationResult;
  compareSlider: number;
  setCompareSlider: (val: number) => void;
  compareZoomLevel: number;
  setCompareZoomLevel: (val: number | ((prev: number) => number)) => void;
  compareConstraintsRef: React.RefObject<HTMLDivElement | null>;
}

export const CompareSlider = ({
  activeResult,
  compareSlider,
  setCompareSlider,
  compareZoomLevel,
  setCompareZoomLevel,
  compareConstraintsRef
}: CompareSliderProps) => {
  return (
    <div className={cn("relative group rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 bg-slate-50", getAspectRatioClass(activeResult.options.aspectRatio || '16:9'))}>
      <div ref={compareConstraintsRef} className="relative w-full h-full overflow-hidden">
        <motion.div
          className="relative w-full h-full"
          style={{ transform: `scale(${compareZoomLevel})` }}
        >
          {/* Original Image (Background) */}
          <img 
            src={activeResult.originalUrl} 
            alt="Original" 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {/* Result Image (Foreground with Clip) */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
          >
            <img 
              src={activeResult.url} 
              alt="Result" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Slider Handle */}
        <div 
          className="absolute inset-y-0 z-10 flex items-center justify-center"
          style={{ left: `${compareSlider}%` }}
        >
          <div className="absolute inset-y-0 w-1 bg-white shadow-lg" />
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={(_, info) => {
              const container = compareConstraintsRef.current;
              if (container) {
                const rect = container.getBoundingClientRect();
                const newPos = ((info.point.x - rect.left) / rect.width) * 100;
                setCompareSlider(Math.max(0, Math.min(100, newPos)));
              }
            }}
            className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-ew-resize border-4 border-indigo-600 z-20"
          >
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
          </motion.div>
        </div>

        {/* Labels */}
        <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-wider z-20">
          Sau (Kết quả)
        </div>
        <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-wider z-20">
          Trước (Ảnh gốc)
        </div>
      </div>
    </div>
  );
};
