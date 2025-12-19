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
  // Determine if we should show a preview indicator
  const isPreview = previewChange !== 0;
  const isPositive = previewChange > 0;
  
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <div className="flex justify-between items-center text-xs font-medium text-gray-500 px-1">
        <span className="flex items-center gap-1">
          <Icon size={14} className={color.replace('bg-', 'text-')} />
          {label}
        </span>
      </div>
      
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
        {/* Background Bar (Current Value) */}
        <motion.div 
          className={`h-full ${color} absolute left-0 top-0 z-10`}
          initial={{ width: `${value}%` }}
          animate={{ width: `${value}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
        
        {/* Preview Indicator (Overlay Tint) - instead of exact width, just tint the whole bar or show a small glimmer? 
            User said: "widział na zielono/czerwono czy karta daje plus czy minus".
            Let's just use the icon indicator below and maybe a subtle border or icon change.
            Actually, let's remove the width preview entirely to be safe about "exact points".
        */}
      </div>
      
      {/* Change Indicator */}
      <div className="h-4 relative flex justify-end">
        <AnimatePresence>
          {isPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={`text-lg font-bold absolute -top-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}
            >
              {(isPositive ? '▲' : '▼').repeat(Math.min(3, Math.abs(previewChange)))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
