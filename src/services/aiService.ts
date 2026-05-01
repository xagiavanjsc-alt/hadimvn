// ─── AI Service: OpenAI (GPT-4o) or Gemini ────────────────────────────────

export type AIProvider = "openai" | "gemini" | "openrouter";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface StoryPromptOverride {
  context?: string;
  characters?: string;
  storyLength?: "short" | "medium" | "long";
  style?: string;
  customInstruction?: string;
  pureKorean?: boolean; // Không thêm phiên âm vào truyện chêm
}

// ─── Melon: Generate Truyện Chêm lesson ───────────────────────────────────
export interface MelonLessonResult {
  story: string;
  vocabulary: { word: string; meaning: string; example: string }[];
  explanation: string;
}

// Fallback random context pool (used when no custom prompt is set)
const STORY_CONTEXTS = [
  {
    setting: "trường đại học Hàn Quốc (Seoul National University)",
    characters: "Minh - sinh viên trao đổi người Việt, Ji-woo - bạn cùng phòng người Hàn",
    situation: "đang ôn thi cuối kỳ trong thư viện, bật nhạc để tập trung",
  },
  {
    setting: "quán cà phê nhỏ ở Hongdae, Seoul",
    characters: "Linh - du học sinh Việt Nam, Seo-yeon - barista người Hàn hay hát khe khẽ",
    situation: "Linh đang làm bài tập, nghe bài hát phát từ loa quán và tò mò hỏi",
  },
  {
    setting: "chuyến du lịch Jeju Island",
    characters: "Tuấn - hướng dẫn viên du lịch người Việt, Min-jun - khách du lịch Hàn Quốc",
    situation: "đang ngồi trên xe bus ngắm cảnh, cùng nghe nhạc qua tai nghe chung",
  },
  {
    setting: "lớp học tiếng Hàn online",
    characters: "Hà - học viên người Việt 22 tuổi, thầy Park - giáo viên người Hàn vui tính",
    situation: "buổi học bị lạc đề vì thầy bắt đầu hát bài hát đang hot",
  },
  {
    setting: "nhà hàng Hàn Quốc ở TP.HCM",
    characters: "Ngọc - nhân viên phục vụ người Việt, Hyun - đầu bếp người Hàn",
    situation: "đang chuẩn bị mở cửa buổi tối, bài hát phát từ loa nhà hàng",
  },
  {
    setting: "ký túc xá trường tiếng Hàn ở Busan",
    characters: "Phúc - học sinh người Việt mới sang, Da-eun - bạn cùng phòng người Hàn thích K-pop",
    situation: "Da-eun đang nhảy theo bài hát, Phúc tò mò hỏi về lời bài hát",
  },
  {
    setting: "công viên Namsan, Seoul vào mùa thu",
    characters: "Trang - blogger du lịch người Việt, Jae-won - nhiếp ảnh gia người Hàn",
    situation: "đang chụp ảnh lá vàng, bài hát phát từ điện thoại của Jae-won",
  },
  {
    setting: "siêu thị Lotte Mart ở Hà Nội",
    characters: "Bảo - nhân viên khu hàng Hàn Quốc, Yuna - đại diện thương hiệu người Hàn",
    situation: "đang sắp xếp hàng hóa, bài hát phát từ hệ thống loa siêu thị",
  },
  {
    setting: "studio thu âm nhỏ ở Itaewon",
    characters: "Khoa - nhạc sĩ trẻ người Việt đang thực tập, Tae-yang - producer người Hàn",
    situation: "đang nghe lại bản demo, Tae-yang giải thích cảm xúc trong bài hát",
  },
  {
    setting: "chuyến tàu KTX từ Seoul đến Busan",
    characters: "Mai - nhân viên văn phòng người Việt đi công tác, Soo-jin - hàng xóm ghế bên",
    situation: "cùng đeo tai nghe, vô tình nghe cùng một bài hát và bắt chuyện",
  },
];

const STORY_LENGTH_MAP = {
  short: "150-200 từ",
  medium: "250-350 từ",
  long: "450-550 từ",
};

