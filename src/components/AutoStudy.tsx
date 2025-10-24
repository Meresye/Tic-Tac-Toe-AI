import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { checkWinner, isBoardFull } from '../utils/gameLogic';
import { Board } from './Board';

export function AutoStudy() {
  const {
    ai,
    board,
    autoStudyRunning,
    autoStudySpeed,
    autoStudyShowBoard,
    theme,
    setBoard,
    setCurrentPlayer,
    setGameOver,
    setWinner,
    setWinLine,
    setAutoStudyRunning,
    setAutoStudySpeed,
    setAutoStudyShowBoard,
    updateStats,
    saveToStorage,
    resetBoard,
  } = useGameStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gamesCountRef = useRef(0);

  const playOneGame = async () => {
    let gameBoard = Array(9).fill('');
    let currentPlayer: 'X' | 'O' = 'X';
    const aiX = ai;
    const aiO = ai;

    while (true) {
      const move = currentPlayer === 'X'
        ? aiX.getBestAction(gameBoard, 'X')
        : aiO.getBestAction(gameBoard, 'O');

      if (move === -1) break;

      gameBoard[move] = currentPlayer;

      if (currentPlayer === 'X') {
        aiX.recordMove(gameBoard.map((cell, idx) => (idx === move ? '' : cell)), move);
      } else {
        aiO.recordMove(gameBoard.map((cell, idx) => (idx === move ? '' : cell)), move);
      }

      if (autoStudyShowBoard) {
        setBoard([...gameBoard]);
        await new Promise(resolve => setTimeout(resolve, 1000 / autoStudySpeed));
      }

      const { winner, line } = checkWinner(gameBoard);

      if (winner) {
        if (autoStudyShowBoard) {
          setWinLine(line);
          setWinner(winner);
          setGameOver(true);
          await new Promise(resolve => setTimeout(resolve, 500 / autoStudySpeed));
        }

        if (winner === 'X') {
          aiX.learn('win');
          aiO.learn('lose');
        } else {
          aiX.learn('lose');
          aiO.learn('win');
        }

        await updateStats('win', 'ai-vs-ai', winner);
        gamesCountRef.current++;

        if (gamesCountRef.current % 10 === 0) {
          await saveToStorage();
        }

        break;
      }

      if (isBoardFull(gameBoard)) {
        if (autoStudyShowBoard) {
          setWinner('draw');
          setGameOver(true);
          await new Promise(resolve => setTimeout(resolve, 500 / autoStudySpeed));
        }

        aiX.learn('draw');
        aiO.learn('draw');
        await updateStats('draw', 'ai-vs-ai');
        gamesCountRef.current++;

        if (gamesCountRef.current % 10 === 0) {
          await saveToStorage();
        }

        break;
      }

      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(currentPlayer);
    }

    if (autoStudyShowBoard) {
      await new Promise(resolve => setTimeout(resolve, 1000 / autoStudySpeed));
    }

    resetBoard();
  };

  const startAutoStudy = () => {
    setAutoStudyRunning(true);
    gamesCountRef.current = 0;

    const runGames = async () => {
      while (true) {
        await playOneGame();
        if (!useGameStore.getState().autoStudyRunning) break;
      }
    };

    runGames();
  };

  const stopAutoStudy = () => {
    setAutoStudyRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    saveToStorage();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: theme.colors.card,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Zap size={24} style={{ color: theme.colors.accent }} />
          <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            Autoestudo IA vs IA
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={autoStudyRunning ? stopAutoStudy : startAutoStudy}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: autoStudyRunning ? theme.colors.playerO : theme.colors.primary,
              color: '#ffffff',
            }}
          >
            {autoStudyRunning ? (
              <>
                <Pause size={20} />
                Pausar
              </>
            ) : (
              <>
                <Play size={20} />
                Iniciar
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetBoard();
              gamesCountRef.current = 0;
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <RotateCcw size={20} />
            Reiniciar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAutoStudyShowBoard(!autoStudyShowBoard)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            {autoStudyShowBoard ? <Eye size={20} /> : <EyeOff size={20} />}
            {autoStudyShowBoard ? 'Ocultar' : 'Mostrar'}
          </motion.button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textMuted }}>
            Velocidade de Simulação
          </label>
          <div className="flex gap-2">
            {speedOptions.map(option => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAutoStudySpeed(option.value)}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor:
                    autoStudySpeed === option.value ? theme.colors.primary : theme.colors.background,
                  color: autoStudySpeed === option.value ? '#ffffff' : theme.colors.text,
                  border: `2px solid ${autoStudySpeed === option.value ? theme.colors.primary : theme.colors.border}`,
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="text-sm mb-1" style={{ color: theme.colors.textMuted }}>
              Partidas Jogadas
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              {gamesCountRef.current}
            </div>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="text-sm mb-1" style={{ color: theme.colors.textMuted }}>
              Estados Aprendidos
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              {ai.getQTableSize().toLocaleString()}
            </div>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="text-sm mb-1" style={{ color: theme.colors.textMuted }}>
              Status
            </div>
            <div
              className="text-lg font-bold"
              style={{ color: autoStudyRunning ? theme.colors.accent : theme.colors.textMuted }}
            >
              {autoStudyRunning ? 'Treinando...' : 'Pausado'}
            </div>
          </div>
        </div>
      </motion.div>

      {autoStudyShowBoard && (
        <div className="flex justify-center">
          <Board />
        </div>
      )}
    </div>
  );
}
