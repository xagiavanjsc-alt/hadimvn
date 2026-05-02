import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Phrase {
  id: string;
  korean: string;
  romanization: string;
  vietnamese: string;
  situation: string;
  level: "cơ bản" | "trung cấp" | "nâng cao";
  tags: string[];
  example?: string;
  exampleVi?: string;
  note?: string;
}

const SITUATIONS: { id: string; icon: string; color: string; label: string }[] = [
  { id: "all", icon: "ri-apps-line", color: "app-accent-primary", label: "Tất cả" },
  { id: "greetings", icon: "ri-hand-heart-line", color: "app-accent-primary", label: "Chào hỏi" },
  { id: "shopping", icon: "ri-shopping-bag-line", color: "#34d399", label: "Mua sắm" },
  { id: "restaurant", icon: "ri-restaurant-line", color: "#fb923c", label: "Nhà hàng" },
  { id: "transport", icon: "ri-bus-line", color: "#38bdf8", label: "Di chuyển" },
  { id: "hospital", icon: "ri-hospital-line", color: "#f87171", label: "Bệnh viện" },
  { id: "work", icon: "ri-briefcase-line", color: "#a78bfa", label: "Công việc" },
  { id: "hotel", icon: "ri-hotel-line", color: "#fbbf24", label: "Khách sạn" },
  { id: "phone", icon: "ri-phone-line", color: "#06b6d4", label: "Điện thoại" },
  { id: "bank", icon: "ri-bank-line", color: "#10b981", label: "Ngân hàng" },
  { id: "emergency", icon: "ri-alarm-warning-line", color: "#ef4444", label: "Khẩn cấp" },
  { id: "feelings", icon: "ri-emotion-line", color: "#f472b6", label: "Cảm xúc" },
  { id: "daily", icon: "ri-sun-line", color: "#fcd34d", label: "Hàng ngày" },
  { id: "study", icon: "ri-book-open-line", color: "#818cf8", label: "Học tập" },
];