export async function generateMelonLesson(
  config: AIConfig,
  songTitle: string,
  artist: string,
  lyrics: string,
  promptOverride?: StoryPromptOverride,
  onCallTracked?: (provider: string, model: string) => void
): Promise<MelonLessonResult> {
  // Use custom prompt settings if provided, otherwise fall back to random pool
  let setting: string;
  let characters: string;
  let situation: string;
  let lengthTarget: string;
  let styleNote: string;
  let extraInstruction: string;

  if (
    promptOverride?.context?.trim() ||
    promptOverride?.characters?.trim()
  ) {
    // Custom prompt from Settings
    setting = promptOverride.context?.trim() || "lớp học tiếng Hàn tại Việt Nam";
    characters = promptOverride.characters?.trim() || "giáo viên và học viên người Việt";
    situation = "đang học bài hát K-pop trong buổi học";
    lengthTarget = STORY_LENGTH_MAP[promptOverride.storyLength ?? "medium"];
    styleNote = promptOverride.style?.trim() || "Hài hước, nhẹ nhàng, dễ hiểu";
    const pureKoreanNote = promptOverride.pureKorean
      ? "QUAN TRỌNG: Viết từ tiếng Hàn KHÔNG kèm phiên âm Latin. Ví dụ: viết '안녕' chứ KHÔNG viết '안녕 (annyeong)'. Người đọc đã biết đọc Hangul."
      : "";
    extraInstruction = [promptOverride.customInstruction?.trim(), pureKoreanNote].filter(Boolean).join("\n- ");
  } else {
    // Random fallback context
    const ctx = STORY_CONTEXTS[Math.floor(Math.random() * STORY_CONTEXTS.length)];
    setting = ctx.setting;
    characters = ctx.characters;
    situation = ctx.situation;
    lengthTarget = STORY_LENGTH_MAP.medium;
    styleNote = "Hài hước, nhẹ nhàng, dễ hiểu";
    extraInstruction = "";
  }

  const prompt = `Bạn là giáo viên tiếng Hàn sáng tạo của Hàn Quốc Ơi! — nền tảng học tiếng Hàn qua K-pop dành cho người Việt. Hãy tạo bài học tiếng Hàn từ bài hát K-pop sau:

Tên bài: ${songTitle}
Nghệ sĩ: ${artist}
Lời bài hát:
${lyrics}

BỐI CẢNH TRUYỆN CHÊM (BẮT BUỘC dùng bối cảnh này, KHÔNG được thay đổi):
- Địa điểm: ${setting}
- Nhân vật: ${characters}
- Tình huống: ${situation}

YÊU CẦU TRUYỆN CHÊM:
- Viết đoạn truyện ${lengthTarget} tiếng Việt, bối cảnh và nhân vật PHẢI đúng như trên
- Phong cách viết: ${styleNote}
- Câu chuyện phải có mở đầu - diễn biến - kết thúc rõ ràng
- Tự nhiên lồng ghép 3-5 từ/cụm từ THỰC SỰ có trong lời bài hát vào hội thoại
- Mỗi từ tiếng Hàn được lồng ghép phải có phiên âm và nghĩa trong ngoặc đơn ngay sau
- Câu chuyện phải phản ánh cảm xúc/chủ đề của bài hát
- Kết thúc bằng một câu học tiếng Hàn tự nhiên từ tình huống đó${extraInstruction ? `\n- ${extraInstruction}` : ""}

Hãy trả về JSON với cấu trúc sau (KHÔNG có markdown, chỉ JSON thuần):
{
  "story": "Đoạn Truyện Chêm theo đúng bối cảnh đã cho",
  "vocabulary": [
    {"word": "từ tiếng Hàn (phiên âm)", "meaning": "nghĩa tiếng Việt", "example": "câu ví dụ tiếng Hàn - dịch tiếng Việt"},
    ...5-8 từ vựng cốt lõi từ bài hát
  ],
  "explanation": "Giải thích 2-3 điểm ngữ pháp theo định dạng SAU ĐÂY (BẮT BUỘC):\n\n1. [Tên cấu trúc ngữ pháp tiếng Hàn]: [Giải thích ngắn gọn, thân thiện, dễ hiểu]\n예: [Câu ví dụ tiếng Hàn từ bài hát hoặc tương tự] — [Dịch nghĩa tiếng Việt]\n\n2. [Tên cấu trúc ngữ pháp tiếng Hàn]: [Giải thích ngắn gọn, thân thiện, dễ hiểu]\n예: [Câu ví dụ tiếng Hàn từ bài hát hoặc tương tự] — [Dịch nghĩa tiếng Việt]\n\nMỖI điểm ngữ pháp PHẢI có dòng '예:' kèm ví dụ thực tế. Viết theo phong cách thân thiện, dễ hiểu cho người học tiếng Hàn cơ bản."
}`;

  const raw = await callAI(config, prompt);
  onCallTracked?.(config.provider, config.model ?? getDefaultModel(config.provider));
  return parseJSON<MelonLessonResult>(raw);
}

