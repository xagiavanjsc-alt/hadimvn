import { Link } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const COMMISSION_TABLE = [
  { type: "VIP Tháng", price: "79.000đ", rate: "20%", earn: "15.800đ", color: "#34d399" },
  { type: "VIP Năm",   price: "708.000đ", rate: "20%", earn: "141.600đ", color: "#a78bfa" },
];

const BENEFITS = [
  {
    icon: "ri-money-dollar-circle-line",
    title: "Hoa hồng hấp dẫn",
    desc: "Nhận 20% trên mỗi đơn VIP thành công. Không giới hạn số lượng — càng nhiều bạn bè đăng ký, thu nhập càng cao.",
    color: "#34d399",
  },
  {
    icon: "ri-links-line",
    title: "Link riêng duy nhất",
    desc: "Mỗi CTV nhận 1 link cá nhân hóa. Khi ai đó đăng ký qua link của bạn, hệ thống tự động ghi nhận trong 30 ngày.",
    color: "#60a5fa",
  },
  {
    icon: "ri-bar-chart-2-line",
    title: "Thống kê minh bạch",
    desc: "Xem real-time số người giới thiệu, doanh thu phát sinh, hoa hồng tích lũy và lịch sử thanh toán chi tiết.",
    color: "#fb923c",
  },
  {
    icon: "ri-time-line",
    title: "Không cần bỏ vốn",
    desc: "Hoàn toàn miễn phí tham gia. Chỉ cần chia sẻ link — hệ thống tự theo dõi và tính hoa hồng cho bạn.",
    color: "#f472b6",
  },
  {
    icon: "ri-bank-card-line",
    title: "Thanh toán nhanh",
    desc: "Hoa hồng được chuyển khoản ngân hàng sau khi xác nhận. Admin duyệt trong 1-3 ngày làm việc.",
    color: "#a78bfa",
  },
  {
    icon: "ri-customer-service-2-line",
    title: "Hỗ trợ tận tình",
    desc: "CTV được hỗ trợ trực tiếp qua Zalo, tài liệu quảng bá và tư vấn chiến lược chia sẻ hiệu quả.",
    color: "#facc15",
  },
];

const STEPS = [
  { num: "01", title: "Đăng ký", desc: "Điền tên và số điện thoại. Admin duyệt trong 24h.", icon: "ri-user-add-line" },
  { num: "02", title: "Nhận link", desc: "Sau khi duyệt, bạn nhận link CTV riêng của mình.", icon: "ri-links-line" },
  { num: "03", title: "Chia sẻ", desc: "Chia sẻ lên Facebook, Zalo, TikTok hoặc bất kỳ đâu.", icon: "ri-share-forward-line" },
  { num: "04", title: "Nhận tiền", desc: "Bạn bè mua VIP → hoa hồng tự động cộng vào tài khoản.", icon: "ri-money-dollar-circle-line" },
];

const FAQS = [
  {
    q: "Hoa hồng được tính như thế nào?",
    a: "20% trên giá trị đơn hàng. VIP Tháng (79.000đ) → bạn nhận 15.800đ. VIP Năm (708.000đ) → bạn nhận 141.600đ.",
  },
  {
    q: "Khi nào tôi nhận được tiền?",
    a: "Sau khi admin xác nhận thanh toán, tiền sẽ được chuyển khoản trong 1-3 ngày làm việc qua ngân hàng bạn đăng ký.",
  },
  {
    q: "Link có thời hạn không?",
    a: "Link của bạn vĩnh viễn. Tuy nhiên, khi ai đó click link, hệ thống theo dõi trong 30 ngày — nếu họ đăng ký trong khoảng này sẽ được ghi nhận là của bạn.",
  },
  {
    q: "Có giới hạn số người giới thiệu không?",
    a: "Không giới hạn. Bạn có thể giới thiệu càng nhiều càng tốt.",
  },
  {
    q: "Nếu người dùng hủy VIP thì sao?",
    a: "Hoa hồng chỉ được tính khi admin xác nhận VIP thành công. Nếu hoàn tiền, hoa hồng sẽ bị hủy.",
  },
];

