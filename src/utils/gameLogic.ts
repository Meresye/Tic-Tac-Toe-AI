export type Player = 'X' | 'O' | '';

export function checkWinner(board: Player[]): { winner: Player | null; line: number[] | null } {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  return { winner: null, line: null };
}

export function isBoardFull(board: Player[]): boolean {
  return board.every(cell => cell !== '');
}

export function isGameOver(board: Player[]): boolean {
  const { winner } = checkWinner(board);
  return winner !== null || isBoardFull(board);
}

export function getGameResult(board: Player[], currentPlayer: Player): 'win' | 'lose' | 'draw' | null {
  const { winner } = checkWinner(board);

  if (winner === null && !isBoardFull(board)) {
    return null;
  }

  if (winner === null) {
    return 'draw';
  }

  return winner === currentPlayer ? 'win' : 'lose';
}
