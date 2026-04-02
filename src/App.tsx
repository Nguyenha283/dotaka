import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Maximize2, 
  X, 
  Download, 
  RotateCcw, 
  Image as ImageIcon,
  Layout,
  Sparkles,
  Eye,
  Bookmark,
  Info,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Columns,
  History,
  Sun,
  Moon,
  Palette,
  Maximize,
  Trash2,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
import { GenerationResult, Prompt } from './types';

// --- Utilities ---
import { cn, getAspectRatioClass, downloadImage } from './lib/utils';

// --- Constants ---
import { MOCK_RECENT_RESULTS } from './constants';

// --- Components ---
import { Lightbox } from './components/Lightbox';
import { PromptExpansionModal } from './components/PromptExpansionModal';
import { GuideModal } from './components/GuideModal';
import { CompareSlider } from './components/CompareSlider';
import { PromptLibraryPanel } from './components/PromptLibraryPanel';
import { StepBadge } from './components/ui/StepBadge';
import { StepIndicator } from './components/ui/StepIndicator';
import { SegmentedControl } from './components/ui/SegmentedControl';
import { ImageUploader } from './components/ui/ImageUploader';
import { MultiImageUploader } from './components/ui/MultiImageUploader';
import { Toast } from './components/ui/Toast';

// --- App Component ---