// ─── Free Story Generator: Sinh truyện chêm từ chủ đề tự do ──────────────
export interface FreeStoryResult {
  title: string;
  story: string;
  vocabulary: { word: string; meaning: string; example: string }[];
  explanation: string;
}

export interface FreeStoryInput {
  topic: string;           // Chủ đề tự do: "buổi tập nhảy của idol"
  level: "beginner" | "intermediate" | "advanced";
  storyLength: "short" | "medium" | "long";
  characters?: string;     // Nhân vật tùy chỉnh
  setting?: string;        // Bối cảnh tùy chỉnh
  style?: string;          // Phong cách: hài hước, lãng mạn, kịch tính...
  pureKorean?: boolean;
}

const LEVEL_MAP = {
  beginner: "Sơ cấp (TOPIK 1-2): từ vựng đơn giản, câu ngắn, ngữ pháp cơ bản như -이에요/예요, -아/어요, -고 싶다",
  intermediate: "Trung cấp (TOPIK 3-4): từ vựng phong phú hơn, ngữ pháp như -(으)면, -기 때문에, -(으)ㄹ 것 같다",
  advanced: "Cao cấp (TOPIK 5-6): từ vựng nâng cao, thành ngữ, ngữ pháp phức tạp như -(으)ㄹ수록, -는 반면에",
};

const FREE_STORY_CONTEXTS: Record<string, { setting: string; characters: string; situation: string }> = {
  "buổi tập nhảy": {
    setting: "phòng tập nhảy của công ty giải trí ở Seoul",
    characters: "Minh - thực tập sinh người Việt, Ji-ho - trưởng nhóm người Hàn",
    situation: "đang tập vũ đạo cho comeback sắp tới, mệt mỏi nhưng vẫn cố gắng",
  },
  "fan meeting": {
    setting: "hội trường fan meeting ở COEX Seoul",
    characters: "Linh - fan người Việt lần đầu gặp idol, Soo-ah - nhân viên tổ chức người Hàn",
    situation: "đang xếp hàng chờ đến lượt gặp idol, hồi hộp và phấn khích",
  },
  "quán ăn": {
    setting: "quán ăn truyền thống Hàn Quốc ở Insadong",
    characters: "Tuấn - du học sinh người Việt, Park ajeossi - chủ quán người Hàn vui tính",
    situation: "lần đầu thử món ăn Hàn, không biết cách gọi món và ăn đúng cách",
  },
  "default": {
    setting: "Seoul, Hàn Quốc",
    characters: "nhân vật người Việt và người Hàn",
    situation: "tình huống liên quan đến chủ đề đã cho",
  },
};

function detectContext(topic: string) {
  const lower = topic.toLowerCase();
  for (const [key, ctx] of Object.entries(FREE_STORY_CONTEXTS)) {
    if (key !== "default" && lower.includes(key)) return ctx;
  }
  return FREE_STORY_CONTEXTS["default"];
}

