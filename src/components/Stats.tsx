import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Stats() {
  const { stats, gameMode, theme, ai } = useGameStore();

  const getWinRate = () => {
    if (stats.totalGames === 0) return 0;
    if (gameMode === 'player-vs-ai') {
      return Math.round((stats.playerWins / (stats.totalGames - stats.aiVsAiGames)) * 100) || 0;
    }
    return Math.round(((stats.aiXWins + stats.aiOWins) / stats.aiVsAiGames) * 100) || 0;
  };

  const statsData = [
    {
      icon: Trophy,
      label: 'Total de Jogos',
      value: stats.totalGames.toString(),
      color: theme.colors.primary,
    },
    {
      icon: Target,
      label: gameMode === 'player-vs-ai' ? 'Suas Vitórias' : 'Vitórias IA X',
      value: gameMode === 'player-vs-ai' ? stats.playerWins.toString() : stats.aiXWins.toString(),
      color: theme.colors.playerX,
    },
    {
      icon: Zap,
      label: gameMode === 'player-vs-ai' ? 'Vitórias IA' : 'Vitórias IA O',
      value: gameMode === 'player-vs-ai' ? stats.aiWins.toString() : stats.aiOWins.toString(),
      color: theme.colors.playerO,
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Vitória',
      value: `${getWinRate()}%`,
      color: theme.colors.accent,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl"
          style={{
            backgroundColor: theme.colors.card,
            border: `2px solid ${theme.colors.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon size={20} style={{ color: stat.color }} />
            <span className="text-sm" style={{ color: theme.colors.textMuted }}>
              {stat.label}
            </span>
          </div>
          <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            {stat.value}
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl md:col-span-2"
        style={{
          backgroundColor: theme.colors.card,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} style={{ color: theme.colors.secondary }} />
          <span className="text-sm" style={{ color: theme.colors.textMuted }}>
            Conhecimento da IA
          </span>
        </div>
        <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
          {ai.getQTableSize().toLocaleString()} estados
        </div>
      </motion.div>
    </div>
  );
}

function Sparkles({ size, style }: { size: number; style: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6" />
    </svg>
  );
}
