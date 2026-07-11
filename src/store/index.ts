import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── AUTH STORE ────────────────────────────────────────
// The httpOnly session cookie + AuthSession row in Postgres are the source of
// truth. This store is only a client cache of the current user, hydrated from
// /api/auth/me. It is NOT persisted — no auth state lives in localStorage.

export interface SessionUser {
  id: string;
  username: string;
  name: string | null;
  email: string;
  role: string;
}

interface AuthState {
  user: SessionUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  setUser: (user: SessionUser | null) => void;
  /** Re-fetch the current user from the server session. */
  refresh: () => Promise<SessionUser | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
  refresh: async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      const user: SessionUser | null = data.user ?? null;
      set({ user, status: user ? 'authenticated' : 'unauthenticated' });
      return user;
    } catch {
      set({ user: null, status: 'unauthenticated' });
      return null;
    }
  },
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    set({ user: null, status: 'unauthenticated' });
  },
}));

// ─── WORKOUT SESSION STORE ─────────────────────────────

interface ActiveExercise {
  exerciseId: string;
  name: string;
  sets: { reps: number; weight: number; completed: boolean }[];
}

interface WorkoutSessionState {
  isActive: boolean;
  startTime: number | null;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;

  startWorkout: (exercises: ActiveExercise[]) => void;
  addSet: (exerciseIndex: number, reps: number, weight: number) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  nextExercise: () => void;
  endWorkout: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>()(
  persist(
    (set, get) => ({
      isActive: false,
      startTime: null,
      exercises: [],
      currentExerciseIndex: 0,

      startWorkout: (exercises) => set({
        isActive: true,
        startTime: Date.now(),
        exercises,
        currentExerciseIndex: 0,
      }),

      addSet: (exerciseIndex, reps, weight) => {
        const state = get();
        const newExercises = [...state.exercises];
        newExercises[exerciseIndex].sets.push({ reps, weight, completed: false });
        set({ exercises: newExercises });
      },

      completeSet: (exerciseIndex, setIndex) => {
        const state = get();
        const newExercises = [...state.exercises];
        newExercises[exerciseIndex].sets[setIndex].completed = true;
        set({ exercises: newExercises });
      },

      nextExercise: () => {
        const state = get();
        if (state.currentExerciseIndex < state.exercises.length - 1) {
          set({ currentExerciseIndex: state.currentExerciseIndex + 1 });
        }
      },

      endWorkout: () => set({
        isActive: false,
        startTime: null,
        exercises: [],
        currentExerciseIndex: 0,
      }),
    }),
    { name: 'wedxui-workout-session' }
  )
);

// ─── UI STORE ──────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  toastQueue: { id: string; message: string; type: 'success' | 'error' | 'info' }[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  activeModal: null,
  toastQueue: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveModal: (modal) => set({ activeModal: modal }),

  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ toastQueue: [...state.toastQueue, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => set((state) => ({
    toastQueue: state.toastQueue.filter((t) => t.id !== id),
  })),
}));
