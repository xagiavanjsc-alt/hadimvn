interface VIPUpgradePopupProps {
  onClose: () => void;
}

export default function VIPUpgradePopup({ onClose }: VIPUpgradePopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#F5F2ED] rounded-3xl max-w-md w-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#1A1E23] p-8 text-center relative">
          <div
            className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl font-bold text-white/4 select-none"
            style={{ fontFamily: "'Noto Serif', serif" }}
          >學</div>
          <div className="w-14 h-14 flex items-center justify-center bg-[#D4AF37] rounded-2xl mx-auto mb-4">
            <i className="ri-vip-crown-fill text-[#1A1E23] text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: "'Noto Serif', serif" }}>
            Bạn đã đạt giới hạn học thử
          </h3>
          <p className="text-white/55 text-sm">
            Nâng cấp VIP để mở khóa toàn bộ kho tàng từ vựng
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {[
              { icon: "ri-book-2-line", text: "2.600 từ vựng Hán-Hàn đầy đủ", color: "text-[#4A5D23]" },
              { icon: "ri-quill-pen-line", text: "500+ truyện chêm AI không giới hạn", color: "text-[#4A5D23]" },
              { icon: "ri-volume-up-line", text: "Audio phát âm chuẩn Seoul", color: "text-[#4A5D23]" },
              { icon: "ri-node-tree", text: "Sơ đồ cây Hanja tương tác", color: "text-[#4A5D23]" },
              { icon: "ri-download-line", text: "Tải PDF từ vựng không giới hạn", color: "text-[#4A5D23]" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className={`${item.icon} ${item.color} text-base`}></i>
                </div>
                <span className="text-sm text-[#1A1E23]/80">{item.text}</span>
              </li>
            ))}
          </ul>

          {/* Price */}
          <div className="bg-[#1A1E23] rounded-2xl p-5 text-center mb-4">
            <div className="text-white/50 text-xs mb-1">Chỉ với</div>
            <div className="text-4xl font-bold text-[#D4AF37]"
              style={{ fontFamily: "'Noto Serif', serif" }}>
              99.000đ
            </div>
            <div className="text-white/40 text-xs mt-1">/tháng · Huỷ bất cứ lúc nào</div>
          </div>

          <a href="/vip" className="w-full bg-[#D4AF37] text-[#1A1E23] font-bold py-4 rounded-xl text-sm cursor-pointer hover:bg-[#C9A42E] transition-colors whitespace-nowrap flex items-center justify-center gap-2">
            <i className="ri-vip-crown-fill"></i>
            Kích hoạt VIP ngay – 30 giây
          </a>
          <button
            onClick={onClose}
            className="w-full mt-2.5 text-xs text-[#1A1E23]/40 hover:text-[#1A1E23]/70 py-2 cursor-pointer transition-colors"
          >
            Tiếp tục dùng miễn phí
          </button>
        </div>
      </div>
    </div>
  );
}
