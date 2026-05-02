// Enhance HANJA_DATA with: pronunciation, category, difficulty, topikLevel
// Runs offline — no AI, no API calls

import { readFileSync, writeFileSync } from 'node:fs';

const filePath = 'src/mocks/data/hanja-data.ts';
const raw = readFileSync(filePath, 'utf8');

// ─── Revised Romanization of Korean (rule-based) ───────────────────────────────
// Simplified but functional for most vocabulary words
const INITIAL = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const MEDIAL = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const FINAL = ['','k','k','ks','n','nj','nh','t','l','lk','lm','lb','ls','lt','lp','lh','m','p','ps','t','t','ng','t','t','k','t','p','h'];

function romanizeSyllable(char) {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return char;
  const offset = code - 0xAC00;
  const initial = Math.floor(offset / 588);
  const medial = Math.floor((offset % 588) / 28);
  const final = offset % 28;
  return INITIAL[initial] + MEDIAL[medial] + FINAL[final];
}

function romanize(korean) {
  return korean.split('').map(romanizeSyllable).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── Category inference by Vietnamese meaning keywords ─────────────────────────
const CATEGORY_RULES = [
  { cat: "Kinh tế & Tài chính", keywords: ["kinh tế","tài chính","tiền","ngân hàng","thuế","giá","đầu tư","thị trường","chứng khoán","lợi nhuận","cổ phần","tín dụng","lãi","tỷ giá","xuất khẩu","nhập khẩu","thương mại","doanh nghiệp","kinh doanh","giao dịch","mua bán"] },
  { cat: "Y học & Sức khỏe", keywords: ["y học","bệnh","thuốc","bác sĩ","y tá","bệnh viện","chữa trị","sức khỏe","cơ thể","tế bào","virus","ung thư","phẫu thuật","điều trị","triệu chứng","dinh dưỡng","gen","miễn dịch"] },
  { cat: "Chính trị & Pháp luật", keywords: ["chính trị","pháp luật","luật","hiến pháp","tòa án","chính phủ","quốc hội","đảng","bầu cử","tổng thống","thủ tướng","phán quyết","khởi tố","tố tụng","điều lệ","nghị viện"] },
  { cat: "Khoa học & Công nghệ", keywords: ["khoa học","vật lý","hóa học","công nghệ","máy tính","phần mềm","dữ liệu","mạng","internet","trí tuệ","thuật toán","điện tử","vũ trụ","hạt nhân","nguyên tử"] },
  { cat: "Quân sự & Quốc phòng", keywords: ["quân","lính","chiến","vũ khí","súng","bom","tên lửa","tàu chiến","trận","binh","sĩ","tướng","đại úy","thiếu úy","quốc phòng","trận","đánh"] },
  { cat: "Văn học & Nghệ thuật", keywords: ["văn học","tiểu thuyết","thơ","nhà văn","nhà thơ","nghệ thuật","hội họa","tranh","ca sĩ","diễn viên","điện ảnh","sân khấu","âm nhạc","nhạc","hát","múa","vũ"] },
  { cat: "Giáo dục & Học thuật", keywords: ["học","giáo dục","trường","đại học","sinh viên","giáo viên","giáo sư","bài giảng","nghiên cứu","luận văn","bằng cấp","chứng chỉ","thi","kiểm tra","khóa"] },
  { cat: "Lịch sử & Văn hóa", keywords: ["lịch sử","thời đại","vương triều","vua","hoàng đế","quý tộc","cổ","phong kiến","di sản","di tích","truyền thống","phong tục","lễ hội"] },
  { cat: "Địa lý & Du lịch", keywords: ["địa lý","bản đồ","quốc gia","thành phố","thủ đô","núi","sông","biển","đảo","vịnh","cảng","lục địa","châu","du lịch","tham quan","khách sạn"] },
  { cat: "Thể thao", keywords: ["thể thao","bóng","vận động","huấn luyện","thi đấu","giải","vô địch","olympic","sân","thể dục","võ","quyền"] },
  { cat: "Ẩm thực", keywords: ["ăn","thức ăn","món","cơm","bánh","thịt","rau","gia vị","nấu","đầu bếp","nhà hàng","thực phẩm","dinh dưỡng","khẩu vị","canh"] },
  { cat: "Tôn giáo & Triết học", keywords: ["tôn giáo","phật","thiên chúa","triết học","tư tưởng","linh hồn","đức","đạo","tâm linh","thiền"] },
  { cat: "Gia đình & Xã hội", keywords: ["gia đình","cha","mẹ","con","anh","chị","em","vợ","chồng","bạn","xã hội","cộng đồng","dân","tộc","hôn nhân","kết hôn"] },
  { cat: "Tình cảm & Tâm lý", keywords: ["tình yêu","yêu","tình cảm","cảm xúc","vui","buồn","giận","sợ","hạnh phúc","bất hạnh","tâm trạng","tinh thần","lo lắng"] },
  { cat: "Giao thông & Đi lại", keywords: ["xe","tàu","máy bay","đường","giao thông","lái","đi lại","vận chuyển","cảng","ga","bến"] },
  { cat: "Thiên nhiên & Môi trường", keywords: ["thiên nhiên","môi trường","cây","hoa","động vật","thực vật","rừng","sinh thái","ô nhiễm","tài nguyên","năng lượng","khí hậu","thời tiết"] },
  { cat: "Thời gian", keywords: ["thời gian","giờ","phút","ngày","tháng","năm","mùa","thế kỷ","tương lai","quá khứ","hiện tại"] },
  { cat: "Đời sống hàng ngày", keywords: ["nhà","sinh hoạt","đời sống","công việc","làm","quần áo","sạch","vệ sinh"] },
];

function inferCategory(vietnamese) {
  const v = vietnamese.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => v.includes(kw))) return rule.cat;
  }
  return "Khác";
}

