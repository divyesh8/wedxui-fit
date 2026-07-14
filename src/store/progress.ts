import { create } from 'zustand';

export interface ProgressEntry {
  id: string;
  /** ISO-8601 timestamp of when the entry was logged. */
  date: string;
  weightKg: number;
  bodyFatPct: number | null;
}

interface ProgressState {
  entries: ProgressEntry[];
  loaded: boolean;
  /** Hydrates from Neon — call once on mount. */
  loadEntries: () => Promise<void>;
  addEntry: (weightKg: number, bodyFatPct: number | null) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

// Server-backed — Neon's progress_entries table is the source of truth, this
// store is only a client cache (same pattern as the auth/profile stores).
export const useProgressStore = create<ProgressState>((set) => ({
  entries: [],
  loaded: false,

  loadEntries: async () => {
    const res = await fetch('/api/progress');
    if (!res.ok) return;
    const data = await res.json();
    set({ entries: data.entries ?? [], loaded: true });
  },

  addEntry: async (weightKg, bodyFatPct) => {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weightKg, bodyFatPct }),
    });
    if (!res.ok) return;
    const data = await res.json();
    set((state) => ({ entries: [...state.entries, data.entry] }));
  },

  removeEntry: async (id) => {
    const res = await fetch(`/api/progress/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },
}));
