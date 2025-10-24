import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GameMatch {
  id: string;
  timestamp: string;
  mode: 'player-vs-ai' | 'ai-vs-ai';
  moves: Array<{
    state: string;
    action: number;
    player: string;
  }>;
  result: 'win' | 'lose' | 'draw';
  winner?: string;
  iterations: number;
  durationMs: number;
}

interface GameStats {
  totalGames: number;
  playerWins: number;
  aiWins: number;
  draws: number;
  aiVsAiGames: number;
  aiXWins: number;
  aiOWins: number;
  lastPlayed: string;
}

interface AIData {
  qTable: Record<string, Record<string, number>>;
  params: {
    alpha: number;
    gamma: number;
    epsilon: number;
  };
  stats: GameStats;
  matches: GameMatch[];
}

interface GameDB extends DBSchema {
  matches: {
    key: string;
    value: GameMatch;
    indexes: { 'by-timestamp': string; 'by-mode': string };
  };
  aiData: {
    key: string;
    value: {
      id: string;
      qTable: Record<string, Record<string, number>>;
      params: {
        alpha: number;
        gamma: number;
        epsilon: number;
      };
    };
  };
  stats: {
    key: string;
    value: GameStats;
  };
}

class GameStorage {
  private db: IDBPDatabase<GameDB> | null = null;
  private dbName = 'TicTacToeAI';
  private dbVersion = 1;

  async init(): Promise<void> {
    this.db = await openDB<GameDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('matches')) {
          const matchStore = db.createObjectStore('matches', { keyPath: 'id' });
          matchStore.createIndex('by-timestamp', 'timestamp');
          matchStore.createIndex('by-mode', 'mode');
        }
        if (!db.objectStoreNames.contains('aiData')) {
          db.createObjectStore('aiData', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }
      },
    });
  }

  private ensureDB(): IDBPDatabase<GameDB> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  async saveMatch(match: GameMatch): Promise<void> {
    const db = this.ensureDB();
    await db.put('matches', match);
  }

  async getMatches(limit?: number): Promise<GameMatch[]> {
    const db = this.ensureDB();
    const tx = db.transaction('matches', 'readonly');
    const index = tx.store.index('by-timestamp');
    let matches = await index.getAll();
    matches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (limit) {
      matches = matches.slice(0, limit);
    }
    return matches;
  }

  async saveAIData(qTable: Record<string, Record<string, number>>, params: any): Promise<void> {
    const db = this.ensureDB();
    await db.put('aiData', {
      id: 'main',
      qTable,
      params,
    });
  }

  async loadAIData(): Promise<{ qTable: Record<string, Record<string, number>>; params: any } | null> {
    const db = this.ensureDB();
    const data = await db.get('aiData', 'main');
    if (!data) return null;
    return { qTable: data.qTable, params: data.params };
  }

  async saveStats(stats: GameStats): Promise<void> {
    const db = this.ensureDB();
    await db.put('stats', { ...stats, id: 'main' });
  }

  async loadStats(): Promise<GameStats> {
    const db = this.ensureDB();
    const stats = await db.get('stats', 'main');
    if (!stats) {
      return {
        totalGames: 0,
        playerWins: 0,
        aiWins: 0,
        draws: 0,
        aiVsAiGames: 0,
        aiXWins: 0,
        aiOWins: 0,
        lastPlayed: new Date().toISOString(),
      };
    }
    return stats;
  }

  async exportAllData(): Promise<AIData> {
    const db = this.ensureDB();
    const aiData = await this.loadAIData();
    const stats = await this.loadStats();
    const matches = await this.getMatches();

    return {
      qTable: aiData?.qTable || {},
      params: aiData?.params || { alpha: 0.1, gamma: 0.9, epsilon: 0.1 },
      stats,
      matches,
    };
  }

  async importAllData(data: AIData): Promise<void> {
    const db = this.ensureDB();

    await this.saveAIData(data.qTable, data.params);
    await this.saveStats(data.stats);

    for (const match of data.matches) {
      await this.saveMatch(match);
    }
  }

  async clearAllData(): Promise<void> {
    const db = this.ensureDB();
    await db.clear('matches');
    await db.clear('aiData');
    await db.clear('stats');
  }
}

export const gameStorage = new GameStorage();
export type { GameMatch, GameStats, AIData };
