import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ResourceBarProps {
  icon: LucideIcon;
  value: number; // 0-100
  color: string;
  label: string;
  className?: string;
  previewChange?: number; // Estimated change to preview (-10, +5 etc)
}

export const ResourceBar: React.FC<ResourceBarProps> = ({ 
  icon: Icon, 
  value, 
  color, 
  label,
  className = '',
  previewChange = 0
}) => {
  const isPreview = previewChange !== 0;
  const isPositive = previewChange > 0;
  const normalizedValue = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative grid size-[62px] place-items-center">
        <svg className="-rotate-90" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
          <circle
            cx="29"
            cy="29"
            r="22"
            fill="none"
            stroke="rgba(33,48,42,0.1)"
            strokeWidth="6"
          />
          <motion.circle
            cx="29"
            cy="29"
            r="22"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </svg>
        <div className="absolute grid size-10 place-items-center rounded-full bg-white shadow-sm">
          <Icon size={18} style={{ color }} strokeWidth={2.4} />
        </div>
        <AnimatePresence>
          {isPreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className={`absolute -right-1 top-1 size-4 rounded-full border-2 border-white ${isPositive ? 'bg-emerald-500' : 'bg-[var(--slb-orange)]'}`}
            />
          )}
        </AnimatePresence>
      </div>
      <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--slb-muted)]">
        {label}
      </span>
    </div>
  );
};
