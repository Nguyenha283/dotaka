import React, { useRef } from 'react';
import { Upload, X, Camera, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MultiImageUploaderProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  label: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
  maxImages?: number;
}

export const MultiImageUploader = ({ 
  images, 
  setImages, 
  label, 
  description, 
  icon, 
  className, 
  theme,
  maxImages = 5
}: MultiImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{description} ({images.length}/{maxImages})</p>
          </div>
        </div>
        {images.length > 0 && (
          <button 
            onClick={() => setImages([])}
            className={cn(
              "p-2 rounded-xl transition-all shadow-sm active:scale-95",
              theme === 'dark' ? "bg-white/5 text-rose-400 hover:bg-white/10" : "bg-rose-50 text-rose-500 hover:bg-rose-100"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div 
            key={idx}
            className={cn(
              "relative aspect-square rounded-2xl overflow-hidden group/img border transition-all duration-500",
              theme === 'dark' ? "border-white/10" : "border-slate-100"
            )}
          >
            <img src={img} alt={`Molding ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => removeImage(idx)}
                className="p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {images.length < maxImages && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-500",
              theme === 'dark' 
                ? "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10" 
                : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg",
              theme === 'dark' ? "bg-white/10" : "bg-white shadow-sm"
            )}>
              <Plus className={cn("w-4 h-4", theme === 'dark' ? "text-white" : "text-indigo-600")} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">Thêm ảnh</span>
          </button>
        )}
      </div>

      <input 
        type="file" 
        multiple
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
