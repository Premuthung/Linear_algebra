import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Global progress and settings. Saved in localStorage; there is no backend.

interface ProgressState {
  /** Lesson ids whose quiz was passed. */
  passed: Record<string, boolean>;
  /** Snap dragged arrows to whole numbers. */
  snap: boolean;
  /** Show the arithmetic behind each picture. */
  showNumbers: boolean;
  markPassed: (lessonId: string) => void;
  setSnap: (snap: boolean) => void;
  setShowNumbers: (show: boolean) => void;
  resetProgress: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      passed: {},
      snap: true,
      showNumbers: true,
      markPassed: (lessonId) => set((s) => ({ passed: { ...s.passed, [lessonId]: true } })),
      setSnap: (snap) => set({ snap }),
      setShowNumbers: (showNumbers) => set({ showNumbers }),
      resetProgress: () => set({ passed: {} }),
    }),
    { name: 'la-progress-v1' },
  ),
);
