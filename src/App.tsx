import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Menu } from './components/Menu';
import { GameContainer } from './components/GameContainer';
import { AutoStudy } from './components/AutoStudy';
import { Settings } from './components/Settings';
import { ThemeEditor } from './components/ThemeEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

function App() {
  const { gameMode, theme, isLoading, loadFromStorage } = useGameStore();
  const [currentView, setCurrentView] = useState<'game' | 'settings' | 'themes'>('game');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'settings') {
        setCurrentView('settings');
      } else if (hash === 'themes') {
        setCurrentView('themes');
      } else {
        setCurrentView('game');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-background', theme.colors.background);
    document.documentElement.style.setProperty('--theme-text', theme.colors.text);
  }, [theme]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 size={48} className="animate-spin mb-4 mx-auto" style={{ color: theme.colors.primary }} />
          <p className="text-xl" style={{ color: theme.colors.text }}>
            Carregando IA...
          </p>
        </motion.div>
      </div>
    );
  }

  if (currentView === 'settings') {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <motion.a
              href="#"
              whileHover={{ scale: 1.02 }}
              className="inline-block text-lg font-semibold mb-4"
              style={{ color: theme.colors.primary }}
            >
              ← Voltar ao Menu
            </motion.a>
          </motion.div>
          <Settings />
        </div>
      </div>
    );
  }

  if (currentView === 'themes') {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <motion.a
              href="#"
              whileHover={{ scale: 1.02 }}
              className="inline-block text-lg font-semibold mb-4"
              style={{ color: theme.colors.primary }}
            >
              ← Voltar ao Menu
            </motion.a>
          </motion.div>
          <ThemeEditor />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {gameMode === 'menu' ? (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Menu />
        </motion.div>
      ) : gameMode === 'player-vs-ai' ? (
        <motion.div
          key="player-vs-ai"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <GameContainer />
        </motion.div>
      ) : (
        <motion.div
          key="ai-vs-ai"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.background }}>
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-8"
              >
                <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>
                  Autoestudo IA vs IA
                </h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => useGameStore.getState().setGameMode('menu')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold"
                  style={{
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    border: `2px solid ${theme.colors.border}`,
                  }}
                >
                  ← Menu
                </motion.button>
              </motion.div>
              <AutoStudy />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
