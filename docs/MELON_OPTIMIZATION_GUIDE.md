# Hướng dẫn Tối ưu Melon Chart cho Người Việt Học Tiếng Hàn

## Cấu trúc hiện tại

Dựa trên code tại `src/pages/melon/page.tsx`, hiện tại Melon Chart có:

**Features:**
- Danh sách 100 bài hát Top 100 Melon
- Playlist cá nhân
- Streak tracking (đếm ngày học liên tiếp)
- Search & filter theo genre
- Admin panel upload dữ liệu
- Song Analysis Modal (AI phân tích)
- Flashcard từ vựng
- K-pop cá nhân
- EPS + K-pop integration

**Data structure hiện tại:**
```typescript
{
  rank: number;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  albumArt: string;
  processed: boolean;
  releaseDate: string;
  album: string;
}
```

## Đề xuất cải tiến cho người Việt học tiếng Hàn

### 1. Thêm Vocabulary Extraction (Trích xuất từ vựng)

**Mục tiêu:** Trích xuất từ vựng TOPIK/EPS từ lyrics

**Cấu trúc data mới:**
```typescript
{
  // ... existing fields
  vocabulary: Array<{
    korean: string;           // từ tiếng Hàn
    vietnamese: string;       // nghĩa tiếng Việt
    romaji: string;          // phiên âm
    topikLevel?: "1" | "2";  // cấp độ TOPIK
    epsCategory?: string;     // danh mục EPS
    frequency: number;       // tần suất xuất hiện
    position: number[];       // vị trí trong lyrics (line numbers)
    exampleSentence?: string; // câu ví dụ
  }>;
}
```

**Ví dụ thực tế từ bài "Supernova":**
```json
{
  "rank": 1,
  "title": "Supernova",
  "artist": "aespa",
  "vocabulary": [
    {
      "korean": "중력",
      "vietnamese": "trọng lực",
      "romaji": "jung-ryeok",
      "topikLevel": "2",
      "epsCategory": "science",
      "frequency": 1,
      "position": [2],
      "exampleSentence": "지구의 중력 때문에 우리는 땅에 서 있을 수 있다."
    },
    {
      "korean": "우주",
      "vietnamese": "vũ trụ",
      "romaji": "u-ju",
      "topikLevel": "1",
      "epsCategory": "science",
      "frequency": 2,
      "position": [2, 4],
      "exampleSentence": "우주선이 우주로 날아갔다."
    },
    {
      "korean": "빛",
      "vietnamese": "ánh sáng",
      "romaji": "bit",
      "topikLevel": "1",
      "epsCategory": "general",
      "frequency": 1,
      "position": [3],
      "exampleSentence": "햇빛이 밝게 비친다."
    },
    {
      "korean": "순간",
      "vietnamese": "khoảnh khắc",
      "romaji": "sun-gan",
      "topikLevel": "2",
      "epsCategory": "time",
      "frequency": 1,
      "position": [4],
      "exampleSentence": "그 순간을 잊지 못할 것이다."
    },
    {
      "korean": "영원",
      "vietnamese": "vĩnh cửu",
      "romaji": "yeong-won",
      "topikLevel": "2",
      "epsCategory": "time",
      "frequency": 1,
      "position": [5],
      "exampleSentence": "우리의 우정은 영원할 것이다."
    }
  ]
}
```

**UI Implementation:**
- Thêm tab "Vocabulary" trong Song Detail Modal
- Hiển thị danh sách từ vựng với filter theo TOPIK/EPS
- Click vào từ để xem chi tiết + example sentence
- Quiz: Flashcard từ vựng từ bài hát

### 2. Thêm Grammar Pattern Extraction (Trích xuất ngữ pháp)

**Mục tiêu:** Trích xuất mẫu câu ngữ pháp từ lyrics

**Cấu trúc data mới:**
```typescript
{
  // ... existing fields
  grammar: Array<{
    pattern: string;         // mẫu ngữ pháp
    meaning: string;         // nghĩa tiếng Việt
    level: "1" | "2" | "3";  // cấp độ khó
    examples: Array<{
      sentence: string;      // câu trong lyrics
      translation: string;   // bản dịch
      line: number;          // vị trí trong lyrics
    }>;
    relatedGrammar?: string[]; // ngữ pháp liên quan
  }>;
}
```

