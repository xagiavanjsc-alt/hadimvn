import { useState, useMemo } from "react";
import { useHanjaData } from "@/contexts/HanjaDataContext";

// Mapping Hán tự → Hán Việt đọc (phiên âm Hán Việt)
const HANVIET_MAP: Record<string, string> = {
  "國": "quốc", "家": "gia", "民": "dân", "學": "học", "大": "đại",
  "文": "văn", "力": "lực", "人": "nhân", "心": "tâm", "生": "sinh",
  "水": "thủy", "白": "bạch", "方": "phương", "中": "trung", "日": "nhật",
  "本": "bản", "語": "ngữ", "言": "ngôn", "書": "thư", "字": "tự",
  "年": "niên", "月": "nguyệt", "時": "thời", "間": "gian", "地": "địa",
  "天": "thiên", "山": "sơn", "海": "hải", "川": "xuyên", "木": "mộc",
  "火": "hỏa", "金": "kim", "土": "thổ", "王": "vương", "子": "tử",
  "女": "nữ", "男": "nam", "父": "phụ", "母": "mẫu", "兄": "huynh",
  "弟": "đệ", "姉": "tỷ", "妹": "muội", "友": "hữu", "先": "tiên",
  "後": "hậu", "上": "thượng", "下": "hạ", "左": "tả", "右": "hữu",
  "前": "tiền", "東": "đông", "西": "tây", "南": "nam", "北": "bắc",
  "新": "tân", "古": "cổ", "長": "trường", "短": "đoản", "高": "cao",
  "低": "đê", "小": "tiểu", "多": "đa", "少": "thiểu",
  "好": "hảo", "悪": "ác", "美": "mỹ", "醜": "xú", "強": "cường",
  "弱": "nhược", "速": "tốc", "遅": "trì", "重": "trọng", "軽": "khinh",
  "政": "chính", "治": "trị", "経": "kinh", "済": "tế", "社": "xã",
  "会": "hội", "国": "quốc", "際": "tế", "関": "quan", "係": "hệ",
  "問": "vấn", "題": "đề", "答": "đáp", "案": "án", "法": "pháp",
  "律": "luật", "規": "quy", "則": "tắc", "制": "chế", "度": "độ",
  "権": "quyền", "利": "lợi", "義": "nghĩa", "務": "vụ", "責": "trách",
  "任": "nhiệm", "命": "mệnh", "令": "lệnh", "指": "chỉ", "示": "thị",
  "教": "giáo", "育": "dục", "師": "sư", "徒": "đồ",
  "校": "hiệu", "院": "viện", "館": "quán", "所": "sở", "場": "trường",
  "市": "thị", "町": "đinh", "村": "thôn", "区": "khu", "都": "đô",
  "府": "phủ", "県": "huyện", "省": "tỉnh", "道": "đạo", "路": "lộ",
  "橋": "kiều", "門": "môn", "窓": "song", "壁": "bích", "床": "sàng",
  "机": "kỷ", "椅": "ỷ", "台": "đài", "箱": "tương", "袋": "đại",
  "服": "phục", "着": "trước", "帽": "mạo", "靴": "hài", "鞄": "bao",
  "食": "thực", "飲": "ẩm", "料": "liệu", "理": "lý", "味": "vị",
  "香": "hương", "色": "sắc", "形": "hình", "様": "dạng", "種": "chủng",
  "類": "loại", "品": "phẩm", "物": "vật", "事": "sự", "件": "kiện",
  "情": "tình", "感": "cảm", "思": "tư", "想": "tưởng", "考": "khảo",
  "知": "tri", "識": "thức", "見": "kiến", "聞": "văn", "読": "đọc",
  "話": "thoại", "聴": "thính", "視": "thị", "観": "quan",
  "察": "sát", "研": "nghiên", "究": "cứu", "発": "phát", "明": "minh",
  "作": "tác", "術": "thuật", "技": "kỹ", "能": "năng",
  "才": "tài", "芸": "nghệ",
  "音": "âm", "楽": "nhạc", "歌": "ca", "舞": "vũ", "劇": "kịch",
  "映": "ánh", "画": "họa", "写": "tả", "真": "chân", "像": "tượng",
  "体": "thể", "健": "kiện", "康": "khang", "病": "bệnh", "医": "y",
  "薬": "dược", "療": "liệu", "手": "thủ",
  "科": "khoa", "実": "thực",
  "験": "nghiệm", "証": "chứng", "確": "xác", "認": "nhận",
  "同": "đồng", "共": "cộng", "協": "hiệp",
  "援": "viện", "助": "trợ", "支": "chi", "持": "trì", "維": "duy",
  "保": "bảo", "護": "hộ", "守": "thủ", "防": "phòng", "衛": "vệ",
  "戦": "chiến", "争": "tranh", "闘": "đấu", "勝": "thắng", "敗": "bại",
  "平": "bình", "和": "hòa", "安": "an", "全": "toàn", "完": "hoàn",
  "成": "thành", "功": "công", "績": "tích", "果": "quả", "結": "kết",
  "終": "chung", "始": "thủy", "開": "khai", "閉": "bế", "入": "nhập",
  "出": "xuất", "来": "lai", "去": "khứ", "帰": "quy", "移": "di",
  "動": "động", "静": "tĩnh", "変": "biến", "化": "hóa", "進": "tiến",
  "退": "thoái", "増": "tăng", "減": "giảm", "拡": "khuếch", "縮": "thu",
  "連": "liên", "続": "tục", "断": "đoạn", "切": "thiết", "分": "phân",
  "割": "cát", "合": "hợp", "併": "tịnh", "統": "thống", "一": "nhất",
  "二": "nhị", "三": "tam", "四": "tứ", "五": "ngũ", "六": "lục",
  "七": "thất", "八": "bát", "九": "cửu", "十": "thập", "百": "bách",
  "千": "thiên", "万": "vạn", "億": "ức", "兆": "triệu",
};

