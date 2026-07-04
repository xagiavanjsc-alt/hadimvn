import { useNavigate } from "react-router-dom";

const SCHOOLS = [
  {
    id: 1,
    name: "Đại học Seoul (SNU)",
    location: "Seoul",
    ranking: "Top 1 Hàn Quốc",
    majors: ["Kinh doanh", "Kỹ thuật", "Khoa học", "Y học"],
    tuition: "5.000 - 8.000 USD/năm",
  },
  {
    id: 2,
    name: "Đại học Hàn Quốc (KU)",
    location: "Seoul",
    ranking: "Top 2 Hàn Quốc",
    majors: ["Kinh doanh", "Luật", "Kỹ thuật", "Nghệ thuật"],
    tuition: "4.500 - 7.500 USD/năm",
  },
  {
    id: 3,
    name: "Đại học Yonsei",
    location: "Seoul",
    ranking: "Top 3 Hàn Quốc",
    majors: ["Y học", "Kinh doanh", "Khoa học xã hội", "Nghệ thuật"],
    tuition: "5.000 - 9.000 USD/năm",
  },
  {
    id: 4,
    name: "Đại học KAIST",
    location: "Daejeon",
    ranking: "Top 1 Kỹ thuật",
    majors: ["Kỹ thuật", "Khoa học máy tính", "Khoa học", "Kinh doanh"],
    tuition: "4.000 - 6.000 USD/năm",
  },
  {
    id: 5,
    name: "Đại học Pusan (PNU)",
    location: "Busan",
    ranking: "Top 5 Hàn Quốc",
    majors: ["Kỹ thuật", "Khoa học", "Kinh doanh", "Y học"],
    tuition: "3.500 - 6.000 USD/năm",
  },
  {
    id: 6,
    name: "Đại học Kyung Hee",
    location: "Seoul",
    ranking: "Top 10 Hàn Quốc",
    majors: ["Y học", "Kinh doanh", "Khoa học xã hội", "Nghệ thuật"],
    tuition: "4.000 - 7.000 USD/năm",
  },
];

export default function DuHocSchoolsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Trường đại học uy tín
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Danh sách các trường đại học hàng đầu Hàn Quốc
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {SCHOOLS.map((school) => (
              <div
                key={school.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {school.name}
                </h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 mb-2">
                  📍 {school.location}
                </p>
                <div className="mb-2">
                  <span className="inline-block px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-[10px] font-medium">
                    {school.ranking}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngành học:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {school.majors.map((major) => (
                      <span
                        key={major}
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-[10px]"
                      >
                        {major}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-300 mb-2">
                  💰 Học phí: {school.tuition}
                </p>
                <button
                  onClick={() => navigate("/duhoc-apply")}
                  className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Đăng ký tư vấn
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/duhoc")}
              className="px-4 py-2 border border-orange-600/30 text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium transition-colors"
            >
              Quay lại trang thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
