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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-white shadow-lg border-2 border-transparent hover:border-slate-200 transition-all ${color}`}
      onClick={onClick}
    >
      <Icon className="w-12 h-12 mb-2" />
      <span className="font-medium text-slate-700">{mood}</span>
    </motion.button>
  );
}
