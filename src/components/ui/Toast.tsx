import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast = ({ message, onClose }: ToastProps) => {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 bg-slate-900 text-white rounded-[24px] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl"
        >
          <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-tight">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
