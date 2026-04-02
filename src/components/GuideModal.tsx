import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Layout, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal = ({
  isOpen,
  onClose
}: GuideModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl z-[101] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Info className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hướng dẫn chi tiết</h2>
              <p className="text-xs text-slate-500 font-medium">Bí quyết để có ảnh phối cảnh phào chỉ hoàn hảo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              BỘ HƯỚNG DẪN CUNG CẤP ẢNH ĐỂ GHÉP PHÀO CHỈ CHÍNH XÁC
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Để việc ghép ảnh thành công, chúng tôi cần hai bộ ảnh đầu vào đạt chuẩn: <span className="font-bold text-indigo-600">Ảnh Phông Nền (Phòng)</span> và <span className="font-bold text-emerald-600">Ảnh Vật Thể (Phào Chỉ)</span>. Dưới đây là cách thực hiện.
            </p>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-indigo-50/50 rounded-[24px] border border-indigo-100 space-y-6">
              <h4 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <Layout className="w-5 h-5" />
                PHẦN 1: HƯỚNG DẪN CHỤP ẢNH PHÒNG NỀN
              </h4>
              <p className="text-sm text-indigo-700/80">
                Mục tiêu là chụp lại không gian phòng của bạn sao cho giữ nguyên được phối cảnh, chiều sâu và ánh sáng tự nhiên. Ảnh này sẽ là nền để ghép phào.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 text-sm">1. Góc chụp và Phối cảnh</h5>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span><span className="font-bold">Chụp góc toàn cảnh và cân bằng:</span> Đứng ở vị trí nhìn rõ ít nhất hai bức tường giao nhau và trần nhà. Giữ máy thẳng đứng, không nghiêng.</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span><span className="font-bold">Chụp trực diện góc mòi:</span> Nếu muốn ghép vào góc cụ thể, hãy chụp trực diện góc đó để đảm bảo độ chính xác của mối nối.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 text-sm">2. Yêu cầu về không gian và ánh sáng</h5>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span><span className="font-bold">Càng rõ ràng càng tốt:</span> Dọn dẹp vật dụng che khuất đường giao giữa trần và tường (rèm cao, đồ trang trí).</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span><span className="font-bold">Ánh sáng tự nhiên:</span> Chụp ban ngày với ánh sáng đều. Tránh nắng gắt trực tiếp hoặc phòng quá tối.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-indigo-100">
                <h5 className="font-bold text-slate-900 text-sm">3. Ví dụ ảnh phông nền đạt chuẩn</h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-video bg-white rounded-xl border border-indigo-100 overflow-hidden">
                    <img src="https://i.ibb.co/JwQdpfh0/1.png" alt="Toàn cảnh 4 góc trần" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-video bg-white rounded-xl border border-indigo-100 overflow-hidden">
                    <img src="https://i.ibb.co/R4JLrPx5/2.png" alt="Góc 90 độ rõ nét" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-video bg-white rounded-xl border border-indigo-100 overflow-hidden">
                    <img src="https://i.ibb.co/nNFjWGc8/3.png" alt="Trần giật cấp" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-emerald-50/50 rounded-[24px] border border-emerald-100 space-y-6">
              <h4 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                PHẦN 2: HƯỚNG DẪN CHỤP ẢNH PHÀO CHỈ
              </h4>
              <p className="text-sm text-emerald-700/80">
                Mục tiêu là cung cấp "vật liệu" phào chỉ chất lượng cao nhất, với chi tiết bề mặt sắc nét và phối cảnh linh hoạt.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 text-sm">1. Kỹ thuật chụp "Tách biệt" và "Chi tiết"</h5>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span><span className="font-bold">Bộ ảnh "Làm Nền":</span> Đặt phào trên nền trung tính. Chụp trực diện (90 độ) và cận cảnh để lấy rõ hoa văn.</span>
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span><span className="font-bold">Ảnh "Phối Cảnh":</span> Giữ đoạn phào ngắn tại góc trần thực tế rồi chụp lại làm tham khảo ánh sáng và góc nhìn.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-slate-900 text-sm">2. Ánh sáng cho vật thể</h5>
                  <div className="p-4 bg-white rounded-xl border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800 mb-1 italic">Bắt buộc:</p>
                    <p className="text-sm text-slate-600">
                      Phải chụp ảnh phào chỉ trong <span className="font-bold">cùng điều kiện ánh sáng</span> với phòng. Nếu phòng dùng đèn vàng, phào cũng phải được chụp dưới ánh sáng vàng.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-emerald-100">
                <h5 className="font-bold text-slate-900 text-sm">3. Ví dụ ảnh mẫu phào chỉ đạt chuẩn</h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-video bg-white rounded-xl border border-emerald-100 overflow-hidden">
                    <img src="https://i.ibb.co/qM55yxfJ/1.png" alt="Mẫu phào chỉ 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-video bg-white rounded-xl border border-emerald-100 overflow-hidden">
                    <img src="https://i.ibb.co/ynQqHVFM/2.png" alt="Mẫu phào chỉ 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-video bg-white rounded-xl border border-emerald-100 overflow-hidden">
                    <img src="https://i.ibb.co/S7RHVxTZ/3.png" alt="Mẫu phào chỉ 3" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-[24px] text-white flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg">Bạn đã sẵn sàng?</h4>
              <p className="text-slate-400 text-sm">Tải ảnh lên và bắt đầu phối cảnh ngay bây giờ.</p>
            </div>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
            >
              Bắt đầu ngay
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
