import { useNavigate } from "react-router-dom";

export default function DuHocPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Du học Hàn Quốc
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Cơ hội học tập tại các trường đại học hàng đầu Hàn Quốc
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate("/duhoc-apply")}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              Đăng ký ngay
            </button>
            <button
              onClick={() => navigate("/duhoc-requirements")}
              className="px-4 py-2 border border-orange-600/30 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium transition-colors"
            >
              Xem yêu cầu
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-4">
            Tại sao chọn du học Hàn Quốc?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Giáo dục chất lượng cao
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Các trường đại học Hàn Quốc xếp hạng cao trong bảng xếp hạng thế giới
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="text-2xl mb-2">💼</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Cơ hội việc làm
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Được phép làm việc thêm trong thời gian học và cơ hội định cư sau khi tốt nghiệp
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="text-2xl mb-2">🌏</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Văn hóa đa dạng
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Trải nghiệm văn hóa Hàn Quốc đậm đà, mở rộng mối quan hệ quốc tế
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-4">
            Quy trình đăng ký
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-300">1</span>
              </div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                Chuẩn bị hồ sơ
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-300">
                Chuẩn bị bằng cấp, chứng chỉ TOPIK, hồ sơ tài chính
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-300">2</span>
              </div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                Nộp đơn
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-300">
                Nộp đơn đăng ký vào trường đại học mong muốn
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-300">3</span>
              </div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                Phỏng vấn & Visa
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-300">
                Tham gia phỏng vấn và xin visa du học
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-300">4</span>
              </div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                Xuất cảnh
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-300">
                Nhận visa và xuất cảnh sang Hàn Quốc
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
            Đăng ký ngay hôm nay để nhận tư vấn miễn phí từ chuyên gia
          </p>
          <button
            onClick={() => navigate("/duhoc-apply")}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Đăng ký tư vấn miễn phí
          </button>
        </div>
      </div>
    </div>
  );
}
