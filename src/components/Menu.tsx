import { motion } from 'framer-motion';
import { User, Cpu, Settings as SettingsIcon, Palette, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function Menu() {
  const { theme, setGameMode, stats } = useGameStore();

  const menuItems = [
    {
      icon: User,
      title: 'Jogar vs IA',
      description: 'Desafie a inteligência artificial',
      color: theme.colors.playerX,
      mode: 'player-vs-ai' as const,
    },
    {
      icon: Cpu,
      title: 'Autoestudo IA',
      description: 'Assista a IA treinar sozinha',
      color: theme.colors.playerO,
      mode: 'ai-vs-ai' as const,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.colors.background }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles size={40} style={{ color: theme.colors.primary }} />
            <h1 className="text-5xl font-bold" style={{ color: theme.colors.text }}>
              Jogo da Velha IA
            </h1>
          </div>
          <p className="text-xl" style={{ color: theme.colors.textMuted }}>
            Uma IA que aprende eternamente com Q-Learning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameMode(item.mode)}
              className="p-8 rounded-2xl text-left transition-all"
              style={{
                backgroundColor: theme.colors.card,
                border: `2px solid ${theme.colors.border}`,
              }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <item.icon size={32} style={{ color: item.color }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
                {item.title}
              </h2>
              <p style={{ color: theme.colors.textMuted }}>{item.description}</p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: theme.colors.card,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.primary }}>
              {stats.totalGames}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              Total de Jogos
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: theme.colors.card,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.playerX }}>
              {stats.playerWins}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              Suas Vitórias
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: theme.colors.card,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.playerO }}>
              {stats.aiVsAiGames}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              Autotreinos
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl text-center"
            style={{
              backgroundColor: theme.colors.card,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: theme.colors.accent }}>
              {stats.draws}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              Empates
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4"
        >
          <motion.a
            href="#settings"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <SettingsIcon size={20} />
            Configurações
          </motion.a>

          <motion.a
            href="#themes"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`,
            }}
          >
            <Palette size={20} />
            Temas
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
}
