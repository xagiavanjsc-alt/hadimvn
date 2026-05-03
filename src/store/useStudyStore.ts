import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Study-related state management
 * Tracks study sessions, progress, and preferences
 */

interface StudyState {
  currentSession: {
    startedAt: number | null;
    questionsAnswered: number;
    correctAnswers: number;
  };
  preferences: {
    autoPlayAudio: boolean;
    showHints: boolean;
    shuffleQuestions: boolean;
  };
  startSession: () => void;
  endSession: () => void;
  updateProgress: (correct: boolean) => void;
  setPreference: (key: keyof StudyState['preferences'], value: boolean) => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      currentSession: {
        startedAt: null,
        questionsAnswered: 0,
        correctAnswers: 0,
      },
      preferences: {
        autoPlayAudio: false,
        showHints: true,
        shuffleQuestions: false,
      },
      startSession: () => 
        set({ 
          currentSession: { 
            startedAt: Date.now(), 
            questionsAnswered: 0, 
            correctAnswers: 0 
          } 
        }),
      endSession: () => 
        set({ 
          currentSession: { 
            startedAt: null, 
            questionsAnswered: 0, 
            correctAnswers: 0 
          } 
        }),
      updateProgress: (correct) =>
        set((state) => ({
          currentSession: {
            ...state.currentSession,
            questionsAnswered: state.currentSession.questionsAnswered + 1,
            correctAnswers: state.currentSession.correctAnswers + (correct ? 1 : 0),
          },
        })),
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
    }),
    {
      name: 'kts-study-storage',
    }
  )
);
