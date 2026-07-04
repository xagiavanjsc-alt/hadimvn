import { useNavigate } from "react-router-dom";

const REQUIREMENTS = [
  {
    category: "Trình độ học vấn",
    items: ["Tốt nghiệp THPT trở lên", "GPA từ 6.5/10 trở lên"],
  },
  {
    category: "Tiếng Hàn",
    items: ["TOPIK I cấp 3 trở lên cho học tiếng", "TOPIK II cấp 3 trở lên cho học chuyên ngành"],
  },
  {
    category: "Tài chính",
    items: [
      "Chứng minh tài chính khoảng 10.000 - 20.000 USD",
      "Người bảo lãnh tài chính",
    ],
  },
  {
    category: "Hồ sơ",
    items: [
      "Bằng cấp và bảng điểm",
      "Chứng chỉ TOPIK",
      "Giấy khai sinh",
      "CMND/CCCD",
      "Sổ hộ khẩu",
      "Hộ chiếu",
    ],
  },
  {
    category: "Sức khỏe",
    items: ["Giấy khám sức khỏe", "Không mắc các bệnh truyền nhiễm"],
  },
];

export default function DuHocRequirementsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Yêu cầu du học Hàn Quốc
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Điều kiện cần để đăng ký du học
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {REQUIREMENTS.map((req, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {req.category}
                </h3>
                <ul className="space-y-1">
                  {req.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-[10px] text-gray-600 dark:text-gray-300"
                    >
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              ⚠️ Lưu ý quan trọng
            </h3>
            <p className="text-[10px] text-yellow-700 dark:text-yellow-300">
              Các yêu cầu có thể thay đổi theo từng trường và từng đợt tuyển dụng. Vui lòng liên hệ
              để cập nhật thông tin mới nhất.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate("/topik-test")}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              Luyện thi TOPIK ngay
            </button>
            <button
              onClick={() => navigate("/duhoc-apply")}
              className="px-4 py-2 border border-orange-600/30 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium transition-colors"
            >
              Đăng ký tư vấn
            </button>
            <button
              onClick={() => navigate("/duhoc")}
              className="px-4 py-2 border border-orange-600/30 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