export async function generateFreeStory(
  config: AIConfig,
  input: FreeStoryInput,
  onCallTracked?: (provider: string, model: string) => void
): Promise<FreeStoryResult> {
  const ctx = detectContext(input.topic);
  const setting = input.setting?.trim() || ctx.setting;
  const characters = input.characters?.trim() || ctx.characters;
  const situation = ctx.situation;
  const lengthTarget = STORY_LENGTH_MAP[input.storyLength];
  const levelDesc = LEVEL_MAP[input.level];
  const styleNote = input.style?.trim() || "Hài hước, nhẹ nhàng, gần gũi với người học tiếng Hàn";
  const pureKoreanNote = input.pureKorean
    ? "QUAN TRỌNG: Viết từ tiếng Hàn KHÔNG kèm phiên âm Latin trong truyện. Ví dụ: viết '안녕' chứ KHÔNG viết '안녕 (annyeong)'."
    : "";

  const prompt = `Bạn là giáo viên tiếng Hàn sáng tạo chuyên viết truyện chêm K-pop. Hãy tạo một bài học tiếng Hàn hoàn chỉnh từ chủ đề sau:

CHỦ ĐỀ: ${input.topic}

BỐI CẢNH TRUYỆN (BẮT BUỘC dùng bối cảnh này):
- Địa điểm: ${setting}
- Nhân vật: ${characters}
- Tình huống: ${situation}

YÊU CẦU TRUYỆN CHÊM:
- Viết đoạn truyện ${lengthTarget} tiếng Việt, bối cảnh và nhân vật PHẢI đúng như trên
- Trình độ ngôn ngữ: ${levelDesc}
- Phong cách viết: ${styleNote}
- Câu chuyện phải có mở đầu - diễn biến - kết thúc rõ ràng, hấp dẫn
- Tự nhiên lồng ghép 4-6 từ/cụm từ tiếng Hàn vào hội thoại trong truyện
- Mỗi từ tiếng Hàn được lồng ghép phải có phiên âm và nghĩa trong ngoặc đơn ngay sau
- Câu chuyện phải phản ánh đúng chủ đề "${input.topic}"
- Kết thúc bằng một câu học tiếng Hàn tự nhiên từ tình huống đó
- Viết như một câu chuyện thật, không phải bài tập khô khan${pureKoreanNote ? `\n- ${pureKoreanNote}` : ""}

QUAN TRỌNG: Đây là truyện chêm SÁNG TÁC, không dựa trên bài hát có sẵn. Hãy sáng tạo tự do!

Hãy trả về JSON với cấu trúc sau (KHÔNG có markdown, chỉ JSON thuần):
{
  "title": "Tiêu đề bài học ngắn gọn, hấp dẫn (ví dụ: 'Buổi Tập Nhảy Đáng Nhớ')",
  "story": "Đoạn Truyện Chêm theo đúng bối cảnh đã cho, sinh động và tự nhiên",
  "vocabulary": [
    {"word": "từ tiếng Hàn (phiên âm)", "meaning": "nghĩa tiếng Việt", "example": "câu ví dụ tiếng Hàn — dịch tiếng Việt"},
    ...6-8 từ vựng cốt lõi liên quan đến chủ đề
  ],
  "explanation": "Giải thích 2-3 điểm ngữ pháp theo định dạng SAU ĐÂY (BẮT BUỘC):\n\n1. [Tên cấu trúc ngữ pháp tiếng Hàn]: [Giải thích ngắn gọn, thân thiện, dễ hiểu]\n예: [Câu ví dụ tiếng Hàn liên quan đến chủ đề] — [Dịch nghĩa tiếng Việt]\n\n2. [Tên cấu trúc ngữ pháp tiếng Hàn]: [Giải thích ngắn gọn, thân thiện, dễ hiểu]\n예: [Câu ví dụ tiếng Hàn liên quan đến chủ đề] — [Dịch nghĩa tiếng Việt]\n\nMỖI điểm ngữ pháp PHẢI có dòng '예:' kèm ví dụ thực tế. Phù hợp với trình độ ${input.level}."
}`;

  const raw = await callAI(config, prompt);
  onCallTracked?.(config.provider, config.model ?? getDefaultModel(config.provider));
  return parseJSON<FreeStoryResult>(raw);
}

// ─── News: Analyze Korean article for learning ───────────────────────────
export interface NewsLessonResult {
  title: string;
  summary: string;
  vocabulary: { word: string; reading: string; meaning: string; example: string; difficulty: "easy" | "medium" | "hard" }[];
  grammarPoints: { pattern: string; explanation: string; example: string }[];
  keyPhrases: { phrase: string; meaning: string }[];
  level: "beginner" | "intermediate" | "advanced";
}

