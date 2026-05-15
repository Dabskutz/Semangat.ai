'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MoodButtonProps {
  mood: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
}

export default function MoodButton({ mood, icon: Icon, onClick, color }: MoodButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col items-center justify-center p-6 rounded-[28px] bg-secondary-container text-on-secondary-container border border-outline/10 hover:shadow-xl transition-all w-full aspect-square`}
      onClick={onClick}
    >
      <div className={`p-4 rounded-2xl bg-white/10 mb-3 ${color.replace('text-', 'bg-').replace('-500', '/10').replace('-600', '/10')}`}>
        <Icon className={`w-10 h-10 ${color}`} />
      </div>
      <span className="font-bold text-lg tracking-tight">{mood}</span>
    </motion.button>
  );
}
