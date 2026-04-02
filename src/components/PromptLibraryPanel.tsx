import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, Clock, Copy, Check, Info, Maximize2, X } from 'lucide-react';
import { Prompt } from '../types';
import { cn } from '../lib/utils';

interface PromptLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  promptLibrary: Prompt[];
  setPromptLibrary: (val: Prompt[] | ((prev: Prompt[]) => Prompt[])) => void;
  onApplyPrompt: (content: string) => void;
  showToast: (msg: string) => void;
  theme?: string;
}

export const PromptLibraryPanel = ({
  isOpen,
  onClose,
  promptLibrary,
  setPromptLibrary,
  onApplyPrompt,
  showToast,
  theme = 'light'
}: PromptLibraryPanelProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [newPrompt, setNewPrompt] = React.useState({ title: '', content: '' });
  const [editingPromptId, setEditingPromptId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ title: '', content: '' });
  const [isExpandedEdit, setIsExpandedEdit] = React.useState(false);

  const filteredPrompts = promptLibrary.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPrompt = () => {
    if (!newPrompt.title || !newPrompt.content) return;
    const prompt: Prompt = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newPrompt.title,
      content: newPrompt.content,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setPromptLibrary(prev => [prompt, ...prev]);
    setNewPrompt({ title: '', content: '' });
    setIsAdding(false);
    showToast('Đã lưu vào thư viện');
  };

  const handleUpdatePrompt = (id: string) => {
    if (!editForm.title || !editForm.content) return;
    setPromptLibrary(prev => prev.map(p => 
      p.id === id 
        ? { ...p, title: editForm.title, content: editForm.content, updatedAt: Date.now() } 
        : p
    ));
    setEditingPromptId(null);
    showToast('Đã cập nhật mẫu prompt');
  };

  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPromptLibrary(prev => prev.filter(p => p.id !== id));
    showToast('Đã xóa khỏi thư viện');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-[61] flex flex-col",
          theme === 'dark' ? "bg-[#111] border-l border-white/5" : "bg-white"
        )}
      >
        <div className={cn("p-8 border-b flex items-center justify-between", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
          <div>
            <h3 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-slate-900")}>Thư viện Prompt</h3>
            <p className={cn("text-sm font-medium", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Lưu trữ và quản lý các mẫu câu lệnh</p>
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingPromptId(null);
            }}
            className={cn(
              "p-3 rounded-2xl transition-all shadow-lg",
              isAdding ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
            )}
          >
            {isAdding ? <Plus className="w-5 h-5 rotate-45" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>

        <div className={cn("p-6 border-b", theme === 'dark' ? "border-white/5" : "border-slate-100")}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm mẫu câu lệnh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-3 border rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all",
                theme === 'dark' ? "bg-white/5 border-white/10 text-white placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900"
              )}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-indigo-50 rounded-[24px] border border-indigo-100 space-y-4 shadow-xl shadow-indigo-100/20"
              >
                <input 
                  type="text"
                  placeholder="Tên mẫu gợi ý..."
                  value={newPrompt.title}
                  onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                />
                <textarea 
                  placeholder="Nội dung câu lệnh chi tiết..."
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({ ...newPrompt, content: e.target.value })}
                  className="w-full h-32 px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleAddPrompt}
                    className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  >
                    Lưu mẫu
                  </button>
                </div>
              </motion.div>
            )}

            {filteredPrompts.length > 0 ? (
              filteredPrompts.map((prompt) => (
                <motion.div 
                  layout
                  key={prompt.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => {
                    if (editingPromptId !== prompt.id) {
                      setEditingPromptId(prompt.id);
                      setEditForm({ title: prompt.title, content: prompt.content });
                      setIsAdding(false);
                    }
                  }}
                  className={cn(
                    "group p-5 border rounded-[24px] transition-all cursor-pointer relative overflow-hidden",
                    theme === 'dark' ? "bg-white/5" : "bg-white",
                    editingPromptId === prompt.id 
                      ? "border-indigo-500 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500" 
                      : (theme === 'dark' ? "border-white/10 hover:border-white/30" : "border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50")
                  )}
                >
                  {editingPromptId === prompt.id ? (
                      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className={cn(
                          "w-full px-4 py-2 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500",
                          theme === 'dark' ? "bg-white/10 border-white/10 text-white" : "bg-slate-50 border-indigo-100"
                        )}
                      />
                      <textarea 
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        className={cn(
                          "w-full h-32 px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none",
                          theme === 'dark' ? "bg-white/10 border-white/10 text-white" : "bg-slate-50 border-indigo-100"
                        )}
                      />
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingPromptId(null)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-500"
                          >
                            Hủy
                          </button>
                          <button 
                            onClick={() => setIsExpandedEdit(true)}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              theme === 'dark' ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                            title="Mở rộng cửa sổ prompt"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdatePrompt(prompt.id)}
                            className={cn(
                              "px-4 py-2 border text-xs font-bold rounded-xl",
                              theme === 'dark' ? "border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20" : "bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            )}
                          >
                            Lưu thay đổi
                          </button>
                          <button 
                            onClick={() => {
                              onApplyPrompt(editForm.content);
                              onClose();
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                          >
                            Sử dụng
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <h4 className={cn("font-bold transition-colors group-hover:text-indigo-500", theme === 'dark' ? "text-slate-200" : "text-slate-900")}>{prompt.title}</h4>
                        <button 
                          onClick={(e) => handleDeletePrompt(prompt.id, e)}
                          className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={cn("text-sm line-clamp-2 leading-relaxed mb-4", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>{prompt.content}</p>
                      <div className={cn("flex items-center justify-between pt-4 border-t", theme === 'dark' ? "border-white/5" : "border-slate-50")}>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {new Date(prompt.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className={cn("flex items-center gap-2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all", theme === 'dark' ? "text-indigo-400" : "text-indigo-600")}>
                          Chỉnh sửa & Sử dụng <Copy className="w-3 h-3" />
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className={cn("p-6 flex rounded-full", theme === 'dark' ? "bg-white/5" : "bg-slate-50")}>
                  <Info className={cn("w-10 h-10", theme === 'dark' ? "text-white/20" : "text-slate-300")} />
                </div>
                <div>
                  <p className={cn("font-bold", theme === 'dark' ? "text-slate-300" : "text-slate-900")}>Thư viện trống</p>
                  <p className="text-slate-400 text-sm">Hãy tạo mẫu prompt đầu tiên của bạn</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Expanded Edit Modal */}
      <AnimatePresence>
        {isExpandedEdit && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpandedEdit(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "fixed inset-10 md:inset-20 rounded-[40px] shadow-2xl z-[71] flex flex-col overflow-hidden",
                theme === 'dark' ? "bg-[#111] border border-white/10" : "bg-white"
              )}
            >
              <div className={cn("p-8 border-b flex items-center justify-between", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50/50 border-slate-100")}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={cn("text-2xl font-black", theme === 'dark' ? "text-white" : "text-slate-900")}>Mở rộng trình chỉnh sửa</h3>
                    <p className={cn("text-sm font-medium", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Chỉnh sửa mẫu prompt với không gian lớn hơn</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpandedEdit(false)}
                  className={cn("p-3 rounded-2xl transition-all", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-slate-200")}
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 p-10 flex flex-col space-y-3 overflow-hidden">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nội dung câu lệnh chi tiết</label>
                <textarea 
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="Nhập nội dung prompt..."
                  className={cn(
                    "flex-1 w-full px-8 py-8 border rounded-[32px] text-base leading-relaxed focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none custom-scrollbar",
                    theme === 'dark' ? "bg-white/5 border-white/5 text-slate-200" : "bg-slate-50 border-slate-100 text-slate-900"
                  )}
                />
              </div>

              <div className={cn("p-8 border-t flex justify-end gap-4", theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50/50 border-slate-100")}>
                <button 
                  onClick={() => setIsExpandedEdit(false)}
                  className={cn("px-8 py-4 text-sm font-bold transition-all", theme === 'dark' ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600")}
                >
                  Đóng
                </button>
                <button 
                  onClick={() => {
                    if (editingPromptId) handleUpdatePrompt(editingPromptId);
                    setIsExpandedEdit(false);
                  }}
                  className="px-10 py-4 bg-indigo-600 text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                >
                  Lưu & Đóng
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
