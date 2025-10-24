import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Board } from './Board';
import { GameStatus } from './GameStatus';
import { Stats } from './Stats';

export function GameContainer() {
  const { theme, gameMode, playerSymbol, setGameMode, setPlayerSymbol, resetBoard, isGameOver } = useGameStore();

  const handleNewGame = () => {
    resetBoard();
  };

  const handleBackToMenu = () => {
    resetBoard();
    setGameMode('menu');
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>
            {gameMode === 'player-vs-ai' ? 'Jogador vs IA' : 'Autoestudo IA'}
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToMenu}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <Home size={20} />
            Menu
          </motion.button>
        </motion.div>

        <Stats />

        {gameMode === 'player-vs-ai' && (
          <div className="mb-6">
            <div className="flex flex-col items-center gap-4">
              <GameStatus />

              <div className="flex justify-center">
                <Board />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewGame}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  <RotateCcw size={20} />
                  {isGameOver ? 'Novo Jogo' : 'Reiniciar'}
                </motion.button>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPlayerSymbol('X');
                      resetBoard();
                    }}
                    className="px-6 py-3 rounded-xl font-semibold"
                    style={{
                      backgroundColor: playerSymbol === 'X' ? theme.colors.playerX : theme.colors.card,
                      color: playerSymbol === 'X' ? '#ffffff' : theme.colors.text,
                      border: `2px solid ${playerSymbol === 'X' ? theme.colors.playerX : theme.colors.border}`,
                    }}
                  >
                    Jogar como X
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPlayerSymbol('O');
                      resetBoard();
                    }}
                    className="px-6 py-3 rounded-xl font-semibold"
                    style={{
                      backgroundColor: playerSymbol === 'O' ? theme.colors.playerO : theme.colors.card,
                      color: playerSymbol === 'O' ? '#ffffff' : theme.colors.text,
                      border: `2px solid ${playerSymbol === 'O' ? theme.colors.playerO : theme.colors.border}`,
                    }}
                  >
                    Jogar como O
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
