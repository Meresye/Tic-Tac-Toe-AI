export interface GameState {
  board: string;
  action: number;
  reward: number;
}

export interface QTableEntry {
  [action: string]: number;
}

export interface QLearningParams {
  alpha: number;
  gamma: number;
  epsilon: number;
}

export class QLearningAI {
  private qTable: Map<string, QTableEntry> = new Map();
  private params: QLearningParams;
  private history: GameState[] = [];

  constructor(params: QLearningParams = { alpha: 0.1, gamma: 0.9, epsilon: 0.1 }) {
    this.params = params;
  }

  setParams(params: Partial<QLearningParams>) {
    this.params = { ...this.params, ...params };
  }

  getParams(): QLearningParams {
    return { ...this.params };
  }

  private getQValue(state: string, action: number): number {
    const stateEntry = this.qTable.get(state);
    if (!stateEntry) return 0;
    return stateEntry[action] || 0;
  }

  private setQValue(state: string, action: number, value: number): void {
    if (!this.qTable.has(state)) {
      this.qTable.set(state, {});
    }
    const stateEntry = this.qTable.get(state)!;
    stateEntry[action] = value;
  }

  private getMaxQValue(state: string): number {
    const stateEntry = this.qTable.get(state);
    if (!stateEntry || Object.keys(stateEntry).length === 0) return 0;
    return Math.max(...Object.values(stateEntry));
  }

  getBestAction(board: string[], player: string): number {
    const state = board.join('');
    const availableActions = board
      .map((cell, idx) => (cell === '' ? idx : -1))
      .filter(idx => idx !== -1);

    if (availableActions.length === 0) return -1;

    if (Math.random() < this.params.epsilon) {
      return availableActions[Math.floor(Math.random() * availableActions.length)];
    }

    let bestAction = availableActions[0];
    let bestValue = this.getQValue(state, bestAction);

    for (const action of availableActions) {
      const qValue = this.getQValue(state, action);
      if (qValue > bestValue) {
        bestValue = qValue;
        bestAction = action;
      }
    }

    return bestAction;
  }

  recordMove(board: string[], action: number): void {
    this.history.push({
      board: board.join(''),
      action,
      reward: 0
    });
  }

  learn(result: 'win' | 'lose' | 'draw'): void {
    const finalReward = result === 'win' ? 1 : result === 'lose' ? -1 : 0;

    for (let i = this.history.length - 1; i >= 0; i--) {
      const { board, action } = this.history[i];
      const currentQ = this.getQValue(board, action);

      let nextMaxQ = 0;
      if (i < this.history.length - 1) {
        nextMaxQ = this.getMaxQValue(this.history[i + 1].board);
      }

      const reward = i === this.history.length - 1 ? finalReward : 0;
      const newQ = currentQ + this.params.alpha * (reward + this.params.gamma * nextMaxQ - currentQ);

      this.setQValue(board, action, newQ);
    }

    this.history = [];
  }

  resetHistory(): void {
    this.history = [];
  }

  exportQTable(): Record<string, QTableEntry> {
    const exported: Record<string, QTableEntry> = {};
    this.qTable.forEach((value, key) => {
      exported[key] = { ...value };
    });
    return exported;
  }

  importQTable(data: Record<string, QTableEntry>): void {
    this.qTable.clear();
    Object.entries(data).forEach(([key, value]) => {
      this.qTable.set(key, { ...value });
    });
  }

  getQTableSize(): number {
    return this.qTable.size;
  }

  clearQTable(): void {
    this.qTable.clear();
    this.history = [];
  }
}
