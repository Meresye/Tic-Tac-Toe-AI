import { create } from 'zustand';
import { QLearningAI } from '../ai/qlearning';
import { gameStorage, GameStats } from '../data/storage';

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string;
    card: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    border: string;
    playerX: string;
    playerO: string;
    winLine: string;
  };
}

export const defaultThemes: Theme[] = [
  {
    id: 'light',
    name: 'Claro Moderno',
    colors: {
      background: '#f5f5f7',
      card: '#ffffff',
      primary: '#007aff',
      secondary: '#5856d6',
      accent: '#ff9500',
      text: '#1d1d1f',
      textMuted: '#86868b',
      border: '#d2d2d7',
      playerX: '#007aff',
      playerO: '#ff3b30',
      winLine: '#34c759',
    },
  },
  {
    id: 'dark',
    name: 'Escuro Minimalista',
    colors: {
      background: '#000000',
      card: '#1c1c1e',
      primary: '#0a84ff',
      secondary: '#5e5ce6',
      accent: '#ff9f0a',
      text: '#ffffff',
      textMuted: '#8e8e93',
      border: '#38383a',
      playerX: '#0a84ff',
      playerO: '#ff453a',
      winLine: '#32d74b',
    },
  },
  {
    id: 'neon',
    name: 'Neon Gamer',
    colors: {
      background: '#0a0a0f',
      card: '#1a1a2e',
      primary: '#00f5ff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      text: '#ffffff',
      textMuted: '#a0a0b0',
      border: '#2a2a3e',
      playerX: '#00f5ff',
      playerO: '#ff00ff',
      winLine: '#ffff00',
    },
  },
];

interface GameStore {
  ai: QLearningAI;
  board: ('X' | 'O' | '')[];
  currentPlayer: 'X' | 'O';
  gameMode: 'player-vs-ai' | 'ai-vs-ai' | 'menu';
  playerSymbol: 'X' | 'O';
  isGameOver: boolean;
  winner: 'X' | 'O' | 'draw' | null;
  winLine: number[] | null;
  stats: GameStats;
  autoStudyRunning: boolean;
  autoStudySpeed: number;
  autoStudyShowBoard: boolean;
  theme: Theme;
  customThemes: Theme[];
  isLoading: boolean;

  setBoard: (board: ('X' | 'O' | '')[]) => void;
  setCurrentPlayer: (player: 'X' | 'O') => void;
  setGameMode: (mode: 'player-vs-ai' | 'ai-vs-ai' | 'menu') => void;
  setPlayerSymbol: (symbol: 'X' | 'O') => void;
  setGameOver: (isOver: boolean) => void;
  setWinner: (winner: 'X' | 'O' | 'draw' | null) => void;
  setWinLine: (line: number[] | null) => void;
  setStats: (stats: GameStats) => void;
  setAutoStudyRunning: (running: boolean) => void;
  setAutoStudySpeed: (speed: number) => void;
  setAutoStudyShowBoard: (show: boolean) => void;
  setTheme: (theme: Theme) => void;
  addCustomTheme: (theme: Theme) => void;
  removeCustomTheme: (id: string) => void;
  resetBoard: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  updateStats: (result: 'win' | 'lose' | 'draw', mode: 'player-vs-ai' | 'ai-vs-ai', winner?: 'X' | 'O') => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ai: new QLearningAI({ alpha: 0.1, gamma: 0.9, epsilon: 0.1 }),
  board: Array(9).fill(''),
  currentPlayer: 'X',
  gameMode: 'menu',
  playerSymbol: 'X',
  isGameOver: false,
  winner: null,
  winLine: null,
  stats: {
    totalGames: 0,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
    aiVsAiGames: 0,
    aiXWins: 0,
    aiOWins: 0,
    lastPlayed: new Date().toISOString(),
  },
  autoStudyRunning: false,
  autoStudySpeed: 1,
  autoStudyShowBoard: true,
  theme: defaultThemes[0],
  customThemes: [],
  isLoading: true,

  setBoard: (board) => set({ board }),
  setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),
  setGameMode: (gameMode) => set({ gameMode }),
  setPlayerSymbol: (playerSymbol) => set({ playerSymbol }),
  setGameOver: (isGameOver) => set({ isGameOver }),
  setWinner: (winner) => set({ winner }),
  setWinLine: (winLine) => set({ winLine }),
  setStats: (stats) => set({ stats }),
  setAutoStudyRunning: (autoStudyRunning) => set({ autoStudyRunning }),
  setAutoStudySpeed: (autoStudySpeed) => set({ autoStudySpeed }),
  setAutoStudyShowBoard: (autoStudyShowBoard) => set({ autoStudyShowBoard }),
  setTheme: (theme) => set({ theme }),
  addCustomTheme: (theme) => set((state) => ({ customThemes: [...state.customThemes, theme] })),
  removeCustomTheme: (id) =>
    set((state) => ({ customThemes: state.customThemes.filter((t) => t.id !== id) })),

  resetBoard: () =>
    set({
      board: Array(9).fill(''),
      currentPlayer: 'X',
      isGameOver: false,
      winner: null,
      winLine: null,
    }),

  loadFromStorage: async () => {
    try {
      await gameStorage.init();
      const aiData = await gameStorage.loadAIData();
      const stats = await gameStorage.loadStats();

      if (aiData) {
        const { ai } = get();
        ai.importQTable(aiData.qTable);
        ai.setParams(aiData.params);
      }

      set({ stats, isLoading: false });
    } catch (error) {
      console.error('Failed to load from storage:', error);
      set({ isLoading: false });
    }
  },

  saveToStorage: async () => {
    try {
      const { ai, stats } = get();
      const qTable = ai.exportQTable();
      const params = ai.getParams();

      await gameStorage.saveAIData(qTable, params);
      await gameStorage.saveStats(stats);
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  },

  updateStats: async (result, mode, winner) => {
    const { stats } = get();
    const newStats = { ...stats };

    newStats.totalGames++;
    newStats.lastPlayed = new Date().toISOString();

    if (mode === 'player-vs-ai') {
      if (result === 'win') {
        newStats.playerWins++;
      } else if (result === 'lose') {
        newStats.aiWins++;
      } else {
        newStats.draws++;
      }
    } else if (mode === 'ai-vs-ai') {
      newStats.aiVsAiGames++;
      if (winner === 'X') {
        newStats.aiXWins++;
      } else if (winner === 'O') {
        newStats.aiOWins++;
      } else {
        newStats.draws++;
      }
    }

    set({ stats: newStats });
    await gameStorage.saveStats(newStats);
  },
}));