export async function analyzeNewsArticle(
  config: AIConfig,
  articleTitle: string,
  articleContent: string,
  targetLevel: "beginner" | "intermediate" | "advanced",
  onCallTracked?: (provider: string, model: string) => void
): Promise<NewsLessonResult> {
  const levelDesc = LEVEL_MAP[targetLevel];
  const prompt = `Bạn là giáo viên tiếng Hàn chuyên dạy qua tin tức thực tế. Hãy phân tích bài báo tiếng Hàn sau và tạo bài học cho người học ${levelDesc}.

TIÊU ĐỀ BÀI BÁO: ${articleTitle}

NỘI DUNG:
${articleContent.slice(0, 2000)}

Hãy trả về JSON (KHÔNG có markdown, chỉ JSON thuần):
{
  "title": "Tiêu đề bài học tiếng Việt hấp dẫn",
  "summary": "Tóm tắt bài báo bằng tiếng Việt, 3-4 câu, dễ hiểu",
  "vocabulary": [
    {"word": "từ tiếng Hàn", "reading": "phiên âm", "meaning": "nghĩa tiếng Việt", "example": "câu ví dụ từ bài báo", "difficulty": "easy|medium|hard"},
    ...6-10 từ vựng quan trọng nhất trong bài
  ],
  "grammarPoints": [
    {"pattern": "cấu trúc ngữ pháp", "explanation": "giải thích ngắn gọn tiếng Việt", "example": "ví dụ từ bài báo — dịch tiếng Việt"},
    ...2-3 điểm ngữ pháp nổi bật
  ],
  "keyPhrases": [
    {"phrase": "cụm từ tiếng Hàn", "meaning": "nghĩa tiếng Việt"},
    ...4-6 cụm từ thường gặp trong tin tức
  ],
  "level": "${targetLevel}"
}`;

  const raw = await callAI(config, prompt);
  onCallTracked?.(config.provider, config.model ?? getDefaultModel(config.provider));
  return parseJSON<NewsLessonResult>(raw);
}

// ─── Quiz Generator ───────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string;
  type: "vocab" | "grammar" | "fill";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  word?: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
}

export async function generateQuiz(
  config: AIConfig,
  lessonTitle: string,
  vocabulary: { word: string; meaning: string; example?: string }[],
  grammarExplanation: string,
  count: number = 8,
  onCallTracked?: (provider: string, model: string) => void
): Promise<QuizResult> {
  const vocabList = vocabulary.slice(0, 10).map(v => `${v.word} = ${v.meaning}`).join("\n");
  const prompt = `Bạn là giáo viên tiếng Hàn. Tạo ${count} câu hỏi trắc nghiệm từ bài học sau:

Bài học: ${lessonTitle}
Từ vựng:
${vocabList}

Ngữ pháp:
${grammarExplanation.slice(0, 500)}

Tạo mix: 4 câu từ vựng (chọn nghĩa đúng), 2 câu điền vào chỗ trống, 2 câu ngữ pháp.
Mỗi câu có 4 lựa chọn, 1 đáp án đúng.

Trả về JSON (KHÔNG markdown):
{
  "questions": [
    {
      "id": "q1",
      "type": "vocab",
      "question": "câu hỏi tiếng Việt",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "giải thích ngắn tại sao đáp án đúng",
      "word": "từ tiếng Hàn liên quan (nếu có)"
    }
  ]
}`;

  const raw = await callAI(config, prompt);
  onCallTracked?.(config.provider, config.model ?? getDefaultModel(config.provider));
  return parseJSON<QuizResult>(raw);
}

// ─── Naver KiN: Smart Content Filter ─────────────────────────────────────
// Based on Naver KiN category structure: 교육 (Education), 언어 (Language),
// 문화 (Culture), 엔터테인먼트 (Entertainment), 취미 (Hobby)
// We keep questions relevant to Korean learning, K-pop, Korean culture

const RELEVANT_CATEGORIES = [
  // Korean language & education
  "교육", "언어", "외국어", "한국어", "어학", "학습", "공부",
  // Culture & entertainment
  "문화", "엔터테인먼트", "연예", "음악", "케이팝", "k-pop", "kpop",
  // Hobby & lifestyle (often K-pop related)
  "취미", "여가", "생활",
  // English equivalents
  "education", "language", "korean", "culture", "entertainment", "music",
];

const IRRELEVANT_CATEGORIES = [
  // Tech/programming
  "컴퓨터", "it", "프로그래밍", "개발", "소프트웨어", "하드웨어",
  // Medical
  "의료", "건강", "의학", "병원",
  // Legal/finance
  "법률", "금융", "세금", "보험",
  // Military (군사/군대 — not relevant for Korean learning)
  "군사", "군대", "무기", "전쟁", "국방",
  // Sports (unless K-pop idol sports)
  "스포츠", "운동",
  // Real estate
  "부동산", "주택",
  // Politics
  "정치", "선거", "국회",
];