const PHRASES: Phrase[] = [
  // Chào hỏi
  { id: "g1", korean: "안녕하세요", romanization: "Annyeonghaseyo", vietnamese: "Xin chào (lịch sự)", situation: "greetings", level: "cơ bản", tags: ["chào", "lịch sự"] },
  { id: "g2", korean: "처음 뵙겠습니다", romanization: "Cheoeum boepgesseumnida", vietnamese: "Rất vui được gặp bạn lần đầu", situation: "greetings", level: "cơ bản", tags: ["giới thiệu"] },
  { id: "g3", korean: "잘 부탁드립니다", romanization: "Jal butakdeurimnida", vietnamese: "Mong bạn giúp đỡ / Rất vui được làm quen", situation: "greetings", level: "cơ bản", tags: ["lịch sự", "giới thiệu"] },
  { id: "g4", korean: "오랜만이에요", romanization: "Oraenmanieyo", vietnamese: "Lâu rồi không gặp", situation: "greetings", level: "trung cấp", tags: ["gặp lại"] },
  { id: "g5", korean: "잘 지냈어요?", romanization: "Jal jinaesseoyo?", vietnamese: "Bạn có khỏe không?", situation: "greetings", level: "cơ bản", tags: ["hỏi thăm"] },
  { id: "g6", korean: "덕분에 잘 지냈어요", romanization: "Deokbune jal jinaesseoyo", vietnamese: "Nhờ bạn, tôi vẫn khỏe", situation: "greetings", level: "trung cấp", tags: ["trả lời", "lịch sự"] },
  { id: "g7", korean: "어디서 오셨어요?", romanization: "Eodiseo osyeosseoyo?", vietnamese: "Bạn đến từ đâu?", situation: "greetings", level: "cơ bản", tags: ["hỏi"] },
  { id: "g8", korean: "저는 베트남 사람이에요", romanization: "Jeoneun beteunam saramieyo", vietnamese: "Tôi là người Việt Nam", situation: "greetings", level: "cơ bản", tags: ["giới thiệu", "quốc tịch"] },
  // Mua sắm
  { id: "s1", korean: "얼마예요?", romanization: "Eolmayeyo?", vietnamese: "Bao nhiêu tiền?", situation: "shopping", level: "cơ bản", tags: ["giá", "hỏi"] },
  { id: "s2", korean: "이거 주세요", romanization: "Igeo juseyo", vietnamese: "Cho tôi cái này", situation: "shopping", level: "cơ bản", tags: ["mua", "yêu cầu"] },
  { id: "s3", korean: "할인 돼요?", romanization: "Halin dwaeyo?", vietnamese: "Có giảm giá không?", situation: "shopping", level: "trung cấp", tags: ["giảm giá"] },
  { id: "s4", korean: "카드 돼요?", romanization: "Kadeu dwaeyo?", vietnamese: "Thanh toán thẻ được không?", situation: "shopping", level: "cơ bản", tags: ["thanh toán", "thẻ"] },
  { id: "s5", korean: "영수증 주세요", romanization: "Yeongsujeung juseyo", vietnamese: "Cho tôi hóa đơn", situation: "shopping", level: "trung cấp", tags: ["hóa đơn"] },
  { id: "s6", korean: "다른 색깔 있어요?", romanization: "Dareun saekkal isseoyo?", vietnamese: "Có màu khác không?", situation: "shopping", level: "trung cấp", tags: ["màu sắc", "hỏi"] },
  { id: "s7", korean: "사이즈가 어떻게 돼요?", romanization: "Saijeuга eotteoke dwaeyo?", vietnamese: "Size như thế nào?", situation: "shopping", level: "trung cấp", tags: ["size", "quần áo"] },
  { id: "s8", korean: "교환할 수 있어요?", romanization: "Gyohwanhal su isseoyo?", vietnamese: "Có thể đổi hàng không?", situation: "shopping", level: "nâng cao", tags: ["đổi hàng"] },
  // Nhà hàng
  { id: "r1", korean: "메뉴 주세요", romanization: "Menyu juseyo", vietnamese: "Cho tôi xem thực đơn", situation: "restaurant", level: "cơ bản", tags: ["thực đơn"] },
  { id: "r2", korean: "이거 하나 주세요", romanization: "Igeo hana juseyo", vietnamese: "Cho tôi một cái này", situation: "restaurant", level: "cơ bản", tags: ["gọi món"] },
  { id: "r3", korean: "맛있어요!", romanization: "Massisseoyo!", vietnamese: "Ngon quá!", situation: "restaurant", level: "cơ bản", tags: ["khen", "đồ ăn"] },
  { id: "r4", korean: "계산해 주세요", romanization: "Gyesan hae juseyo", vietnamese: "Cho tôi tính tiền", situation: "restaurant", level: "cơ bản", tags: ["thanh toán"] },
  { id: "r5", korean: "포장해 주세요", romanization: "Pojang hae juseyo", vietnamese: "Cho tôi đóng gói mang về", situation: "restaurant", level: "trung cấp", tags: ["mang về"] },
  { id: "r6", korean: "맵지 않게 해 주세요", romanization: "Maepji ange hae juseyo", vietnamese: "Làm không cay nhé", situation: "restaurant", level: "trung cấp", tags: ["yêu cầu", "cay"] },
  { id: "r7", korean: "물 주세요", romanization: "Mul juseyo", vietnamese: "Cho tôi nước", situation: "restaurant", level: "cơ bản", tags: ["nước", "yêu cầu"] },
  { id: "r8", korean: "예약했어요", romanization: "Yeyakhaesseoyo", vietnamese: "Tôi đã đặt bàn trước", situation: "restaurant", level: "trung cấp", tags: ["đặt bàn"] },
  // Di chuyển
  { id: "t1", korean: "___에 어떻게 가요?", romanization: "___ e eotteoke gayo?", vietnamese: "Đi đến ___ như thế nào?", situation: "transport", level: "cơ bản", tags: ["hỏi đường"] },
  { id: "t2", korean: "지하철역이 어디예요?", romanization: "Jihacheollyeogi eodiyeyo?", vietnamese: "Ga tàu điện ngầm ở đâu?", situation: "transport", level: "cơ bản", tags: ["tàu điện ngầm"] },
  { id: "t3", korean: "여기서 내려 주세요", romanization: "Yeogiseo naeryeo juseyo", vietnamese: "Cho tôi xuống ở đây", situation: "transport", level: "cơ bản", tags: ["taxi", "xe buýt"] },
  { id: "t4", korean: "얼마나 걸려요?", romanization: "Eolmana geollyeoyo?", vietnamese: "Mất bao lâu?", situation: "transport", level: "cơ bản", tags: ["thời gian"] },
  { id: "t5", korean: "길을 잃었어요", romanization: "Gireul ireoesseoyo", vietnamese: "Tôi bị lạc đường", situation: "transport", level: "trung cấp", tags: ["lạc đường"] },
  { id: "t6", korean: "직진하세요", romanization: "Jikjinhaseyo", vietnamese: "Đi thẳng", situation: "transport", level: "cơ bản", tags: ["chỉ đường"] },
  { id: "t7", korean: "왼쪽으로 가세요", romanization: "Oenjjogeuro gaseyo", vietnamese: "Rẽ trái", situation: "transport", level: "cơ bản", tags: ["chỉ đường"] },
  { id: "t8", korean: "오른쪽으로 가세요", romanization: "Oreunjjogeuro gaseyo", vietnamese: "Rẽ phải", situation: "transport", level: "cơ bản", tags: ["chỉ đường"] },
  // Bệnh viện
  { id: "h1", korean: "아파요", romanization: "Apayo", vietnamese: "Tôi đau / Tôi bị ốm", situation: "hospital", level: "cơ bản", tags: ["đau", "ốm"] },
  { id: "h2", korean: "머리가 아파요", romanization: "Meoriga apayo", vietnamese: "Tôi đau đầu", situation: "hospital", level: "cơ bản", tags: ["đau đầu"] },
  { id: "h3", korean: "배가 아파요", romanization: "Baega apayo", vietnamese: "Tôi đau bụng", situation: "hospital", level: "cơ bản", tags: ["đau bụng"] },
  { id: "h4", korean: "약이 필요해요", romanization: "Yagi piryohaeyo", vietnamese: "Tôi cần thuốc", situation: "hospital", level: "cơ bản", tags: ["thuốc"] },
  { id: "h5", korean: "진찰 받고 싶어요", romanization: "Jinchal batgo sipeoyo", vietnamese: "Tôi muốn được khám bệnh", situation: "hospital", level: "trung cấp", tags: ["khám bệnh"] },
  { id: "h6", korean: "보험이 있어요", romanization: "Boheomi isseoyo", vietnamese: "Tôi có bảo hiểm", situation: "hospital", level: "trung cấp", tags: ["bảo hiểm"] },
  { id: "h7", korean: "알레르기가 있어요", romanization: "Allereugiга isseoyo", vietnamese: "Tôi bị dị ứng", situation: "hospital", level: "trung cấp", tags: ["dị ứng"] },
  // Công việc
  { id: "w1", korean: "수고하셨습니다", romanization: "Sugohasyeosseumnida", vietnamese: "Cảm ơn vì đã vất vả", situation: "work", level: "cơ bản", tags: ["lịch sự", "tan ca"] },
  { id: "w2", korean: "잠깐만요", romanization: "Jamkkanmanyo", vietnamese: "Chờ một chút", situation: "work", level: "cơ bản", tags: ["chờ"] },
  { id: "w3", korean: "다시 한번 말씀해 주세요", romanization: "Dasi hanbeon malsseum hae juseyo", vietnamese: "Xin nói lại một lần nữa", situation: "work", level: "cơ bản", tags: ["nhờ nhắc lại"] },
  { id: "w4", korean: "천천히 말씀해 주세요", romanization: "Cheoncheonhi malsseum hae juseyo", vietnamese: "Xin nói chậm thôi", situation: "work", level: "cơ bản", tags: ["nhờ nói chậm"] },
  { id: "w5", korean: "야근해야 해요", romanization: "Yageunhaeya haeyo", vietnamese: "Tôi phải làm thêm giờ", situation: "work", level: "trung cấp", tags: ["làm thêm giờ"] },
  { id: "w6", korean: "월급날이 언제예요?", romanization: "Wolgeumnari eonjeyeyo?", vietnamese: "Ngày lương là khi nào?", situation: "work", level: "cơ bản", tags: ["lương"] },
  // Khách sạn
  { id: "ho1", korean: "체크인 하고 싶어요", romanization: "Chekeu-in hago sipeoyo", vietnamese: "Tôi muốn nhận phòng", situation: "hotel", level: "cơ bản", tags: ["check-in"] },
  { id: "ho2", korean: "예약했어요", romanization: "Yeyakhaesseoyo", vietnamese: "Tôi đã đặt phòng trước", situation: "hotel", level: "cơ bản", tags: ["đặt phòng"] },
  { id: "ho3", korean: "방이 너무 시끄러워요", romanization: "Bangi neomu sikkeureowo", vietnamese: "Phòng quá ồn ào", situation: "hotel", level: "trung cấp", tags: ["phàn nàn"] },
  { id: "ho4", korean: "와이파이 비밀번호가 뭐예요?", romanization: "Waipai bimilbeonhoga mwoyeyo?", vietnamese: "Mật khẩu wifi là gì?", situation: "hotel", level: "cơ bản", tags: ["wifi"] },
  { id: "ho5", korean: "체크아웃은 몇 시예요?", romanization: "Chekeu-aouseun myeot siyeyo?", vietnamese: "Check-out lúc mấy giờ?", situation: "hotel", level: "trung cấp", tags: ["check-out"] },
  // Điện thoại
  { id: "p1", korean: "여보세요?", romanization: "Yeoboseyo?", vietnamese: "A lô?", situation: "phone", level: "cơ bản", tags: ["điện thoại"] },
  { id: "p2", korean: "잠깐만 기다려 주세요", romanization: "Jamkkanman gidaryeo juseyo", vietnamese: "Xin chờ một chút", situation: "phone", level: "cơ bản", tags: ["chờ"] },
  { id: "p3", korean: "전화 잘못 걸었어요", romanization: "Jeonhwa jalmot georeosseoyo", vietnamese: "Tôi gọi nhầm số", situation: "phone", level: "trung cấp", tags: ["nhầm số"] },
  { id: "p4", korean: "카카오톡 있어요?", romanization: "Kakaotok isseoyo?", vietnamese: "Bạn có KakaoTalk không?", situation: "phone", level: "cơ bản", tags: ["KakaoTalk", "mạng xã hội"] },
  { id: "p5", korean: "배터리가 없어요", romanization: "Baeteorига eopseoyo", vietnamese: "Hết pin rồi", situation: "phone", level: "cơ bản", tags: ["pin"] },
  // Ngân hàng
  { id: "b1", korean: "계좌를 만들고 싶어요", romanization: "Gyejwareul mandeulgo sipeoyo", vietnamese: "Tôi muốn mở tài khoản", situation: "bank", level: "trung cấp", tags: ["tài khoản"] },
  { id: "b2", korean: "환전하고 싶어요", romanization: "Hwanjeonhago sipeoyo", vietnamese: "Tôi muốn đổi tiền", situation: "bank", level: "cơ bản", tags: ["đổi tiền"] },
  { id: "b3", korean: "ATM이 어디예요?", romanization: "ATM-i eodiyeyo?", vietnamese: "ATM ở đâu?", situation: "bank", level: "cơ bản", tags: ["ATM"] },
  { id: "b4", korean: "송금하고 싶어요", romanization: "Songgeum hago sipeoyo", vietnamese: "Tôi muốn chuyển tiền", situation: "bank", level: "trung cấp", tags: ["chuyển tiền"] },
  // Khẩn cấp
  { id: "e1", korean: "도와주세요!", romanization: "Dowajuseyo!", vietnamese: "Cứu tôi với! / Giúp tôi với!", situation: "emergency", level: "cơ bản", tags: ["khẩn cấp"] },
  { id: "e2", korean: "119에 전화해 주세요", romanization: "119e jeonhwa hae juseyo", vietnamese: "Gọi 119 cho tôi (cấp cứu)", situation: "emergency", level: "cơ bản", tags: ["cấp cứu", "119"] },
  { id: "e3", korean: "경찰을 불러 주세요", romanization: "Gyeongchareul bulleo juseyo", vietnamese: "Gọi cảnh sát cho tôi", situation: "emergency", level: "cơ bản", tags: ["cảnh sát", "112"] },
  { id: "e4", korean: "지갑을 잃어버렸어요", romanization: "Jigabeul ireobeoryeosseoyo", vietnamese: "Tôi bị mất ví", situation: "emergency", level: "trung cấp", tags: ["mất đồ"] },
  { id: "e5", korean: "한국어를 잘 못해요", romanization: "Hangugeoreul jal motaeyo", vietnamese: "Tôi không giỏi tiếng Hàn", situation: "emergency", level: "cơ bản", tags: ["ngôn ngữ"] },
  // Cảm xúc
  { id: "f1", korean: "좋아요!", romanization: "Joayo!", vietnamese: "Tốt! / Tôi thích!", situation: "feelings", level: "cơ bản", tags: ["thích"] },
  { id: "f2", korean: "대박이에요!", romanization: "Daebagieyo!", vietnamese: "Tuyệt vời! / Đỉnh quá!", situation: "feelings", level: "cơ bản", tags: ["khen"] },
  { id: "f3", korean: "괜찮아요", romanization: "Gwaenchanayo", vietnamese: "Không sao / Ổn thôi", situation: "feelings", level: "cơ bản", tags: ["ổn"] },
  { id: "f4", korean: "정말요?", romanization: "Jeongmallyo?", vietnamese: "Thật không?", situation: "feelings", level: "cơ bản", tags: ["ngạc nhiên"] },
  { id: "f5", korean: "화가 났어요", romanization: "Hwaga nasseoyo", vietnamese: "Tôi tức giận", situation: "feelings", level: "trung cấp", tags: ["tức giận"] },
  // Hàng ngày
  { id: "d1", korean: "밥 먹었어요?", romanization: "Bap meogeosseoyo?", vietnamese: "Bạn ăn cơm chưa?", situation: "daily", level: "cơ bản", tags: ["ăn uống", "hỏi thăm"] },
  { id: "d2", korean: "잘 자요", romanization: "Jal jayo", vietnamese: "Ngủ ngon", situation: "daily", level: "cơ bản", tags: ["chào tạm biệt"] },
  { id: "d3", korean: "피곤해요", romanization: "Pigonhaeyo", vietnamese: "Tôi mệt", situation: "daily", level: "cơ bản", tags: ["mệt"] },
  { id: "d4", korean: "배고파요", romanization: "Baegopayo", vietnamese: "Tôi đói", situation: "daily", level: "cơ bản", tags: ["đói"] },
  { id: "d5", korean: "오늘 날씨가 좋네요", romanization: "Oneul nalssiga jonnaeyo", vietnamese: "Hôm nay thời tiết đẹp nhỉ", situation: "daily", level: "cơ bản", tags: ["thời tiết"] },
  // Học tập
  { id: "st1", korean: "한국어를 공부하고 있어요", romanization: "Hangugeoreul gongbu hago isseoyo", vietnamese: "Tôi đang học tiếng Hàn", situation: "study", level: "cơ bản", tags: ["học tiếng Hàn"] },
  { id: "st2", korean: "이게 무슨 뜻이에요?", romanization: "Ige museun tteuseyo?", vietnamese: "Cái này có nghĩa là gì?", situation: "study", level: "cơ bản", tags: ["hỏi nghĩa"] },
  { id: "st3", korean: "한국어로 뭐라고 해요?", romanization: "Hangugeoro mworago haeyo?", vietnamese: "Tiếng Hàn nói thế nào?", situation: "study", level: "cơ bản", tags: ["hỏi từ"] },
  { id: "st4", korean: "천천히 말해 주세요", romanization: "Cheoncheonhi malhae juseyo", vietnamese: "Nói chậm thôi nhé", situation: "study", level: "cơ bản", tags: ["nhờ nói chậm"] },
  { id: "st5", korean: "다시 한번 말해 주세요", romanization: "Dasi hanbeon malhae juseyo", vietnamese: "Nói lại một lần nữa nhé", situation: "study", level: "cơ bản", tags: ["nhờ nhắc lại"] },
];

