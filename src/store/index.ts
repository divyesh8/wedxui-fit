import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── AUTH STORE ────────────────────────────────────────

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

/**
 * Client-side account stored in localStorage — the stopgap until the
 * database/Auth.js phase. One account per browser; password is stored
 * as a SHA-256 hash (demo-grade, NOT production auth).
 */
interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AuthState {
  user: User | null;
  account: StoredAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Returns an error message, or null on success. */
  register: (name: string, email: string, password: string) => Promise<string | null>;
  /** Returns an error message, or null on success. */
  login: (email: string, password: string) => Promise<string | null>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      account: null,
      isAuthenticated: false,
      isLoading: true,

      register: async (name, email, password) => {
        const normalized = email.trim().toLowerCase();
        const existing = get().account;
        if (existing && existing.email === normalized) {
          return 'An account with this email already exists — log in instead.';
        }
        const account: StoredAccount = {
          id: crypto.randomUUID(),
          name: name.trim(),
          email: normalized,
          passwordHash: await sha256(password),
        };
        set({
          account,
          user: { id: account.id, name: account.name, email: account.email, image: null, role: 'USER' },
          isAuthenticated: true,
          isLoading: false,
        });
        return null;
      },

      login: async (email, password) => {
        const account = get().account;
        if (!account) return 'No account found on this device — create one first.';
        if (account.email !== email.trim().toLowerCase()) return 'No account found with this email.';
        if (account.passwordHash !== (await sha256(password))) return 'Incorrect password.';
        set({
          user: { id: account.id, name: account.name, email: account.email, image: null, role: 'USER' },
          isAuthenticated: true,
          isLoading: false,
        });
        return null;
      },

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      // Keeps the account so the user can log back in.
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    { name: 'wedxui-auth' }
  )
);

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
