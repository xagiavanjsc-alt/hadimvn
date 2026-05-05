import { useMemo } from "react";

interface EnhancedFeedbackProps {
  question: {
    korean: string;
    vietnamese: string;
    pronunciation: string;
    example: string;
    exampleVi: string;
    type: "meaning_kr_to_vi" | "meaning_vi_to_kr" | "fill_blank" | "pronunciation";
  };
  userAnswer: string;
  correctAnswer: string;
  topic?: string;
  onLearnMore?: () => void;
}

interface FeedbackData {
  explanation: string;
  grammarPattern?: string;
  similarExamples: string[];
  weakArea?: string;
  recommendedAction: string;
  relatedVocab: string[];
}

// Grammar patterns database (simplified - can be expanded)
const GRAMMAR_PATTERNS: Record<string, { pattern: string; explanation: string }> = {
  // Honorifics
  "입니다": { pattern: "~입니다", explanation: "Động từ trang trọng (đuôi câu)" },
  "입니다까": { pattern: "~입니까?", explanation: "Câu hỏi trang trọng" },
  "세요": { pattern: "~(으)세요", explanation: "Câu mệnh lệnh trang trọng" },
  // Copula
  "이다": { pattern: "~이다", explanation: "Động từ to be (không trang trọng)" },
  // Particles
  "이/가": { pattern: "이/가", explanation: "Trợ từ chủ ngữ" },
  "은/는": { pattern: "은/는", explanation: "Trợ từ chủ ngữ (nhấn mạnh)" },
  "을/를": { pattern: "을/를", explanation: "Trợ từ tân ngữ" },
  // Numbers
  "하나": { pattern: "한국어 숫자", explanation: "Số đếm thuần Hàn" },
  "일": { pattern: "한자 숫자", explanation: "Số đếm Hán Việt" },
};

// Similar examples database (simplified)
const SIMILAR_EXAMPLES: Record<string, string[]> = {
  // Work-related
  "일": ["업무 (công việc)", "직업 (nghề nghiệp)", "사업 (sự nghiệp)"],
  "회사": ["은행 (ngân hàng)", "병원 (bệnh viện)", "학교 (trường học)"],
  // Family-related
  "가족": ["부모 (cha mẹ)", "자녀 (con cái)", "형제 (anh em)"],
  // Time-related
  "시간": ["오늘 (hôm nay)", "내일 (ngày mai)", "어제 (hôm qua)"],
  // Location-related
  "장소": ["학교 (trường)", "집 (nhà)", "식당 (nhà hàng)"],
};

function generateFeedback(
  question: EnhancedFeedbackProps["question"],
  userAnswer: string,
  correctAnswer: string,
  topic?: string
): FeedbackData {
  const { korean, vietnamese, example, exampleVi } = question;

  // Detect grammar pattern
  let grammarPattern: string | undefined;
  let patternExplanation: string | undefined;

  for (const [key, value] of Object.entries(GRAMMAR_PATTERNS)) {
    if (example.includes(key) || korean.includes(key)) {
      grammarPattern = value.pattern;
      patternExplanation = value.explanation;
      break;
    }
  }

  // Generate explanation
  let explanation = "";
  if (question.type === "meaning_kr_to_vi") {
    explanation = `"${korean}" nghĩa là "${vietnamese}". `;
    if (patternExplanation) {
      explanation += `Pattern: ${patternExplanation}. `;
    }
    explanation += `Bạn cần nhớ từ này vì xuất hiện nhiều trong EPS-TOPIK.`;
  } else if (question.type === "meaning_vi_to_kr") {
    explanation = `"${vietnamese}" trong tiếng Hàn là "${korean}" (${pronunciation}). `;
    if (patternExplanation) {
      explanation += `Pattern: ${patternExplanation}. `;
    }
  } else if (question.type === "fill_blank") {
    explanation = `Câu này dùng pattern "${grammarPattern || "cấu trúc câu cơ bản"}". `;
    explanation += `Từ cần điền là "${korean}" để hoàn thành câu theo ngữ pháp Hàn Quốc.`;
  }

  // Find similar examples
  const similarExamples: string[] = [];
  for (const [key, examples] of Object.entries(SIMILAR_EXAMPLES)) {
    if (korean.includes(key) || vietnamese.includes(key)) {
      similarExamples.push(...examples.slice(0, 3));
      break;
    }
  }

  // Identify weak area
  let weakArea: string | undefined;
  if (question.type === "meaning_kr_to_vi") {
    weakArea = "Đọc hiểu từ vựng Hàn → Việt";
  } else if (question.type === "meaning_vi_to_kr") {
    weakArea = "Viết từ vựng Việt → Hàn";
  } else if (question.type === "fill_blank") {
    weakArea = "Ngữ pháp & Điền vào chỗ trống";
  }

  // Recommended action
  const recommendedAction = weakArea
    ? `Cần tập luyện thêm phần "${weakArea}". Học thêm 10-20 từ cùng chủ đề để cải thiện.`
    : "Ôn tập lại từ vựng này và các từ liên quan.";

  // Related vocabulary
  const relatedVocab = similarExamples.slice(0, 5);

  return {
    explanation,
    grammarPattern,
    similarExamples,
    weakArea,
    recommendedAction,
    relatedVocab,
  };
}

