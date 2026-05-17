'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MoodButtonProps {
  mood: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
  className?: string;
}

export default function MoodButton({ mood, icon: Icon, onClick, color, className }: MoodButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      className={`neo-button flex flex-col items-center justify-center p-6 md:p-8 rounded-[24px] md:rounded-[32px] w-full group relative overflow-hidden ${className || 'aspect-square'}`}
      onClick={onClick}
    >
      {/* Subtle Glow Background on Hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${color.replace('text-', 'bg-')}`} />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className={`p-3 md:p-5 rounded-[18px] md:rounded-[24px] bg-white/[0.03] border border-white/[0.05] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`w-8 h-8 md:w-10 md:h-10 ${color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
        </div>
        <span className="font-bold text-base md:text-lg tracking-tight text-white/90">{mood}</span>
      </div>

      {/* Premium Border Highlight */}
      <div className="absolute inset-px rounded-[24px] md:rounded-[32px] border border-white/5 pointer-events-none" />
    </motion.button>
  );
}