// Tạo dữ liệu so sánh từ HANJA_DATA
interface CompareEntry {
  korean: string;
  hanja: string;
  vietnamese: string;
  hanviet: string; // phiên âm Hán Việt
  similarity: "identical" | "similar" | "different";
  note?: string;
}

function buildHanViet(hanja: string): string {
  return Array.from(hanja)
    .map(c => HANVIET_MAP[c] || "")
    .filter(Boolean)
    .join(" ");
}

function calcSimilarity(korean: string, vietnamese: string, hanviet: string): "identical" | "similar" | "different" {
  if (!hanviet) return "different";
  const viWords = vietnamese.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const hvWords = hanviet.toLowerCase().split(/\s+/).filter(Boolean);
  // Check if any HV word appears in Vietnamese meaning
  const hasMatch = hvWords.some(hv => viWords.some(vi => vi.includes(hv) || hv.includes(vi)));
  if (hasMatch) return "identical";
  // Partial match
  const partialMatch = hvWords.some(hv => viWords.some(vi => {
    const shorter = hv.length < vi.length ? hv : vi;
    const longer = hv.length >= vi.length ? hv : vi;
    return longer.includes(shorter) && shorter.length >= 2;
  }));
  return partialMatch ? "similar" : "different";
}


// Curated examples for the "spotlight" section
const SPOTLIGHT_EXAMPLES = [
  { korean: "국가", hanja: "國家", vietnamese: "Quốc gia", hanviet: "quốc gia", note: "Giống hệt! 국(國)=quốc, 가(家)=gia" },
  { korean: "학교", hanja: "學校", vietnamese: "Trường học", hanviet: "học hiệu", note: "학(學)=học — cùng gốc!" },
  { korean: "경제", hanja: "經濟", vietnamese: "Kinh tế", hanviet: "kinh tế", note: "Giống hệt! 경(經)=kinh, 제(濟)=tế" },
  { korean: "사회", hanja: "社會", vietnamese: "Xã hội", hanviet: "xã hội", note: "Giống hệt! 사(社)=xã, 회(會)=hội" },
  { korean: "문화", hanja: "文化", vietnamese: "Văn hóa", hanviet: "văn hóa", note: "Giống hệt! 문(文)=văn, 화(化)=hóa" },
  { korean: "정치", hanja: "政治", vietnamese: "Chính trị", hanviet: "chính trị", note: "Giống hệt! 정(政)=chính, 치(治)=trị" },
  { korean: "역사", hanja: "歷史", vietnamese: "Lịch sử", hanviet: "lịch sử", note: "Giống hệt! 역(歷)=lịch, 사(史)=sử" },
  { korean: "의사", hanja: "醫師", vietnamese: "Bác sĩ", hanviet: "y sư", note: "의(醫)=y, 사(師)=sư/sĩ — gần giống!" },
  { korean: "교육", hanja: "敎育", vietnamese: "Giáo dục", hanviet: "giáo dục", note: "Giống hệt! 교(敎)=giáo, 육(育)=dục" },
  { korean: "민주", hanja: "民主", vietnamese: "Dân chủ", hanviet: "dân chủ", note: "Giống hệt! 민(民)=dân, 주(主)=chủ" },
  { korean: "자유", hanja: "自由", vietnamese: "Tự do", hanviet: "tự do", note: "Giống hệt! 자(自)=tự, 유(由)=do" },
  { korean: "평화", hanja: "平和", vietnamese: "Hòa bình", hanviet: "bình hòa", note: "평(平)=bình, 화(和)=hòa — đảo thứ tự!" },
];

