import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function DuHocApplyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.display_name || "",
    email: user?.email || "",
    phone: "",
    currentEducation: "",
    targetLevel: "",
    topikScore: "",
    preferredMajor: "",
    budget: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Supabase or send to email
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Đăng ký thành công!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Chúng tôi sẽ liên hệ với bạn trong vòng 24-48 giờ để tư vấn chi tiết.
          </p>
          <button
            onClick={() => navigate("/duhoc")}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Quay lại trang thông tin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đăng ký du học Hàn Quốc
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
              Điền thông tin bên dưới để nhận tư vấn miễn phí
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trình độ học vấn hiện tại *
                </label>
                <select
                  required
                  value={formData.currentEducation}
                  onChange={(e) => setFormData({ ...formData, currentEducation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Chọn trình độ</option>
                  <option value="high">THPT</option>
                  <option value="college">Cao đẳng</option>
                  <option value="bachelor">Đại học</option>
                  <option value="master">Thạc sĩ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cấp độ mong muốn *
                </label>
                <select
                  required
                  value={formData.targetLevel}
                  onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Chọn cấp độ</option>
                  <option value="language">Học tiếng Hàn</option>
                  <option value="college">Cao đẳng chuyên nghiệp</option>
                  <option value="bachelor">Đại học</option>
                  <option value="master">Thạc sĩ</option>
                  <option value="phd">Tiến sĩ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Điểm TOPIK (nếu có)
                </label>
                <input
                  type="text"
                  value={formData.topikScore}
                  onChange={(e) => setFormData({ ...formData, topikScore: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ví dụ: TOPIK II 4 cấp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngành học mong muốn
                </label>
                <select
                  value={formData.preferredMajor}
                  onChange={(e) => setFormData({ ...formData, preferredMajor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Chọn ngành học</option>
                  <option value="korean">Ngôn ngữ Hàn</option>
                  <option value="business">Kinh doanh</option>
                  <option value="engineering">Kỹ thuật</option>
                  <option value="it">Công nghệ thông tin</option>
                  <option value="art">Nghệ thuật</option>
                  <option value="medicine">Y học</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ngân sách dự kiến
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Chọn ngân sách</option>
                  <option value="under10">Dưới 10.000 USD/năm</option>
                  <option value="10-15">10.000 - 15.000 USD/năm</option>
                  <option value="15-20">15.000 - 20.000 USD/năm</option>
                  <option value="over20">Trên 20.000 USD/năm</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/duhoc")}
                  className="flex-1 px-4 py-2 border border-orange-600/30 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium transition-colors"
                >
                  Quay lại
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-medium transition-colors">
                  Gửi đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