**Ví dụ thực tế từ bài "Supernova":**
```json
{
  "grammar": [
    {
      "pattern": "-아/어 보다",
      "meaning": "thử làm gì đó",
      "level": "1",
      "examples": [
        {
          "sentence": "보여",
          "translation": "thử xem",
          "line": 2
        }
      ],
      "relatedGrammar": ["-아/어 보니", "-아/어 보니까"]
    },
    {
      "pattern": "-에 갇히다",
      "meaning": "bị mắc kẹt ở/trong",
      "level": "2",
      "examples": [
        {
          "sentence": "갇혀버렸어",
          "translation": "bị mắc kẹt rồi",
          "line": 2
        }
      ],
      "relatedGrammar": ["-에 넣다", "-에 들어가다"]
    },
    {
      "pattern": "-보다 빠르다",
      "meaning": "nhanh hơn",
      "level": "1",
      "examples": [
        {
          "sentence": "빛보다 빠르게",
          "translation": "nhanh hơn ánh sáng",
          "line": 3
        }
      ],
      "relatedGrammar": ["-보다 느리다", "-보다 크다"]
    },
    {
      "pattern": "-(으)면",
      "meaning": "nếu, khi",
      "level": "1",
      "examples": [
        {
          "sentence": "눈을 감아도",
          "translation": "khi nhắm mắt",
          "line": 6
        }
      ],
      "relatedGrammar": ["-(으)면", "-(으)니까"]
    },
    {
      "pattern": "-길 바라다",
      "meaning": "mong muốn, hy vọng",
      "level": "2",
      "examples": [
        {
          "sentence": "영원하길 바라",
          "translation": "mong muốn vĩnh cửu",
          "line": 8
        }
      ],
      "relatedGrammar": ["-고 싶다", "-기를 원하다"]
    }
  ]
}
```

**UI Implementation:**
- Thêm tab "Grammar" trong Song Detail Modal
- Hiển thị mẫu ngữ pháp với ví dụ từ lyrics
- Link đến bài học ngữ pháp tương ứng
- Quiz: Chọn ngữ pháp đúng cho câu trong lyrics

### 3. Thêm Translation (Bản dịch tiếng Việt)

**Cấu trúc data mới:**
```typescript
{
  // ... existing fields
  translation: {
    full: string;           // bản dịch đầy đủ
    lineByLine: Array<{    // dịch từng dòng
      korean: string;
      vietnamese: string;
    }>;
    culturalNotes?: string[]; // ghi chú văn hóa
  };
}
```

**Ví dụ thực tế:**
```json
{
  "translation": {
    "full": "Thế giới xoay quanh tôi / Bạn bị mắc kẹt trong orbit của tôi / Tôi chạy nhanh hơn ánh sáng / Supernova, khoảnh khắc bùng nổ / Khi nhắm mắt vẫn thấy sự tồn tại của bạn / Cảm giác như đang chống lại trọng lực / Chúng ta gặp nhau ở cuối vũ trụ / Mong khoảnh khắc này vĩnh cửu",
    "lineByLine": [
      {
        "korean": "나를 중심으로 돌아가는 이 세계",
        "vietnamese": "Thế giới xoay quanh tôi"
      },
      {
        "korean": "넌 내 orbit 안에 갇혀버렸어",
        "vietnamese": "Bạn bị mắc kẹt trong orbit của tôi"
      },
      {
        "korean": "빛보다 빠르게 달려가는 나",
        "vietnamese": "Tôi chạy nhanh hơn ánh sáng"
      },
      {
        "korean": "Supernova, 폭발하는 순간",
        "vietnamese": "Supernova, khoảnh khắc bùng nổ"
      },
      {
        "korean": "눈을 감아도 보여 너의 존재",
        "vietnamese": "Khi nhắm mắt vẫn thấy sự tồn tại của bạn"
      },
      {
        "korean": "중력을 거슬러 올라가는 느낌",
        "vietnamese": "Cảm giác như đang chống lại trọng lực"
      },
      {
        "korean": "우주의 끝에서 만나는 우리",
        "vietnamese": "Chúng ta gặp nhau ở cuối vũ trụ"
      },
      {
        "korean": "이 순간이 영원하길 바라",
        "vietnamese": "Mong khoảnh khắc này vĩnh cửu"
      }
    ],
    "culturalNotes": [
      "Orbit: quỹ đạo, ám chỉ sự hút dấn không thể thoát khỏi",
      "Supernova: siêu tân tinh, ngôi sao bùng nổ cực mạnh trong vũ trụ",
      "Bài hát sử dụng hình ảnh vũ trụ để miêu tả sức hút mãnh liệt của tình yêu"
    ]
  }
}
```

### 4. Thêm Pronunciation Guide (Hướng dẫn phát âm)

**Cấu trúc data mới:**
```typescript
{
  // ... existing fields
  pronunciation: {
    difficultWords: Array<{
      korean: string;
      romaji: string;
      tips: string;        // mẹo phát âm
      audioUrl?: string;   // link audio
    }>;
    rhythmPattern?: string; // nhịp điệu bài hát
  };
}
```

**Ví dụ:**
```json
{
  "pronunciation": {
    "difficultWords": [
      {
        "korean": "중력",
        "romaji": "jung-ryeok",
        "tips": "중 đọc như 'jung' (trọng âm), 력 đọc như 'ryeok' (nhẹ)"
      },
      {
        "korean": "우주",
        "romaji": "u-ju",
        "tips": "u đọc ngắn, ju đọc dài"
      }
    ]
  }
}
```

### 5. Thêm Difficulty Level (Cấp độ khó)