// Keywords strongly indicating Korean language learning relevance
const RELEVANT_KEYWORDS_KR = [
  // Language learning
  "한국어", "한국어 공부", "케이팝", "k-pop", "아이돌", "드라마", "노래",
  "발음", "문법", "어휘", "단어", "표현", "번역", "공부", "학습",
  // Study abroad / work abroad
  "유학", "어학당", "어학연수", "교환학생", "유학생",
  "외국인 근로자", "취업비자", "e-9", "h-2", "고용허가제",
  // TOPIK exam
  "토픽", "topik", "토픽시험", "한국어능력시험",
  // K-culture
  "한류", "bts", "블랙핑크", "방탄소년단", "엑소", "트와이스",
  "kpop", "케이팝", "한국 문화", "한국 음식", "한복",
  // Vietnamese learners context
  "베트남", "베트남어", "베트남 사람",
  // Common learning phrases
  "배우다", "가르치다", "외우다", "연습", "회화", "독해", "듣기", "쓰기",
];

export interface NaverFilterResult {
  isRelevant: boolean;
  reason: string;
  score: number; // 0-100
}

// Hard-reject patterns — câu hỏi chắc chắn không liên quan học tiếng Hàn
const HARD_REJECT_PATTERNS = [
  /군사|군대|무기|전쟁|국방|병역|징병|군인|사단|연대|포병|해군|공군|육군/,
  /주식|코인|비트코인|투자|펀드|채권|환율|금리|대출|부동산|아파트|분양/,
  /정치|선거|국회|대통령|여당|야당|국정|외교|조약/,
  /의료|수술|병원|약|처방|진단|질병|암|당뇨|고혈압/,
  /법률|소송|판결|변호사|검사|재판|형사|민사/,
];

export function filterNaverQuestion(
  questionKr: string,
  category: string
): NaverFilterResult {
  const qLower = questionKr.toLowerCase();
  const catLower = (category || "").toLowerCase();

  // Hard reject: military, finance, politics, medical, legal
  for (const pattern of HARD_REJECT_PATTERNS) {
    if (pattern.test(questionKr)) {
      return {
        isRelevant: false,
        reason: "Chủ đề không liên quan học tiếng Hàn (quân sự/tài chính/chính trị/y tế/pháp lý)",
        score: 0,
      };
    }
  }

  // Check irrelevant categories (fast reject)
  const isIrrelevantCat = IRRELEVANT_CATEGORIES.some((c) => catLower.includes(c));
  if (isIrrelevantCat) {
    return { isRelevant: false, reason: `Danh mục không liên quan: ${category}`, score: 5 };
  }

  // Check relevant categories
  const isRelevantCat = RELEVANT_CATEGORIES.some((c) => catLower.includes(c));

  // Check keywords in question
  const keywordMatches = RELEVANT_KEYWORDS_KR.filter((kw) => qLower.includes(kw));
  const keywordScore = Math.min(keywordMatches.length * 20, 80);

  // Score calculation
  let score = 0;
  if (isRelevantCat) score += 40;
  score += keywordScore;

  // Bonus: question contains Korean characters + learning context
  const hasKorean = /[가-힣]/.test(questionKr);
  const hasLearningContext = /배우|공부|학습|연습|외우|이해|뜻|의미|번역|발음/.test(questionKr);
  if (hasKorean && hasLearningContext) score += 25;
  else if (hasKorean && keywordMatches.length > 0) score += 15;

  // Bonus: TOPIK / study abroad / work abroad
  const hasTopik = /토픽|topik|어학당|유학|취업비자|고용허가|e-9|h-2/.test(qLower);
  if (hasTopik) score += 30;

  // Cap at 100
  score = Math.min(score, 100);

  const threshold = 25;
  if (score >= threshold || isRelevantCat) {
    return {
      isRelevant: true,
      reason: keywordMatches.length > 0
        ? `Liên quan: ${keywordMatches.slice(0, 2).join(", ")}`
        : hasTopik
        ? "Liên quan: TOPIK/du học/XKLĐ"
        : `Danh mục phù hợp: ${category}`,
      score,
    };
  }

  return {
    isRelevant: false,
    reason: "Không liên quan đến học tiếng Hàn, K-pop, TOPIK hoặc du học",
    score,
  };
}

