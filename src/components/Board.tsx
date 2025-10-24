import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Cell } from './Cell';

export function Board() {
  const { board, winLine, theme } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-3 gap-3 p-4"
      style={{ backgroundColor: theme.colors.card }}
    >
      {board.map((cell, index) => (
        <Cell
          key={index}
          index={index}
          value={cell}
          isWinning={winLine?.includes(index) || false}
        />
      ))}
    </motion.div>
  );
}