// ─── Difficulty heuristic ──────────────────────────────────────────────────────
// 1 (easy): 1-2 syllable very common words (like 학교, 가족, 시간)
// 2 (medium): 2-3 syllable standard vocab  
// 3 (hard): 3+ syllables or rare/specialized terms
const COMMON_BASIC = new Set([
  "학교","가족","시간","사람","음식","물","집","책","학생","선생",
  "나라","도시","회사","친구","사랑","행복","건강","운동","공부","여행",
  "음악","영화","신문","컴퓨터","전화","사진","이름","나이","생일","주말"
]);

function inferDifficulty(korean, vietnamese) {
  const syllables = korean.length;
  if (COMMON_BASIC.has(korean) || (syllables <= 2 && vietnamese.length <= 15)) return 1;
  if (syllables <= 3) return 2;
  return 3;
}

// ─── TOPIK level heuristic ─────────────────────────────────────────────────────
// Based on syllable count, difficulty, and category
const TOPIK_1_KEYWORDS = ["đây","kia","tôi","bạn","học","đi","ăn","làm","nói","nghe","xin","chào"];
const TOPIK_ADVANCED_CATS = ["Kinh tế & Tài chính","Chính trị & Pháp luật","Y học & Sức khỏe","Khoa học & Công nghệ","Tôn giáo & Triết học"];

function inferTopikLevel(korean, vietnamese, category, difficulty) {
  const v = vietnamese.toLowerCase();
  if (TOPIK_1_KEYWORDS.some(kw => v.includes(kw)) && korean.length <= 2) return 1;
  if (difficulty === 1) return 2;
  if (TOPIK_ADVANCED_CATS.includes(category)) {
    return korean.length >= 4 ? 6 : 5;
  }
  if (difficulty === 3) return 5;
  if (korean.length >= 4) return 4;
  return 3;
}

// ─── Main: parse file, enhance entries, write back ─────────────────────────────
// Extract the entries array block from the TS source
const entryRegex = /{\s*korean:\s*"([^"]+)",\s*hanja:\s*"([^"]*)",\s*vietnamese:\s*"([^"]*)"[^}]*}/g;

let count = 0;
let catCounts = {};
let diffCounts = { 1: 0, 2: 0, 3: 0 };
let topikCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

const newContent = raw.replace(entryRegex, (_match, korean, hanja, vietnamese) => {
  const pronunciation = romanize(korean);
  const category = inferCategory(vietnamese);
  const difficulty = inferDifficulty(korean, vietnamese);
  const topikLevel = inferTopikLevel(korean, vietnamese, category, difficulty);
  
  count++;
  catCounts[category] = (catCounts[category] || 0) + 1;
  diffCounts[difficulty]++;
  topikCounts[topikLevel]++;

  return `{ korean: "${korean}", hanja: "${hanja}", vietnamese: "${vietnamese}", pronunciation: "${pronunciation}", category: "${category}", difficulty: ${difficulty}, topikLevel: ${topikLevel} }`;
});

writeFileSync(filePath, newContent, 'utf8');

console.log(`\n✅ Enhanced ${count} entries\n`);
console.log("📊 Category distribution:");
Object.entries(catCounts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`   ${k}: ${v}`));
console.log("\n📈 Difficulty:");
console.log(`   Dễ (1): ${diffCounts[1]}`);
console.log(`   TB (2): ${diffCounts[2]}`);
console.log(`   Khó (3): ${diffCounts[3]}`);
console.log("\n🎯 TOPIK level:");
for (let i = 1; i <= 6; i++) console.log(`   TOPIK ${i}: ${topikCounts[i]}`);
