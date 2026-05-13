export interface MelonSong {
  rank: number;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  albumArt: string;
  processed?: boolean;
  releaseDate?: string;
  album?: string;
  translation?: {
    full?: string;
    lineByLine?: Array<{ korean: string; vietnamese: string }>;
    culturalNotes?: string[];
  };
  vocabulary?: Array<{
    korean: string;
    vietnamese: string;
    romaji: string;
    topikLevel?: "1" | "2";
    epsCategory?: string;
    frequency?: number;
    position?: number[];
    exampleSentence?: string;
  }>;
  grammar?: Array<{
    pattern: string;
    meaning: string;
    level: "1" | "2" | "3";
    examples: Array<{ sentence: string; translation: string; line: number }>;
    relatedGrammar?: string[];
  }>;
  difficulty?: {
    overall: "easy" | "medium" | "hard";
    vocabulary: number;
    grammar: number;
    speed: number;
    recommendedFor: string[];
  };
}

export const mockMelonSongs: MelonSong[] = [
  {
    rank: 1,
    title: "Supernova",
    artist: "aespa",
    genre: "K-pop",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `나를 중심으로 돌아가는 이 세계
넌 내 orbit 안에 갇혀버렸어
빛보다 빠르게 달려가는 나
Supernova, 폭발하는 순간

눈을 감아도 보여 너의 존재
중력을 거슬러 올라가는 느낌
우주의 끝에서 만나는 우리
이 순간이 영원하길 바라`,
    processed: false,
  },
  {
    rank: 2,
    title: "Magnetic",
    artist: "ILLIT",
    genre: "K-pop",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `자꾸만 끌려와 너한테
이상하게 자꾸 신경 쓰여
자석처럼 붙어버린 우리
Magnetic, 떨어질 수가 없어

처음 본 순간부터 알았어
이건 보통 감정이 아니야
네 눈빛에 빠져드는 나
어떻게 해야 할지 모르겠어`,
    processed: true,
  },
  {
    rank: 3,
    title: "How Sweet",
    artist: "NewJeans",
    genre: "K-pop / R&B",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `달콤한 너의 말 한마디
하루 종일 귓가에 맴돌아
How sweet, 어떻게 이렇게 달콤해
너만 보면 심장이 두근거려

아무것도 아닌 척하지만
사실 너 때문에 웃고 있어
이 감정이 뭔지 알면서도
모른 척하고 싶은 나야`,
    processed: false,
  },
  {
    rank: 4,
    title: "Crazy",
    artist: "LE SSERAFIM",
    genre: "K-pop / Dance",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `미쳐가고 있어 너 때문에
이성을 잃어버린 것 같아
Crazy, 완전히 미쳐버렸어
너 없인 아무것도 못 해

하루에도 수백 번 생각해
네 얼굴, 네 목소리, 네 향기
이게 사랑인지 집착인지
구분이 안 될 정도야`,
    processed: false,
  },
  {
    rank: 5,
    title: "Whiplash",
    artist: "aespa",
    genre: "K-pop",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `채찍처럼 강렬한 너의 시선
온몸이 굳어버리는 느낌
Whiplash, 정신을 차릴 수가 없어
너의 존재 자체가 충격이야

예상치 못한 순간에 나타나
내 세계를 뒤흔들어 놓는 너
이 감각을 뭐라 설명할까
그냥 너라고밖에 못 하겠어`,
    processed: false,
  },
  {
    rank: 6,
    title: "Spicy",
    artist: "aespa",
    genre: "K-pop",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `매콤하게 타오르는 이 감정
참을 수가 없어 더 이상
Spicy, 자꾸만 더 원하게 돼
중독된 것 같아 너한테

처음엔 그냥 지나치려 했어
근데 자꾸 눈이 가는 걸 어떡해
이 불꽃 같은 감정을 어떻게
끄면 되는지 알려줘`,
    processed: false,
  },
  {
    rank: 7,
    title: "Ditto",
    artist: "NewJeans",
    genre: "K-pop / Indie",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `똑같이 느끼고 있어 나도
이 감정 혼자만의 게 아니야
Ditto, 메아리처럼 돌아와
네 마음이 내 마음이 되어

말하지 않아도 알 것 같아
눈빛만으로 통하는 우리
이런 게 진짜 연결이겠지
언어가 필요 없는 사이`,
    processed: false,
  },
  {
    rank: 8,
    title: "Hype Boy",
    artist: "NewJeans",
    genre: "K-pop / Pop",
    albumArt: "/images/melon/album-placeholder.svg",
    lyrics: `나를 설레게 하는 너
매일 기다려지는 하루
Hype boy, 내 심장을 뛰게 해
너만 보면 기분이 좋아져

친구들한테 말 못 하지만
사실 너 생각뿐이야
이 두근거림을 어떻게 해
너한테 말해도 될까`,
    processed: false,
  },
];

export const mockProcessedLesson = {
  story: `Minh đang ngồi học bài thì bỗng nghe tiếng nhạc vang lên từ phòng bên. "야, 이 노래 알아?" (Ya, i norae ara? - Này, mày biết bài này không?) - Hana hỏi với vẻ hào hứng. Minh lắc đầu. "aespa의 'Supernova'야! 가사가 진짜 멋있어" (aespa-eui 'Supernova'ya! Gasa-ga jinjja meositeo - Là 'Supernova' của aespa! Lời bài hát thật tuyệt vời). Minh tò mò hỏi: "무슨 뜻이야?" (museun tteusiya? - Nghĩa là gì vậy?). Hana giải thích: "우주 (ujju - vũ trụ) và 중력 (jungnyeok - trọng lực) - những từ nghe có vẻ khoa học nhưng lại rất lãng mạn trong K-pop đấy!"`,
  vocabulary: [
    { word: "우주 (ujju)", meaning: "Vũ trụ / Universe", example: "우주가 넓어요 - Vũ trụ rộng lớn" },
    { word: "중력 (jungnyeok)", meaning: "Trọng lực / Gravity", example: "중력을 거슬러 - Chống lại trọng lực" },
    { word: "폭발 (pokbal)", meaning: "Vụ nổ / Explosion", example: "폭발하는 순간 - Khoảnh khắc bùng nổ" },
    { word: "존재 (jonjae)", meaning: "Sự tồn tại / Existence", example: "너의 존재 - Sự tồn tại của em" },
    { word: "영원 (yeongwon)", meaning: "Vĩnh cửu / Eternity", example: "영원하길 바라 - Mong muốn mãi mãi" },
  ],
  explanation: `Bài hát sử dụng nhiều từ vựng về vũ trụ để diễn tả tình cảm mãnh liệt. Đây là cách K-pop thường dùng - lấy hình ảnh thiên văn học để nói về tình yêu. Chú ý cấu trúc "~길 바라" (gil bara) có nghĩa là "mong muốn/hy vọng rằng..." - rất phổ biến trong lời bài hát Hàn Quốc.`,
};
