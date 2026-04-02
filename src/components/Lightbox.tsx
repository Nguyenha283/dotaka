import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomOut, ZoomIn, RotateCcw, Download } from 'lucide-react';
import { GenerationResult } from '../types';
import { downloadImage } from '../lib/utils';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  activeResult: GenerationResult | null;
  zoomLevel: number;
  setZoomLevel: (val: number | ((prev: number) => number)) => void;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
}

export const Lightbox = ({ 
  isOpen, 
  onClose, 
  activeResult, 
  zoomLevel, 
  setZoomLevel,
  constraintsRef
}: LightboxProps) => {
  if (!isOpen || !activeResult) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 md:p-12"
      >
        <button 
          onClick={() => {
            onClose();
            setZoomLevel(1);
          }}
          className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 z-50">
          <button 
            onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ZoomOut className="w-6 h-6" />
          </button>
          <span className="text-white font-bold text-sm w-12 text-center">{zoomLevel.toFixed(1)}x</span>
          <button 
            onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.5))}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ZoomIn className="w-6 h-6" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          <button 
            onClick={() => setZoomLevel(1)}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase"
          >
            <RotateCcw className="w-4 h-4" /> Đặt lại
          </button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          <button 
            onClick={() => downloadImage(activeResult.url, `molding-ai-full-${activeResult.id}.png`)}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Download className="w-5 h-5" /> Tải về
          </button>
        </div>

        <motion.div 
          ref={constraintsRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <motion.div
            key={zoomLevel === 1 ? 'reset' : 'drag'}
            drag={zoomLevel > 1}
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            className="relative flex items-center justify-center"
            style={{ 
              cursor: zoomLevel > 1 ? 'grab' : 'default',
              width: zoomLevel > 1 ? '200%' : '100%',
              height: zoomLevel > 1 ? '200%' : '100%',
            }}
          >
            <img 
              src={activeResult.url} 
              alt="Full Result" 
              className="max-w-full max-h-full transition-transform duration-300 ease-out origin-center select-none pointer-events-none"
              style={{ transform: `scale(${zoomLevel})` }}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
