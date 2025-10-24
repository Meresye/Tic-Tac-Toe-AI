import { motion } from 'framer-motion';
import { Trophy, Users, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function GameStatus() {
  const { winner, isGameOver, currentPlayer, gameMode, playerSymbol, theme } = useGameStore();

  const getMessage = () => {
    if (!isGameOver) {
      if (gameMode === 'player-vs-ai') {
        return currentPlayer === playerSymbol
          ? 'Sua vez!'
          : 'IA está pensando...';
      }
      return `Vez: ${currentPlayer}`;
    }

    if (winner === 'draw') {
      return 'Empate!';
    }

    if (gameMode === 'player-vs-ai') {
      return winner === playerSymbol ? 'Você venceu!' : 'IA venceu!';
    }

    return `${winner} venceu!`;
  };

  const getIcon = () => {
    if (winner === playerSymbol && gameMode === 'player-vs-ai') {
      return <Trophy size={24} />;
    }
    if (gameMode === 'ai-vs-ai') {
      return <Sparkles size={24} />;
    }
    return <Users size={24} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-6 py-4 rounded-2xl mb-6"
      style={{
        backgroundColor: theme.colors.card,
        border: `2px solid ${theme.colors.border}`,
        color: theme.colors.text,
      }}
    >
      <motion.div
        animate={{ rotate: isGameOver ? 0 : [0, 360] }}
        transition={{ duration: 2, repeat: isGameOver ? 0 : Infinity, ease: 'linear' }}
        style={{ color: theme.colors.primary }}
      >
        {getIcon()}
      </motion.div>
      <span className="text-xl font-semibold">{getMessage()}</span>
    </motion.div>
  );
}