// ─── Phrase Card ──────────────────────────────────────────────────────────────
function PhraseCard({ phrase, isFavorite, onToggleFavorite }: {
  phrase: Phrase;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [showRoman, setShowRoman] = useState(false);
  const [copied, setCopied] = useState(false);
  const levelColor = phrase.level === "cơ bản" ? "#34d399" : phrase.level === "trung cấp" ? "app-accent-primary" : "#f87171";

  const speak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(phrase.korean);
    u.lang = "ko-KR";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const copy = () => {
    navigator.clipboard.writeText(phrase.korean).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const sit = SITUATIONS.find(s => s.id === phrase.situation);

  return (
    <div className="bg-app-bg border border-app-border rounded-xl p-4 hover:border-app-border transition-all group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>
              {phrase.level}
            </span>
            {sit && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${sit.color}10`, color: sit.color }}>
                <i className={`${sit.icon} mr-0.5`}></i>{sit.label}
              </span>
            )}
          </div>
          <p className="text-white font-bold text-xl leading-tight">{phrase.korean}</p>
          {showRoman && <p className="text-app-text-secondary text-xs italic mt-0.5">{phrase.romanization}</p>}
          <p className="text-white/60 text-sm mt-1">{phrase.vietnamese}</p>
          {phrase.note && <p className="text-app-accent-primary/50 text-[10px] mt-1 italic">{phrase.note}</p>}
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <button onClick={() => onToggleFavorite(phrase.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isFavorite ? "text-app-accent-primary bg-app-accent-primary/10" : "text-app-text-muted hover:text-white/50 hover:bg-app-card/50"}`}>
            <i className={isFavorite ? "ri-star-fill text-sm" : "ri-star-line text-sm"}></i>
          </button>
          <button onClick={speak}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/70 transition-colors cursor-pointer">
            <i className="ri-volume-up-line text-sm"></i>
          </button>
          <button onClick={copy}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${copied ? "bg-emerald-500/20 text-app-accent-success" : "bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/70"}`}>
            <i className={`${copied ? "ri-check-line" : "ri-file-copy-line"} text-sm`}></i>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <button onClick={() => setShowRoman(v => !v)}
          className="text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer whitespace-nowrap transition-colors">
          {showRoman ? "Ẩn phiên âm" : "Phiên âm"}
        </button>
        {phrase.tags.map(tag => (
          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-app-surface/50 text-app-text-muted border border-app-border">#{tag}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PhraseDictionaryPage() {
  const [situation, setSituation] = useState("all");
  const [level, setLevel] = useState<"all" | "cơ bản" | "trung cấp" | "nâng cao">("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useLocalStorage<string[]>("kts_phrase_dict_favs", []);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    let list = [...PHRASES];
    if (situation !== "all") list = list.filter(p => p.situation === situation);
    if (level !== "all") list = list.filter(p => p.level === level);
    if (showFavsOnly) list = list.filter(p => favorites.includes(p.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.korean.includes(q) ||
        p.vietnamese.toLowerCase().includes(q) ||
        p.romanization.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    return list;
  }, [situation, level, search, showFavsOnly, favorites]);

  const practiceList = useMemo(() => filtered.filter(p => favorites.includes(p.id)), [filtered, favorites]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  if (practiceMode && practiceList.length > 0) {
    const current = practiceList[practiceIdx % practiceList.length];
    const sit = SITUATIONS.find(s => s.id === current.situation);
    return (
      <DashboardLayout title="Luyện tập từ điển giao tiếp" subtitle="Flashcard câu đã lưu yêu thích">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setPracticeMode(false); setShowAnswer(false); setPracticeIdx(0); }}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm cursor-pointer whitespace-nowrap">
              <i className="ri-arrow-left-line"></i>Quay lại
            </button>
            <span className="text-app-text-muted text-sm">{(practiceIdx % practiceList.length) + 1} / {practiceList.length}</span>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center mb-4 min-h-[260px] flex flex-col items-center justify-center">
            {sit && (
              <span className="text-[10px] px-2 py-0.5 rounded-full mb-4" style={{ backgroundColor: `${sit.color}15`, color: sit.color }}>
                <i className={`${sit.icon} mr-1`}></i>{sit.label}
              </span>
            )}
            <p className="text-white font-black text-4xl mb-3">{current.korean}</p>
            {showAnswer ? (
              <div className="mt-4 space-y-2">
                <p className="text-white/50 text-sm italic">{current.romanization}</p>
                <p className="text-app-accent-primary font-semibold text-lg">{current.vietnamese}</p>
              </div>
            ) : (
              <button onClick={() => setShowAnswer(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 text-sm cursor-pointer whitespace-nowrap transition-colors">
                Xem nghĩa
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => speak(current.korean)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-white/50 hover:bg-app-card/50 text-sm cursor-pointer whitespace-nowrap transition-colors">
              <i className="ri-volume-up-line"></i>Nghe
            </button>
            <button onClick={() => { setPracticeIdx(i => i + 1); setShowAnswer(false); }}
              className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
              Tiếp theo <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Từ Điển Giao Tiếp"
      subtitle="Tìm kiếm nhanh câu giao tiếp theo tình huống — lọc theo mức độ khó"
      actions={
        favorites.length > 0 ? (
          <button onClick={() => { setPracticeMode(true); setPracticeIdx(0); setShowAnswer(false); }}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-play-line"></i>Luyện tập ({favorites.length})
          </button>
        ) : undefined
      }
    >
      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm câu tiếng Hàn, tiếng Việt, tag..."
            className="w-full bg-app-bg border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20" />
        </div>
        <div className="flex items-center gap-1 bg-app-surface/50 p-1 rounded-lg">
          {(["all", "cơ bản", "trung cấp", "nâng cao"] as const).map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${level === l ? "bg-app-card/70 text-white" : "text-app-text-secondary hover:text-white/60"}`}>
              {l === "all" ? "Tất cả" : l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowFavsOnly(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${showFavsOnly ? "bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary" : "bg-app-surface/50 border border-app-border text-app-text-secondary hover:text-white/60"}`}>
          <i className={showFavsOnly ? "ri-star-fill" : "ri-star-line"}></i>
          Yêu thích ({favorites.length})
        </button>
      </div>

      {/* Situation tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SITUATIONS.map(s => (
          <button key={s.id} onClick={() => setSituation(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${situation === s.id ? "border" : "bg-app-surface/50 text-app-text-secondary border border-app-border hover:text-white/60"}`}
            style={situation === s.id ? { backgroundColor: `${s.color}15`, color: s.color, borderColor: `${s.color}30` } : {}}>
            <i className={s.icon}></i>{s.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-app-text-muted text-xs">{filtered.length} câu tìm thấy</p>
        <div className="flex items-center gap-3">
          <span className="text-app-text-muted text-xs">{favorites.length} đã lưu</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <i className="ri-search-line text-white/10 text-4xl mb-3"></i>
          <p className="text-app-text-muted text-sm">Không tìm thấy câu nào</p>
          <p className="text-app-text-muted text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => (
            <PhraseCard key={p.id} phrase={p} isFavorite={favorites.includes(p.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
