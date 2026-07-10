import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProgressEntry {
  id: string;
  /** ISO-8601 timestamp of when the entry was logged. */
  date: string;
  weightKg: number;
  bodyFatPct: number | null;
}

interface ProgressState {
  entries: ProgressEntry[];
  addEntry: (weightKg: number, bodyFatPct: number | null) => void;
  removeEntry: (id: string) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (weightKg, bodyFatPct) =>
        set((state) => ({
          entries: [
            ...state.entries,
            { id: crypto.randomUUID(), date: new Date().toISOString(), weightKg, bodyFatPct },
          ],
        })),
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'wedxui-progress' }
  )
);
