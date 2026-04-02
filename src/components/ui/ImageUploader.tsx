import React from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  image: string | null;
  setImage: (val: string | null) => void;
  label: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
}

export const ImageUploader = ({ image, setImage, label, description, icon, className, theme }: ImageUploaderProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("relative group space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl transition-colors duration-500",
            theme === 'dark' ? "bg-white/5 text-white" : "bg-indigo-50 text-indigo-600"
          )}>
            {icon}
          </div>
          <div>
            <h4 className={cn(
              "text-sm font-black uppercase tracking-tight transition-colors duration-500",
              theme === 'dark' ? "text-white" : "text-slate-900"
            )}>{label}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{description}</p>
          </div>
        </div>
        {image && (
          <button 
            onClick={() => setImage(null)}
            className={cn(
              "p-2 rounded-xl transition-all shadow-sm active:scale-95",
              theme === 'dark' ? "bg-white/5 text-rose-400 hover:bg-white/10" : "bg-rose-50 text-rose-500 hover:bg-rose-100"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div 
        onClick={() => !image && fileInputRef.current?.click()}
        className={cn(
          "relative aspect-video rounded-[32px] overflow-hidden transition-all duration-500 cursor-pointer border-2 border-dashed",
          image 
            ? "border-transparent shadow-2xl" 
            : (theme === 'dark' 
                ? "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10" 
                : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 hover:scale-[1.02]")
        )}
      >
        {image ? (
          <div className="relative w-full h-full group/img">
            <img src={image} alt="Uploaded" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <div className="flex gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="p-4 bg-white/20 hover:bg-white/40 text-white rounded-2xl backdrop-blur-xl transition-all border border-white/20"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="p-4 bg-rose-500/20 hover:bg-rose-500/40 text-white rounded-2xl backdrop-blur-xl transition-all border border-rose-500/20"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className={cn(
              "p-6 rounded-[24px] shadow-xl transition-all duration-500 group-hover:scale-110",
              theme === 'dark' ? "bg-white/10 text-white shadow-white/5" : "bg-white text-indigo-600 shadow-slate-200/50"
            )}>
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className={cn(
                "font-black text-lg transition-colors duration-500",
                theme === 'dark' ? "text-white" : "text-slate-900"
              )}>Tải ảnh lên</p>
              <p className="text-slate-400 text-sm font-medium">Kéo thả hoặc nhấn để chọn tệp</p>
            </div>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