export default function App() {
  // --- States ---
  const [roomImage, setRoomImage] = useState<string | null>(null);
  const [moldingImages, setMoldingImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [activeResult, setActiveResult] = useState<GenerationResult | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSlider, setCompareSlider] = useState(50);
  const [compareZoomLevel, setCompareZoomLevel] = useState(1);
  const compareConstraintsRef = useRef<HTMLDivElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isLibraryPanelOpen, setIsLibraryPanelOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [promptLibrary, setPromptLibrary] = useState<Prompt[]>(() => {
    const saved = localStorage.getItem('promptLibrary_v2');
    if (saved) return JSON.parse(saved);
    
    return [
      {
        id: 'mock-prompt-1',
        title: 'Phào chỉ sang trọng',
        content: "Ghép phào màu vàng kim sang trọng, thêm hiệu ứng đèn hắt trần màu ấm",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'mock-prompt-2',
        title: 'Phong cách cổ điển',
        content: "Phào chỉ phong cách cổ điển, hoa văn cầu kỳ, màu trắng sứ",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'mock-prompt-3',
        title: 'Tối giản hiện đại',
        content: "Ghép phào tối giản, đường nét thanh mảnh, màu xám nhạt",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('promptLibrary_v2', JSON.stringify(promptLibrary));
  }, [promptLibrary]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    setZoomLevel(1);
    setCompareZoomLevel(1);
    setCompareSlider(50);
  }, [activeResult]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleDownload = (url: string) => {
    downloadImage(url, `molding-ai-${Date.now()}.png`);
    showToast("Đã tải ảnh xuống");
  };
  
  // Design Options
  const [style, setStyle] = useState('Tự nhiên');
  const [intensity, setIntensity] = useState('Vừa');
  const [angle, setAngle] = useState('Toàn cảnh');
  const [outputAspectRatio, setOutputAspectRatio] = useState('16:9');

  // --- Handlers ---
  const generateMolding = async () => {
    if (!roomImage) {
      setError("Vui lòng tải ảnh phòng thô");
      return;
    }
    if (moldingImages.length === 0) {
      setError("Vui lòng tải ít nhất một mẫu phào chỉ");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Create Task
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomImage,
          moldingImages,
          prompt: `Interior renovation: add ceiling molding from reference images to the room. 
                   Style: ${style}. Intensity: ${intensity}. Perspective: ${angle}. 
                   ${userPrompt ? `Extra: ${userPrompt}.` : ''}
                   Realistic, high quality, seamless integration.`,
          aspectRatio: outputAspectRatio,
          resolution: "1K"
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Server Error Details:", errData.details);
        throw new Error(errData.error || "Failed to create task");
      }

      const { taskId } = await response.json();

      // 2. Poll for Status
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes (5s interval)
      
      const poll = async (): Promise<string> => {
        if (attempts >= maxAttempts) throw new Error("Quá thời gian chờ xử lý");
        attempts++;

        const statusRes = await fetch(`/api/task/${taskId}`);
        const statusData = await statusRes.json();

        console.log("Poll response:", statusData);

        // KIE returns code 200 for success
        if (statusData.code !== 200) throw new Error(statusData.msg || statusData.message || "Task failed");

        const task = statusData.data;
        const status = task?.status;

        if (status === "succeeded" || status === "completed" || status === "success") {
          // KIE may use output_urls, outputs, or resultUrls
          const urls = task.output_urls || task.outputs || task.resultUrls || [];
          const imageUrl = Array.isArray(urls) ? urls[0] : urls;
          if (!imageUrl) throw new Error("No output URL in response");
          return imageUrl;
        } else if (status === "failed" || status === "error") {
          throw new Error(task.error || "AI xử lý thất bại");
        }

        // Still processing — wait 5s and retry
        await new Promise(r => setTimeout(r, 5000));
        return poll();
      };

      const imageUrl = await poll();

      const newResult: GenerationResult = {
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        originalUrl: roomImage,
        moldingUrls: moldingImages,
        timestamp: Date.now(),
        options: { style, intensity, angle, aspectRatio: outputAspectRatio }
      };
      setResults(prev => [newResult, ...prev]);
      setActiveResult(newResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể tạo phối cảnh lúc này. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render Helpers ---

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900",
      theme === 'dark' ? "bg-[#0a0a0a] text-slate-200" : "bg-[#fcfcfc] text-slate-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-500",
        theme === 'dark' ? "bg-[#0a0a0a]/80 border-white/5" : "bg-white/80 border-slate-100"
      )}>
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl border transition-all duration-500",
              theme === 'dark' 
                ? "bg-white text-black border-white/20 shadow-white/5" 
                : "bg-black text-white border-white/20 shadow-black/5"
            )}>
              <Sparkles className="w-6 h-6 drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={cn(
                  "text-2xl font-black tracking-tight transition-colors duration-500",
                  theme === 'dark' ? "text-white" : "text-slate-900"
                )}>
                  DOTAKA
                </h1>
                <div className="px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[9px] font-black uppercase rounded-full shadow-sm shadow-indigo-200 tracking-wider">
                  Pro
                </div>
              </div>
              <p className={cn(
                "text-[11px] font-semibold tracking-wide flex items-center gap-1.5 transition-colors duration-500",
                theme === 'dark' ? "text-slate-500" : "text-slate-400"
              )}>
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                Professional Interior Mockup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-10">
              <button 
                onClick={() => setIsGuideModalOpen(true)}
                className="text-sm font-bold opacity-60 hover:opacity-100 transition-all hover:scale-105 active:scale-95"
              >
                Hướng dẫn
              </button>
              <button 
                onClick={() => setIsLibraryPanelOpen(true)}
                className="text-sm font-bold opacity-60 hover:opacity-100 transition-all hover:scale-105 active:scale-95"
              >
                Thư viện
              </button>
            </nav>

            <div className={cn("h-6 w-px transition-colors duration-500", theme === 'dark' ? "bg-white/10" : "bg-slate-200")}></div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className={cn(
                  "p-2.5 rounded-full transition-all active:scale-95",
                  theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-yellow-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                )}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start">
          
          {/* Left Column: Controls */}
          <aside className="space-y-8">
            {/* Step 1 & 2: Image Uploaders */}
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <StepIndicator step="Step 01" theme={theme} />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">Ảnh phòng thô</h3>
                  </div>
                  {roomImage && (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Đã tải
                    </div>
                  )}
                </div>
                <ImageUploader 
                  label="Không gian cần phối cảnh"
                  description="Chọn ảnh không gian"
                  image={roomImage}
                  setImage={setRoomImage}
                  icon={<Layout className="w-5 h-5" />}
                  theme={theme}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <StepIndicator step="Step 02" theme={theme} />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">Mẫu phào</h3>
                  </div>
                  {moldingImages.length > 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Đã tải {moldingImages.length} ảnh
                    </div>
                  )}
                </div>
                <MultiImageUploader 
                  label="Mẫu phào mong muốn"
                  description="Tải lên tối đa 5 ảnh góc cạnh"
                  images={moldingImages}
                  setImages={setMoldingImages}
                  icon={<ImageIcon className="w-5 h-5" />}
                  theme={theme}
                  maxImages={5}
                />
              </div>
            </div>

            {/* Configuration Card */}
            <div className={cn(
              "rounded-[40px] p-8 border transition-all duration-500",
              theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"
            )}>
              <div className="flex items-center gap-4 mb-8">
                <StepIndicator step="Step 03" theme={theme} />
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">Tùy chọn tạo ảnh</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Phong cách hiển thị
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Tự nhiên', 'Sang trọng', 'Tối giản', 'Cổ điển'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-xs font-bold transition-all border",
                          style === s 
                            ? (theme === 'dark' ? "bg-white text-black border-white" : "bg-black text-white border-black")
                            : (theme === 'dark' ? "bg-transparent border-white/10 hover:border-white/30" : "bg-transparent border-slate-100 hover:border-slate-300")
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">
                    <span className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> Mức độ hiển thị</span>
                    <span>{intensity}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Nhẹ', 'Vừa', 'Mạnh'].map((i) => (
                      <button
                        key={i}
                        onClick={() => setIntensity(i)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border",
                          intensity === i 
                            ? (theme === 'dark' ? "bg-white text-black border-white" : "bg-black text-white border-black")
                            : (theme === 'dark' ? "bg-transparent border-white/10 hover:border-white/30" : "bg-transparent border-slate-100 hover:border-slate-300")
                        )}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Eye className="w-3 h-3" /> Góc nhìn
                    </label>
                    <select 
                      value={angle}
                      onChange={(e) => setAngle(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-2xl text-xs font-bold border focus:outline-none transition-all",
                        theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-100 text-slate-900"
                      )}
                    >
                      <option value="Toàn cảnh">Toàn cảnh</option>
                      <option value="Cận cảnh">Cận cảnh</option>
                      <option value="Góc thấp">Góc thấp</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Maximize className="w-3 h-3" /> Tỉ lệ
                    </label>
                    <select 
                      value={outputAspectRatio}
                      onChange={(e) => setOutputAspectRatio(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 rounded-2xl text-xs font-bold border focus:outline-none transition-all",
                        theme === 'dark' ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-100 text-slate-900"
                      )}
                    >
                      <option value="16:9">16:9</option>
                      <option value="4:3">4:3</option>
                      <option value="1:1">1:1</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <StepIndicator step="Step 04" theme={theme} />
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">Hướng dẫn phối cảnh</h3>
                </div>
                <button 
                  onClick={() => setIsPromptModalOpen(true)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Maximize2 className="w-4 h-4 opacity-40" />
                </button>
              </div>
              <div className="relative group">
                <textarea 
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Ví dụ: Phào chỉ màu trắng sứ, phong cách tân cổ điển..."
                  className={cn(
                    "w-full h-32 p-6 rounded-[32px] text-sm font-medium border focus:outline-none transition-all resize-none custom-scrollbar",
                    theme === 'dark' ? "bg-white/5 border-white/10 focus:border-white/30 text-white" : "bg-white border-slate-100 focus:border-slate-300 text-slate-900"
                  )}
                />
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => setIsLibraryPanelOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-indigo-500 hover:text-white transition-all shadow-sm text-[10px] font-black uppercase tracking-wider"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Thư viện prompt
                  </button>
                  <button 
                    onClick={() => setUserPrompt("")}
                    className="p-2.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const newId = `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                      setPromptLibrary(prev => [...prev, { id: newId, title: 'Mới', content: userPrompt, createdAt: Date.now(), updatedAt: Date.now() }]);
                      showToast("Đã lưu vào thư viện");
                    }}
                    className="p-2.5 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={generateMolding}
              disabled={isGenerating || !roomImage || moldingImages.length === 0}
              className={cn(
                "w-full py-6 rounded-full text-sm font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl",
                theme === 'dark' ? "bg-white text-black hover:bg-slate-200 shadow-white/5" : "bg-black text-white hover:bg-slate-800 shadow-black/10"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Bắt đầu tạo phối cảnh
                </>
              )}
            </button>
          </aside>

          {/* Right Column: Results */}
          <div className="space-y-10">
            
            {/* Main Result Area */}
            <div className={cn(
              "rounded-[40px] p-10 border min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500",
              theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"
            )}>
              
              <AnimatePresence mode="wait">
                {!isGenerating && !activeResult && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-6 max-w-md"
                  >
                    <div className={cn(
                      "w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-8",
                      theme === 'dark' ? "bg-white/5" : "bg-slate-50"
                    )}>
                      <Camera className={cn("w-10 h-10", theme === 'dark' ? "text-white/20" : "text-slate-200")} />
                    </div>
                    <h2 className={cn("text-2xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Sẵn sàng tạo phối cảnh</h2>
                    <p className={cn("text-sm font-medium leading-relaxed", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>
                      Tải lên ảnh phòng và mẫu phào chỉ ở cột bên trái để bắt đầu quá trình thiết kế AI.
                    </p>
                  </motion.div>
                )}

                {isGenerating && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-12 w-full max-w-lg"
                  >
                    <div className="space-y-6">
                      <div className={cn(
                        "w-20 h-20 rounded-full mx-auto flex items-center justify-center animate-pulse",
                        theme === 'dark' ? "bg-white/10" : "bg-indigo-50"
                      )}>
                        <Loader2 className={cn("w-8 h-8 animate-spin", theme === 'dark' ? "text-white" : "text-indigo-600")} />
                      </div>
                      <div className="space-y-2">
                        <h3 className={cn("text-xl font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>AI đang xử lý phối cảnh</h3>
                        <p className={cn("text-sm font-medium", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Quá trình này thường mất khoảng 15-20 giây...</p>
                      </div>
                    </div>
                    
                    <div className="relative h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className={cn("absolute top-0 left-0 h-full", theme === 'dark' ? "bg-white" : "bg-black")}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 20, ease: "linear" }}
                      />
                    </div>
                  </motion.div>
                )}

                {activeResult && !isGenerating && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full space-y-8"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          theme === 'dark' ? "bg-emerald-500/10" : "bg-emerald-50"
                        )}>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className={cn("text-lg font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Phối cảnh hoàn tất</h3>
                          <p className={cn("text-xs font-medium", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Đã áp dụng mẫu phào chỉ thành công</p>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "flex p-1 rounded-xl",
                        theme === 'dark' ? "bg-white/5" : "bg-slate-100"
                      )}>
                        <button 
                          onClick={() => setCompareMode(false)}
                          className={cn(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                            !compareMode 
                              ? (theme === 'dark' ? "bg-white text-black shadow-sm" : "bg-white text-indigo-600 shadow-sm")
                              : (theme === 'dark' ? "text-slate-400" : "text-slate-500")
                          )}
                        >
                          Kết quả
                        </button>
                        <button 
                          onClick={() => setCompareMode(true)}
                          className={cn(
                            "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
                            compareMode 
                              ? (theme === 'dark' ? "bg-white text-black shadow-sm" : "bg-white text-indigo-600 shadow-sm")
                              : (theme === 'dark' ? "text-slate-400" : "text-slate-500")
                          )}
                        >
                          <Columns className="w-3 h-3" /> So sánh
                        </button>
                      </div>
                    </div>

                    {compareMode ? (
                      <CompareSlider 
                        activeResult={activeResult}
                        compareSlider={compareSlider}
                        setCompareSlider={setCompareSlider}
                        compareZoomLevel={compareZoomLevel}
                        setCompareZoomLevel={setCompareZoomLevel}
                        compareConstraintsRef={compareConstraintsRef}
                      />
                    ) : (
                      <div className={cn(
                        "relative group rounded-[32px] overflow-hidden shadow-2xl border transition-all duration-500",
                        theme === 'dark' ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50",
                        getAspectRatioClass(activeResult.options.aspectRatio || '16:9')
                      )}>
                        <img 
                          src={activeResult.url} 
                          alt="Result" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                          <button 
                            onClick={() => setIsLightboxOpen(true)}
                            className="p-4 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"
                          >
                            <Maximize2 className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => handleDownload(activeResult.url)}
                            className="p-4 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"
                          >
                            <Download className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className={cn(
                      "flex flex-wrap items-center justify-between gap-6 pt-8 border-t transition-all duration-500",
                      theme === 'dark' ? "border-white/5" : "border-slate-100"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                          <img src={activeResult.originalUrl} className="w-12 h-12 rounded-full border-4 border-[#fcfcfc] dark:border-[#0a0a0a] object-cover shadow-sm" alt="Original" />
                          <div className="flex -space-x-4">
                            {activeResult.moldingUrls.slice(0, 2).map((url, i) => (
                              <img key={i} src={url} className="w-12 h-12 rounded-full border-4 border-[#fcfcfc] dark:border-[#0a0a0a] object-cover shadow-sm" alt={`Molding ${i}`} />
                            ))}
                            {activeResult.moldingUrls.length > 2 && (
                              <div className="w-12 h-12 rounded-full border-4 border-[#fcfcfc] dark:border-[#0a0a0a] bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-black shadow-sm">
                                +{activeResult.moldingUrls.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>
                          Dựa trên ảnh gốc & {activeResult.moldingUrls.length} mẫu phào chỉ
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleDownload(activeResult.url)}
                          className={cn(
                            "px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 justify-center",
                            theme === 'dark' ? "bg-white text-black hover:bg-slate-200 shadow-white/5" : "bg-black text-white hover:bg-slate-800 shadow-black/10"
                          )}
                        >
                          <Download className="w-4 h-4" /> 
                          <span>Tải kết quả</span>
                        </button>
                        <button 
                          onClick={() => {
                            setRoomImage(null);
                            setMoldingImages([]);
                            setActiveResult(null);
                            setResults([]);
                          }}
                          className={cn(
                            "p-4 rounded-full transition-all",
                            theme === 'dark' ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Recent Results Gallery */}
            <section className="space-y-10">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">History</span>
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-70">Kết quả gần đây</h3>
                </div>
                {(results.length > 0) && (
                  <button 
                    onClick={() => {
                      setResults([]);
                      setActiveResult(null);
                      showToast("Đã xóa lịch sử");
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      theme === 'dark' ? "bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10" : "bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    )}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa lịch sử
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-8">
                {(results.length > 0 ? results : MOCK_RECENT_RESULTS).slice(0, 4).map((res) => (
                  <motion.div
                    key={res.id}
                    layoutId={res.id}
                    onClick={() => setActiveResult(res)}
                    className={cn(
                      "group relative rounded-[32px] overflow-hidden cursor-pointer transition-all duration-500",
                      activeResult?.id === res.id 
                        ? (theme === 'dark' ? "ring-2 ring-white ring-offset-4 ring-offset-[#0a0a0a]" : "ring-2 ring-black ring-offset-4 ring-offset-[#fcfcfc]")
                        : "hover:scale-[1.02]"
                    )}
                  >
                    <div className={cn("w-full transition-colors aspect-video", theme === 'dark' ? "bg-white/5" : "bg-slate-100")}>
                      <img 
                        src={res.url} 
                        alt="Recent result" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Lightbox / Zoom Modal */}
      <Lightbox 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        activeResult={activeResult}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        constraintsRef={constraintsRef}
      />

      {/* Prompt Expansion Modal */}
      <PromptExpansionModal 
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        userPrompt={userPrompt}
        setUserPrompt={setUserPrompt}
      />

      {/* Guide Modal */}
      <GuideModal 
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <PromptLibraryPanel 
        isOpen={isLibraryPanelOpen}
        onClose={() => setIsLibraryPanelOpen(false)}
        promptLibrary={promptLibrary}
        setPromptLibrary={setPromptLibrary}
        onApplyPrompt={(content) => {
          setUserPrompt(content);
          setIsLibraryPanelOpen(false);
          showToast("Đã áp dụng prompt");
        }}
        showToast={showToast}
      />

      {/* Toast Notification */}
      <Toast 
        message={toast?.message || null} 
        onClose={() => setToast(null)} 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
