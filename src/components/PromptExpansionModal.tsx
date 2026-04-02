import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, X, Info } from 'lucide-react';

interface PromptExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPrompt: string;
  setUserPrompt: (val: string) => void;
}

export const PromptExpansionModal = ({
  isOpen,
  onClose,
  userPrompt,
  setUserPrompt
}: PromptExpansionModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <Wand2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Hướng dẫn chi tiết cho AI</h3>
                <p className="text-sm text-slate-500 font-medium">Mô tả cụ thể cách bạn muốn AI ghép phào chỉ</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ví dụ: Ghép phào màu vàng kim sang trọng, thêm hiệu ứng đèn hắt trần màu ấm, chỉ ghép ở các góc trần chính..."
              className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400 leading-relaxed"
              autoFocus
            />
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-medium">AI sẽ ưu tiên các hướng dẫn này khi tạo phối cảnh</span>
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setUserPrompt('')}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors"
                >
                  Xóa hết
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
