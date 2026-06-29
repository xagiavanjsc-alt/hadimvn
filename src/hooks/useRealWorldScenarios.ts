import { useState, useEffect } from "react";

interface Scenario {
  id: string;
  title: string;
  type: "interview" | "email" | "conversation";
  category: string;
  difficulty: number;
  content: {
    korean: string;
    vietnamese: string;
    audio?: string;
  };
  tips: string[];
  vocabulary: string[];
}

export function useRealWorldScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedType, setSelectedType] = useState<"interview" | "email" | "conversation" | null>(null);
  const [loading, setLoading] = useState(true);

  const mockScenarios: Scenario[] = [
    {
      id: "1",
      title: "Phỏng vấn giới thiệu bản thân",
      type: "interview",
      category: "phỏng vấn",
      difficulty: 2,
      content: {
        korean: "안녕하세요, 저는 김철수입니다. 저는 한국어를 6개월 동안 공부했습니다. 열심히 일하겠습니다.",
        vietnamese: "Xin chào, tôi là Kim Cheol-su. Tôi đã học tiếng Hàn trong 6 tháng. Tôi sẽ làm việc chăm chỉ.",
      },
      tips: [
        "Giới thiệu tên, tuổi, quê quán",
        "Nêu kinh nghiệm học tiếng Hàn",
        "Bày tỏ quyết tâm làm việc",
      ],
      vocabulary: ["안녕하세요", "저는", "공부했습니다", "열심히", "일하겠습니다"],
    },
    {
      id: "2",
      title: "Email xin nghỉ phép",
      type: "email",
      category: "email công việc",
      difficulty: 3,
      content: {
        korean: "팀장님, 안녕하세요. 다음 주 월요일에 병원에 가야 해서 휴가를 신청하고 싶습니다. 감사합니다.",
        vietnamese: "Trưởng nhóm, xin chào. Thứ Hai tuần sau tôi phải đi bệnh viện nên tôi muốn xin nghỉ phép. Cảm ơn.",
      },
      tips: [
        "Xưng hô đúng cách (팀장님)",
        "Nêu lý do rõ ràng",
        "Kết thúc lịch sự",
      ],
      vocabulary: ["팀장님", "병원", "휴가", "신청하다", "감사합니다"],
    },
    {
      id: "3",
      title: "Hội thoại tại công trường",
      type: "conversation",
      category: "hội thoại công trường",
      difficulty: 2,
      content: {
        korean: "A: 안전 모자를 쓰세요.\nB: 네, 알겠습니다.",
        vietnamese: "A: Đội mũ bảo hộ nhé.\nB: Vâng, tôi hiểu rồi.",
      },
      tips: [
        "Sử dụng câu mệnh lịch sự",
        "Trả lời ngắn gọn",
        "Lưu ý an toàn lao động",
      ],
      vocabulary: ["안전 모자", "쓰다", "네", "알겠습니다"],
    },
    {
      id: "4",
      title: "Phỏng vấn về kinh nghiệm làm việc",
      type: "interview",
      category: "phỏng vấn",
      difficulty: 3,
      content: {
        korean: "저는 농장에서 2년 동안 일했습니다. 채소를 재배하고 수확하는 일을 했습니다.",
        vietnamese: "Tôi đã làm việc ở nông trại trong 2 năm. Tôi trồng và thu hoạch rau.",
      },
      tips: [
        "Nêu kinh nghiệm cụ thể",
        "Mô tả công việc đã làm",
        "Sử dụng từ vựng chuyên ngành",
      ],
      vocabulary: ["농장", "일하다", "채소", "재배하다", "수확하다"],
    },
    {
      id: "5",
      title: "Email báo cáo công việc",
      type: "email",
      category: "email công việc",
      difficulty: 4,
      content: {
        korean: "팀장님, 이번 주 작업 보고서입니다. 모든 작업이 계획대로 진행되었습니다. 문제가 없습니다.",
        vietnamese: "Trưởng nhóm, đây là báo cáo công việc tuần này. Tất cả công việc đã tiến triển theo kế hoạch. Không có vấn đề.",
      },
      tips: [
        "Báo cáo ngắn gọn, rõ ràng",
        "Nêu kết quả công việc",
        "Xác nhận không có vấn đề",
      ],
      vocabulary: ["작업", "보고서", "계획", "진행되다", "문제"],
    },
  ];

  useEffect(() => {
    setScenarios(mockScenarios);
    setLoading(false);
  }, []);

  const filterByType = (type: "interview" | "email" | "conversation") => {
    setSelectedType(type);
  };

  const clearFilter = () => {
    setSelectedType(null);
  };

  const getFilteredScenarios = () => {
    if (!selectedType) return scenarios;
    return scenarios.filter(s => s.type === selectedType);
  };

  const getScenario = (id: string) => {
    return scenarios.find(s => s.id === id);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "interview": return "Phỏng vấn";
      case "email": return "Email";
      case "conversation": return "Hội thoại";
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "interview": return "ri-user-search-line";
      case "email": return "ri-mail-line";
      case "conversation": return "ri-chat-3-line";
      default: return "ri-question-line";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "interview": return "#a78bfa";
      case "email": return "#60a5fa";
      case "conversation": return "#4ade80";
      default: return "#94a3b8";
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Dễ";
      case 2: return "Khá dễ";
      case 3: return "Trung bình";
      case 4: return "Khá khó";
      case 5: return "Khó";
      default: return `${level}`;
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "#4ade80";
      case 2: return "#60a5fa";
      case 3: return "#fbbf24";
      case 4: return "#f97316";
      case 5: return "#ef4444";
      default: return "#94a3b8";
    }
  };

  return {
    scenarios,
    selectedType,
    loading,
    filterByType,
    clearFilter,
    getFilteredScenarios,
    getScenario,
    getTypeLabel,
    getTypeIcon,
    getTypeColor,
    getDifficultyLabel,
    getDifficultyColor,
  };
}