export default function EnhancedQuizFeedback({
  question,
  userAnswer,
  correctAnswer,
  topic,
  onLearnMore,
}: EnhancedFeedbackProps) {
  const feedback = useMemo(
    () => generateFeedback(question, userAnswer, correctAnswer, topic),
    [question, userAnswer, correctAnswer, topic]
  );

  return (
    <div className="bg-red-500/8 border border-red-500/25 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <i className="ri-close-circle-fill text-red-400 text-lg flex-shrink-0 mt-0.5"></i>
        <div className="flex-1">
          <p className="font-semibold text-sm text-red-400 mb-1">Chưa đúng!</p>
          <p className="text-white/50 text-xs">
            Đáp án của bạn: <span className="text-white font-semibold">{userAnswer}</span>
          </p>
          <p className="text-white/50 text-xs">
            Đáp án đúng: <span className="text-white font-semibold">{correctAnswer}</span>
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-app-card/30 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2 mb-2">
          <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
          <p className="text-xs font-semibold text-white">Giải thích:</p>
        </div>
        <p className="text-white/70 text-xs leading-relaxed">{feedback.explanation}</p>
      </div>

      {/* Grammar Pattern */}
      {feedback.grammarPattern && (
        <div className="bg-app-card/30 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2 mb-2">
            <i className="ri-book-2-line text-purple-400 text-sm"></i>
            <p className="text-xs font-semibold text-white">Pattern ngữ pháp:</p>
          </div>
          <p className="text-purple-300 text-xs font-semibold mb-1">{feedback.grammarPattern}</p>
          <p className="text-white/60 text-xs italic">{feedback.grammarPattern}</p>
        </div>
      )}

      {/* Similar Examples */}
      {feedback.similarExamples.length > 0 && (
        <div className="bg-app-card/30 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2 mb-2">
            <i className="ri-list-check text-blue-400 text-sm"></i>
            <p className="text-xs font-semibold text-white">Từ tương tự cần học:</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.similarExamples.map((example, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak Area Alert */}
      {feedback.weakArea && (
        <div className="bg-orange-500/10 border border-orange-500/25 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2 mb-1">
            <i className="ri-error-warning-line text-orange-400 text-sm"></i>
            <p className="text-xs font-semibold text-orange-400">Điểm yếu cần cải thiện:</p>
          </div>
          <p className="text-orange-300/80 text-xs">{feedback.weakArea}</p>
        </div>
      )}

      {/* Recommended Action */}
      <div className="bg-app-accent-primary/10 border border-app-accent-primary/25 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2 mb-1">
          <i className="ri-target-line text-app-accent-primary text-sm"></i>
          <p className="text-xs font-semibold text-app-accent-primary">Khuyến nghị:</p>
        </div>
        <p className="text-white/70 text-xs">{feedback.recommendedAction}</p>
      </div>

      {/* Related Vocabulary */}
      {feedback.relatedVocab.length > 0 && (
        <div className="bg-app-card/30 rounded-lg p-3">
          <div className="flex items-start gap-2 mb-2">
            <i className="ri-book-open-line text-green-400 text-sm"></i>
            <p className="text-xs font-semibold text-white">Từ vựng liên quan:</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {feedback.relatedVocab.map((vocab, idx) => (
              <div
                key={idx}
                className="px-2 py-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-300 text-xs text-center"
              >
                {vocab}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learn More Button */}
      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="mt-3 w-full py-2 rounded-lg bg-app-surface/50 border border-app-border hover:border-app-accent-primary/30 text-white/70 hover:text-white text-xs transition-colors"
        >
          <i className="ri-arrow-right-line mr-1"></i>
          Học thêm từ vựng chủ đề này
        </button>
      )}
    </div>
  );
}