// ─── Naver: Translate + Rewrite + Hashtags ────────────────────────────────
export interface NaverQAResult {
  translatedQuestion: string;
  rewrittenAnswer: string;
  hashtags: string[];
}

export async function processNaverQA(
  config: AIConfig,
  questionKr: string,
  originalAnswer: string,
  onCallTracked?: (provider: string, model: string) => void
): Promise<NaverQAResult> {
  const prompt = `Bạn là chuyên gia nội dung của Hàn Quốc Ơi! - nền tảng học tiếng Hàn qua K-pop dành cho người Việt.

Câu hỏi tiếng Hàn từ Naver KiN:
"${questionKr}"

Câu trả lời gốc (tiếng Hàn):
"${originalAnswer}"

Hãy trả về JSON (KHÔNG có markdown, chỉ JSON thuần):
{
  "translatedQuestion": "Dịch câu hỏi sang tiếng Việt, tự nhiên và dễ hiểu",
  "rewrittenAnswer": "Viết lại câu trả lời theo văn phong KTS: thân thiện, chuyên nghiệp, có ví dụ thực tế từ K-pop, dùng **bold** để nhấn mạnh từ khóa quan trọng, độ dài 150-250 từ",
  "hashtags": ["#Hỏi_đáp_Kpop", "#Ngữ_pháp_thực_tế", "...3-5 hashtag liên quan đến nội dung câu hỏi"]
}`;

  const raw = await callAI(config, prompt);
  onCallTracked?.(config.provider, config.model ?? getDefaultModel(config.provider));
  return parseJSON<NaverQAResult>(raw);
}

// ─── Core AI caller ────────────────────────────────────────────────────────
async function callAI(config: AIConfig, prompt: string): Promise<string> {
  if (config.provider === "openai") return callOpenAI(config, prompt);
  if (config.provider === "openrouter") return callOpenRouter(config, prompt);
  return callGemini(config, prompt);
}

async function callOpenAI(config: AIConfig, prompt: string): Promise<string> {
  const model = config.model ?? "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    let errJson: { error?: { message?: string } } = {};
    try { errJson = JSON.parse(err); } catch { /* ignore */ }
    if (res.status === 401) throw new Error("OpenAI API Key không hợp lệ. Kiểm tra lại trong Cài đặt.");
    if (res.status === 429) throw new Error("OpenAI rate limit hoặc hết quota. Kiểm tra billing tại platform.openai.com.");
    throw new Error(errJson?.error?.message ?? `OpenAI lỗi ${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function callOpenRouter(config: AIConfig, prompt: string): Promise<string> {
  const model = config.model ?? "openai/gpt-4o-mini";
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer": "https://kts-admin.app",
      "X-Title": "KTS Admin Tool",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    let errJson: { error?: { message?: string } } = {};
    try { errJson = JSON.parse(err); } catch { /* ignore */ }
    if (res.status === 401) throw new Error("OpenRouter API Key không hợp lệ. Kiểm tra lại trong Cài đặt.");
    if (res.status === 402) throw new Error("Tài khoản OpenRouter hết credit. Nạp thêm tại openrouter.ai.");
    if (res.status === 429) throw new Error("OpenRouter rate limit. Thử lại sau vài giây.");
    throw new Error(errJson?.error?.message ?? `OpenRouter lỗi ${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function callGemini(config: AIConfig, prompt: string): Promise<string> {
  const model = config.model ?? "gemini-1.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    let errJson: { error?: { message?: string } } = {};
    try { errJson = JSON.parse(err); } catch { /* ignore */ }
    if (res.status === 400) throw new Error("Gemini API Key không hợp lệ hoặc model không tồn tại. Kiểm tra lại trong Cài đặt.");
    if (res.status === 429) throw new Error("Gemini rate limit. Thử lại sau vài giây hoặc dùng model khác.");
    throw new Error(errJson?.error?.message ?? `Gemini lỗi ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function parseJSON<T>(raw: string): T {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`AI trả về JSON không hợp lệ: ${cleaned.slice(0, 200)}`);
  }
}

function getDefaultModel(provider: AIProvider): string {
  if (provider === "openai") return "gpt-4o-mini";
  if (provider === "openrouter") return "openai/gpt-4o-mini";
  return "gemini-1.5-flash";
}