export default function HanVietCompareTab() {
  const HANJA_DATA = useHanjaData();
  const COMPARE_DATA = useMemo<CompareEntry[]>(() => HANJA_DATA
    .filter(e => e.hanja && e.hanja.length >= 2)
    .map(e => {
      const hanviet = buildHanViet(e.hanja);
      return { korean: e.korean, hanja: e.hanja, vietnamese: e.vietnamese, hanviet, similarity: calcSimilarity(e.korean, e.vietnamese, hanviet) };
    })
    .filter(e => e.hanviet.length > 0), [HANJA_DATA]);
  const [filter, setFilter] = useState<"all" | "identical" | "similar" | "different">("identical");
  const [search, setSearch] = useState("");
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const filtered = useMemo(() => {
    let data = COMPARE_DATA;
    if (filter !== "all") data = data.filter(e => e.similarity === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(e =>
        e.korean.includes(q) ||
        e.hanja.includes(q) ||
        e.vietnamese.toLowerCase().includes(q) ||
        e.hanviet.toLowerCase().includes(q)
      );
    }
    return data.slice(0, 100);
  }, [filter, search]);

  const stats = useMemo(() => ({
    identical: COMPARE_DATA.filter(e => e.similarity === "identical").length,
    similar: COMPARE_DATA.filter(e => e.similarity === "similar").length,
    different: COMPARE_DATA.filter(e => e.similarity === "different").length,
    total: COMPARE_DATA.length,
  }), []);

  const quizPool = useMemo(() => SPOTLIGHT_EXAMPLES.sort(() => Math.random() - 0.5), []);
  const currentQuiz = quizPool[quizIdx % quizPool.length];

  const handleQuizAnswer = (correct: boolean) => {
    setQuizScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
    setQuizRevealed(true);
  };

  const nextQuiz = () => {
    setQuizIdx(i => i + 1);
    setQuizRevealed(false);
  };

  const similarityConfig = {
    identical: { label: "Giống hệt", color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "ri-check-double-line" },
    similar: { label: "Gần giống", color: "#fb923c", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "ri-check-line" },
    different: { label: "Khác nhau", color: "#f43f5e", bg: "bg-app-accent-primary/10", border: "border-app-accent-primary/20", icon: "ri-close-line" },
  };

  return (
    <div className="space-y-5">
      {/* Header insight */}
      <div className="bg-gradient-to-r from-emerald-500/100/10 to-[#0f1117] border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-app-accent-success/15 rounded-xl flex-shrink-0">
            <i className="ri-lightbulb-line text-app-accent-success text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-1">Người Việt học tiếng Hàn nhanh hơn nhờ Hán tự chung!</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Tiếng Hàn và tiếng Việt đều có nguồn gốc từ chữ Hán. Khoảng <span className="text-app-accent-success font-bold">60-70%</span> từ vựng tiếng Hàn là từ Hán-Hàn, 
              và nhiều từ trong số đó <span className="text-app-accent-success font-bold">đọc gần giống</span> tiếng Việt!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            { label: "Giống hệt", value: stats.identical, color: "#34d399", pct: Math.round((stats.identical / stats.total) * 100) },
            { label: "Gần giống", value: stats.similar, color: "#fb923c", pct: Math.round((stats.similar / stats.total) * 100) },
            { label: "Khác nhau", value: stats.different, color: "#f43f5e", pct: Math.round((stats.different / stats.total) * 100) },
          ].map(s => (
            <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
              <p className="text-app-text-muted text-[10px]">{s.pct}% tổng số</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spotlight examples */}
      {showSpotlight && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="ri-star-line text-amber-400 text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Ví dụ nổi bật — Học ngay!</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuizMode(m => !m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${quizMode ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"}`}
              >
                <i className="ri-gamepad-line"></i>{quizMode ? "Thoát quiz" : "Quiz nhanh"}
              </button>
              <button onClick={() => setShowSpotlight(false)} className="text-app-text-muted hover:text-app-text-secondary cursor-pointer text-xs">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>

          {quizMode ? (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-app-text-secondary text-xs">Câu {(quizIdx % quizPool.length) + 1}/{quizPool.length}</span>
                <span className="text-app-accent-success text-xs font-bold">✓ {quizScore.correct}/{quizScore.total}</span>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-5 text-center mb-4">
                <p className="text-app-text-secondary text-xs mb-2">Từ Hán-Hàn này đọc Hán Việt là gì?</p>
                <p className="text-3xl font-bold text-white mb-1">{currentQuiz.korean}</p>
                <p className="text-xl text-app-accent-primary font-bold">{currentQuiz.hanja}</p>
                <p className="text-app-text-secondary text-sm mt-2">{currentQuiz.vietnamese}</p>
              </div>
              {!quizRevealed ? (
                <div className="grid grid-cols-2 gap-2">
                  {[currentQuiz.hanviet, ...SPOTLIGHT_EXAMPLES.filter(e => e.korean !== currentQuiz.korean).slice(0, 3).map(e => e.hanviet)]
                    .sort(() => Math.random() - 0.5)
                    .map((ans, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(ans === currentQuiz.hanviet)}
                        className="px-4 py-3 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-xl text-white/70 text-sm cursor-pointer transition-all"
                      >
                        {ans}
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-3">
                    <p className="text-app-accent-success font-bold text-lg">{currentQuiz.hanviet}</p>
                    <p className="text-white/50 text-xs mt-1">{currentQuiz.note}</p>
                  </div>
                  <button onClick={nextQuiz} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-amber-600 transition-colors">
                    Câu tiếp →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SPOTLIGHT_EXAMPLES.map((ex, i) => (
                <div key={i} className="bg-app-surface/50 border border-emerald-500/15 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-white font-bold text-lg">{ex.korean}</span>
                      <span className="text-app-accent-primary font-bold text-base ml-2">{ex.hanja}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success font-bold whitespace-nowrap">Giống!</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-app-card/50 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-app-text-muted text-[9px] mb-0.5">Hán Việt</p>
                      <p className="text-app-accent-success font-bold text-sm">{ex.hanviet}</p>
                    </div>
                    <i className="ri-arrow-right-line text-app-text-muted text-xs"></i>
                    <div className="flex-1 bg-app-card/50 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-app-text-muted text-[9px] mb-0.5">Tiếng Việt</p>
                      <p className="text-white/70 font-bold text-sm">{ex.vietnamese}</p>
                    </div>
                  </div>
                  <p className="text-app-text-muted text-[10px] italic">{ex.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
          <input
            type="text"
            placeholder="Tìm từ Hàn, Hán tự, nghĩa Việt, Hán Việt..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-app-card/50 border border-app-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 placeholder-white/20"
          />
        </div>
        <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl">
          {(["all", "identical", "similar", "different"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${filter === f ? "bg-app-card/70 text-white" : "text-app-text-muted hover:text-white/50"}`}
            >
              {f === "all" ? `Tất cả (${stats.total})` : f === "identical" ? `Giống (${stats.identical})` : f === "similar" ? `Gần (${stats.similar})` : `Khác (${stats.different})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main table */}
      <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] bg-app-surface/50 px-5 py-3 text-xs font-semibold text-app-text-muted border-b border-app-border">
          <span>Tiếng Hàn</span>
          <span>Hán tự</span>
          <span>Hán Việt</span>
          <span>Nghĩa tiếng Việt</span>
          <span>Mức độ</span>
        </div>
        <div className="divide-y divide-white/3 max-h-[500px] overflow-y-auto">
          {filtered.map((item, i) => {
            const cfg = similarityConfig[item.similarity];
            return (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] px-5 py-3 hover:bg-app-surface/30 transition-colors items-center gap-3">
                <span className="text-white font-bold text-sm">{item.korean}</span>
                <span className="text-app-accent-primary font-bold text-sm">{item.hanja}</span>
                <span className="text-app-accent-success font-semibold text-sm">{item.hanviet || "—"}</span>
                <span className="text-white/50 text-xs">{item.vietnamese}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${cfg.bg} ${cfg.border} border`} style={{ color: cfg.color }}>
                  <i className={cfg.icon}></i>{cfg.label}
                </span>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-app-text-muted">
            <i className="ri-search-line text-3xl mb-2 block"></i>
            <p className="text-sm">Không tìm thấy kết quả</p>
          </div>
        )}
      </div>

      {/* Learning tip */}
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
        <p className="text-amber-400/80 text-xs font-semibold mb-1 flex items-center gap-1.5">
          <i className="ri-lightbulb-flash-line"></i>Mẹo học nhanh cho người Việt
        </p>
        <p className="text-app-text-secondary text-xs leading-relaxed">
          Khi gặp từ Hán-Hàn mới, hãy thử đọc từng chữ Hán theo âm Hán Việt. Ví dụ: 
          <span className="text-amber-400 font-bold"> 경제(經濟) = kinh tế</span>, 
          <span className="text-amber-400 font-bold"> 사회(社會) = xã hội</span>, 
          <span className="text-amber-400 font-bold"> 문화(文化) = văn hóa</span>. 
          Bạn sẽ nhớ nghĩa ngay lập tức mà không cần học thuộc!
        </p>
      </div>
    </div>
  );
}

