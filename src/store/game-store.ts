import { create } from "zustand";

interface GameState {
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  highScore: number;
  soundEnabled: boolean;
  setPaused: (paused: boolean) => void;
  setGameOver: (gameOver: boolean) => void;
  setScore: (score: number) => void;
  incrementScore: (amount?: number) => void;
  setHighScore: (score: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  isPaused: false,
  isGameOver: false,
  score: 0,
  highScore: 0,
  soundEnabled: true,
  setPaused: (paused) => set({ isPaused: paused }),
  setGameOver: (gameOver) => set({ isGameOver: gameOver }),
  setScore: (score) => set({ score }),
  incrementScore: (amount = 1) => set((state) => ({ score: state.score + amount })),
  setHighScore: (highScore) => set({ highScore }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  reset: () => set({ isPaused: false, isGameOver: false, score: 0 }),
}));
