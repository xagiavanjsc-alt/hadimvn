// IndexedDB wrapper for offline-first data storage
// Used for large datasets like flashcard and exam history

const DB_NAME = "hanquocoi_db";
const DB_VERSION = 1;

interface FlashcardData {
  card_id: string;
  module_id: string;
  status: "new" | "learning" | "review" | "mastered";
  box: number;
  next_review: string;
  review_count: number;
  success_count: number;
  last_reviewed_at: string;
}

interface ExamHistoryData {
  id: string;
  exam_type: string;
  score: number;
  total: number;
  time_used: number;
  correct_ids: string[];
  taken_at: string;
}

class IndexedDBWrapper {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Flashcard store
        if (!db.objectStoreNames.contains("flashcards")) {
          const flashcardStore = db.createObjectStore("flashcards", { keyPath: "card_id" });
          flashcardStore.createIndex("module_id", "module_id", { unique: false });
          flashcardStore.createIndex("status", "status", { unique: false });
          flashcardStore.createIndex("next_review", "next_review", { unique: false });
        }

        // Exam history store
        if (!db.objectStoreNames.contains("exams")) {
          const examStore = db.createObjectStore("exams", { keyPath: "id" });
          examStore.createIndex("exam_type", "exam_type", { unique: false });
          examStore.createIndex("taken_at", "taken_at", { unique: false });
        }
      };
    });
  }

  // Flashcard operations
  async putFlashcard(data: FlashcardData): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("flashcards", "readwrite");
    const store = tx.objectStore("flashcards");
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFlashcard(cardId: string): Promise<FlashcardData | null> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("flashcards", "readonly");
    const store = tx.objectStore("flashcards");
    return new Promise((resolve, reject) => {
      const request = store.get(cardId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getFlashcardsByModule(moduleId: string): Promise<FlashcardData[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("flashcards", "readonly");
    const store = tx.objectStore("flashcards");
    const index = store.index("module_id");
    return new Promise((resolve, reject) => {
      const request = index.getAll(moduleId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getFlashcardsDueForReview(): Promise<FlashcardData[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("flashcards", "readonly");
    const store = tx.objectStore("flashcards");
    const index = store.index("next_review");
    const now = new Date().toISOString();
    return new Promise((resolve, reject) => {
      const request = index.openCursor(IDBKeyRange.upperBound(now));
      const results: FlashcardData[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFlashcard(cardId: string): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("flashcards", "readwrite");
    const store = tx.objectStore("flashcards");
    return new Promise((resolve, reject) => {
      const request = store.delete(cardId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Exam history operations
  async putExam(data: ExamHistoryData): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("exams", "readwrite");
    const store = tx.objectStore("exams");
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getExam(examId: string): Promise<ExamHistoryData | null> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("exams", "readonly");
    const store = tx.objectStore("exams");
    return new Promise((resolve, reject) => {
      const request = store.get(examId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getExamsByType(examType: string): Promise<ExamHistoryData[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("exams", "readonly");
    const store = tx.objectStore("exams");
    const index = store.index("exam_type");
    return new Promise((resolve, reject) => {
      const request = index.getAll(examType);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllExams(): Promise<ExamHistoryData[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("exams", "readonly");
    const store = tx.objectStore("exams");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteExam(examId: string): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction("exams", "readwrite");
    const store = tx.objectStore("exams");
    return new Promise((resolve, reject) => {
      const request = store.delete(examId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction(["flashcards", "exams"], "readwrite");
    const flashcardStore = tx.objectStore("flashcards");
    const examStore = tx.objectStore("exams");
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = flashcardStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = examStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ]);
  }
}

// Singleton instance
export const indexedDB = new IndexedDBWrapper();