**Cấu trúc data mới:**
```typescript
{
  // ... existing fields
  difficulty: {
    overall: "easy" | "medium" | "hard"; // cấp độ tổng thể
    vocabulary: number; // 1-5, độ khó từ vựng
    grammar: number;    // 1-5, độ khó ngữ pháp
    speed: number;      // 1-5, tốc độ bài hát
    recommendedFor: string[]; ["beginner", "intermediate", "advanced"]
  };
}
```

**Ví dụ:**
```json
{
  "difficulty": {
    "overall": "medium",
    "vocabulary": 3,
    "grammar": 2,
    "speed": 4,
    "recommendedFor": ["intermediate"]
  }
}
```

### 6. Thêm Learning Resources (Tài liệu học)

**Cấu trúc data mới:**
```typescript
{
  // ... existing fields
  learningResources: {
    relatedVocabularyLists: string[]; // ["TOPIK 1 science", "EPS vocabulary"]
    relatedGrammarLessons: string[];  // ["comparison patterns", "conditional sentences"]
    quizQuestions: Array<{
      type: "vocabulary" | "grammar" | "comprehension";
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  };
}
```

## Implementation Priority

### Phase 1 (Cao ưu tiên):
1. **Translation** - Bản dịch tiếng Việt (quan trọng nhất cho người Việt)
2. **Vocabulary Extraction** - Trích xuất từ vựng TOPIK/EPS
3. **Difficulty Level** - Phân loại cấp độ khó

### Phase 2 (Trung ưu tiên):
4. **Grammar Pattern** - Trích xuất ngữ pháp
5. **Pronunciation Guide** - Hướng dẫn phát âm
6. **Learning Resources** - Tài liệu học liên quan

### Phase 3 (Thấp ưu tiên):
7. **Cultural Notes** - Ghi chú văn hóa
8. **Audio Resources** - Tài liệu âm thanh
9. **Community Features** - Tính năng cộng đồng

## Data Processing Workflow

### 1. Manual Processing (Admin Panel)

**Bước 1: Upload data**
- Upload file JSON từ script fetch
- Admin panel hiển thị danh sách bài hát

**Bước 2: Add translation**
- Click vào bài hát
- Tab "Translation"
- Input bản dịch tiếng Việt
- Save

**Bước 3: Add vocabulary**
- Tab "Vocabulary"
- Add từ vựng với form:
  - Korean word
  - Vietnamese meaning
  - Romaji
  - TOPIK level
  - EPS category
  - Example sentence
- Save

**Bước 4: Add grammar**
- Tab "Grammar"
- Add pattern ngữ pháp với form:
  - Pattern
  - Meaning
  - Examples from lyrics
- Save

**Bước 5: Set difficulty**
- Tab "Settings"
- Set overall difficulty
- Set vocabulary/grammar/speed scores
- Save

### 2. AI-Assisted Processing (Future)

**Sử dụng AI để:**
- Auto-detect vocabulary từ lyrics (dùng NLP)
- Auto-detect grammar patterns
- Auto-translate lyrics (Google Translate API)
- Auto-categorize difficulty level
- Auto-generate quiz questions

## UI Changes Needed

### 1. Song Detail Modal

**Thêm tabs:**
- Lyrics (hiện tại)
- Translation (mới)
- Vocabulary (mới)
- Grammar (mới)
- Pronunciation (mới)
- Quiz (mới)

### 2. Song List Item

**Thêm badges:**
- Difficulty badge (Easy/Medium/Hard)
- Vocabulary count badge
- Translation status badge

### 3. Filter Options

**Thêm filters:**
- Filter by difficulty
- Filter by TOPIK level
- Filter by EPS category
- Filter by translation status

## Example Implementation

### Component: VocabularyTab.tsx
```tsx
function VocabularyTab({ song }: { song: MelonSong }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Từ vựng ({song.vocabulary?.length || 0})</h3>
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
            TOPIK 1
          </button>
          <button className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
            TOPIK 2
          </button>
        </div>
      </div>
      
      {song.vocabulary?.map((vocab, idx) => (
        <div key={idx} className="bg-app-surface rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-white">{vocab.korean}</span>
            <span className="text-app-accent-primary">{vocab.romaji}</span>
            <span className="text-white/60">{vocab.vietnamese}</span>
            {vocab.topikLevel && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                TOPIK {vocab.topikLevel}
              </span>
            )}
          </div>
          {vocab.exampleSentence && (
            <p className="text-white/40 text-sm mt-2">
              Ví dụ: {vocab.exampleSentence}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Testing Checklist

- [ ] Admin panel có thể add/edit vocabulary
- [ ] Admin panel có thể add/edit grammar
- [ ] Admin panel có thể add/edit translation
- [ ] Vocabulary hiển thị đúng trong Song Detail
- [ ] Grammar hiển thị đúng trong Song Detail
- [ ] Translation hiển thị đúng trong Song Detail
- [ ] Filter by difficulty hoạt động
- [ ] Quiz từ vựng hoạt động
- [ ] Flashcard integration hoạt động

## Notes

- Start với Phase 1 (Translation, Vocabulary, Difficulty)
- Test với 5-10 bài hát trước khi scale
- Sử dụng data hiện tại làm baseline
- Keep backward compatibility với data cũ