export default function CTVInfoPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Cộng Tác Viên" subtitle="Kiếm thu nhập cùng Hàn Quốc Ơi!">
      <div className="max-w-4xl mx-auto pb-16">

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-br from-rose-500/20 via-purple-500/10 to-transparent border border-rose-500/20 p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30 mb-5">
              <i className="ri-team-line text-rose-400 text-3xl"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white/95 mb-3">
              Chương trình Cộng Tác Viên
            </h1>
            <p className="text-base text-app-text-secondary max-w-xl mx-auto mb-2">
              Chia sẻ link — bạn bè đăng ký VIP — bạn nhận hoa hồng.
              <span className="text-rose-400 font-bold"> Đơn giản. Minh bạch. Không giới hạn.</span>
            </p>
            <p className="text-sm text-app-text-muted mb-8">Hoa hồng <span className="text-rose-400 font-black text-lg">20%</span> mỗi đơn VIP thành công</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/ctv"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm cursor-pointer transition-all"
              >
                <i className="ri-user-add-line"></i>
                {user ? "Vào trang CTV của tôi" : "Đăng ký CTV ngay"}
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/8 border border-app-border hover:bg-white/12 text-white/70 font-medium text-sm cursor-pointer transition-all"
              >
                <i className="ri-information-line"></i>
                Tìm hiểu thêm
              </a>
            </div>
          </div>
        </div>

        {/* Commission table */}
        <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-app-border">
            <h2 className="text-sm font-bold text-white/80 flex items-center gap-2">
              <i className="ri-coins-line text-amber-400"></i>
              Bảng hoa hồng
            </h2>
          </div>
          <div className="grid grid-cols-4 bg-app-card/70 px-5 py-2.5 text-[10px] font-semibold text-app-text-secondary border-b border-app-border">
            <span>Gói VIP</span><span className="text-center">Giá</span><span className="text-center">Tỉ lệ</span><span className="text-right">Bạn nhận</span>
          </div>
          {COMMISSION_TABLE.map((row, i) => (
            <div key={i} className="grid grid-cols-4 px-5 py-4 border-b border-white/5 last:border-0 items-center">
              <div className="flex items-center gap-2">
                <i className="ri-vip-crown-line" style={{ color: row.color }}></i>
                <span className="text-sm font-bold text-white/80">{row.type}</span>
              </div>
              <span className="text-sm text-center text-white/60">{row.price}</span>
              <span className="text-sm text-center font-bold text-amber-400">{row.rate}</span>
              <span className="text-sm font-black text-right" style={{ color: row.color }}>{row.earn}</span>
            </div>
          ))}
          <div className="px-5 py-3 bg-app-card/30">
            <p className="text-xs text-app-text-muted text-center">
              <i className="ri-information-line mr-1"></i>
              Hoa hồng được tính và cộng tự động ngay khi admin xác nhận VIP
            </p>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" className="mb-10">
          <h2 className="text-base font-bold text-white/80 mb-5 flex items-center gap-2">
            <i className="ri-map-pin-time-line text-rose-400"></i>
            Cách hoạt động
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="relative bg-app-card/50 border border-app-border rounded-2xl p-4 text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-2 z-10 text-app-text-muted text-xs">
                    <i className="ri-arrow-right-s-line"></i>
                  </div>
                )}
                <span className="text-[10px] font-black text-rose-400 bg-rose-500/15 border border-rose-500/25 rounded-full px-2 py-0.5 mb-3 inline-block">{step.num}</span>
                <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-rose-500/10 mb-3">
                  <i className={`${step.icon} text-rose-400 text-lg`}></i>
                </div>
                <p className="text-sm font-bold text-white/80 mb-1">{step.title}</p>
                <p className="text-xs text-app-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-white/80 mb-5 flex items-center gap-2">
            <i className="ri-gift-line text-amber-400"></i>
            Quyền lợi CTV
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex gap-4 bg-app-card/50 border border-app-border rounded-2xl p-4 hover:border-white/15 transition-colors">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: b.color + "15" }}>
                  <i className={`${b.icon} text-lg`} style={{ color: b.color }}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-white/80 mb-1">{b.title}</p>
                  <p className="text-xs text-app-text-secondary leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-white/80 mb-5 flex items-center gap-2">
            <i className="ri-question-answer-line text-blue-400"></i>
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-app-card/50 border border-app-border rounded-xl p-4">
                <p className="text-sm font-bold text-white/80 mb-1.5 flex items-start gap-2">
                  <span className="text-rose-400 flex-shrink-0">Q.</span>{faq.q}
                </p>
                <p className="text-sm text-app-text-secondary leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="text-center bg-gradient-to-br from-rose-500/15 to-purple-500/10 border border-rose-500/20 rounded-2xl p-8">
          <h3 className="text-lg font-black text-white/90 mb-2">Sẵn sàng kiếm thu nhập?</h3>
          <p className="text-sm text-app-text-secondary mb-6">Đăng ký miễn phí — nhận link trong 24h — bắt đầu chia sẻ ngay hôm nay</p>
          <Link
            to="/ctv"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer transition-all"
          >
            <i className="ri-team-line"></i>
            Đăng ký CTV ngay
          </Link>
          <p className="text-xs text-app-text-muted mt-4">
            <i className="ri-shield-check-line mr-1 text-app-accent-success"></i>
            Miễn phí tham gia · Không ràng buộc · Thanh toán minh bạch
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
