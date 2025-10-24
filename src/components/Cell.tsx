import { motion } from 'framer-motion';
import { X, Circle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { checkWinner, isBoardFull } from '../utils/gameLogic';

interface CellProps {
  index: number;
  value: 'X' | 'O' | '';
  isWinning: boolean;
}

export function Cell({ index, value, isWinning }: CellProps) {
  const {
    board,
    currentPlayer,
    gameMode,
    playerSymbol,
    isGameOver,
    ai,
    theme,
    setBoard,
    setCurrentPlayer,
    setGameOver,
    setWinner,
    setWinLine,
    updateStats,
    saveToStorage,
  } = useGameStore();

  const handleClick = async () => {
    if (value !== '' || isGameOver || gameMode !== 'player-vs-ai' || currentPlayer !== playerSymbol) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const { winner, line } = checkWinner(newBoard);

    if (winner) {
      setGameOver(true);
      setWinner(winner);
      setWinLine(line);

      const result = winner === playerSymbol ? 'win' : 'lose';
      await updateStats(result, 'player-vs-ai');
      await saveToStorage();
      return;
    }

    if (isBoardFull(newBoard)) {
      setGameOver(true);
      setWinner('draw');
      await updateStats('draw', 'player-vs-ai');
      await saveToStorage();
      return;
    }

    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);

    setTimeout(async () => {
      const aiMove = ai.getBestAction(newBoard, nextPlayer);
      if (aiMove !== -1) {
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = nextPlayer;
        setBoard(aiBoard);

        ai.recordMove(newBoard, aiMove);

        const { winner: aiWinner, line: aiLine } = checkWinner(aiBoard);

        if (aiWinner) {
          setGameOver(true);
          setWinner(aiWinner);
          setWinLine(aiLine);

          const aiResult = aiWinner === nextPlayer ? 'win' : 'lose';
          ai.learn(aiResult);

          const playerResult = aiWinner === playerSymbol ? 'win' : 'lose';
          await updateStats(playerResult, 'player-vs-ai');
          await saveToStorage();
          return;
        }

        if (isBoardFull(aiBoard)) {
          setGameOver(true);
          setWinner('draw');
          ai.learn('draw');
          await updateStats('draw', 'player-vs-ai');
          await saveToStorage();
          return;
        }

        setCurrentPlayer(playerSymbol);
      }
    }, 300);
  };

  return (
    <motion.button
      whileHover={{ scale: value === '' && !isGameOver && gameMode === 'player-vs-ai' ? 1.05 : 1 }}
      whileTap={{ scale: value === '' && !isGameOver && gameMode === 'player-vs-ai' ? 0.95 : 1 }}
      onClick={handleClick}
      disabled={value !== '' || isGameOver || gameMode !== 'player-vs-ai'}
      className="relative w-24 h-24 rounded-xl transition-all duration-200 flex items-center justify-center"
      style={{
        backgroundColor: isWinning ? `${theme.colors.winLine}20` : theme.colors.background,
        border: `2px solid ${isWinning ? theme.colors.winLine : theme.colors.border}`,
        cursor: value === '' && !isGameOver && gameMode === 'player-vs-ai' ? 'pointer' : 'default',
      }}
    >
      {value === 'X' && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <X size={48} strokeWidth={3} style={{ color: theme.colors.playerX }} />
        </motion.div>
      )}
      {value === 'O' && (
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Circle size={48} strokeWidth={3} style={{ color: theme.colors.playerO }} />
        </motion.div>
      )}
    </motion.button>
  );
}
