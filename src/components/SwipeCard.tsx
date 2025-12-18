import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import type { Card } from '../types/game';

interface SwipeCardProps {
  card: Card;
  onSwipe: (direction: 'left' | 'right') => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrag: (offset: number) => void; // Pass offset to parent for resource preview
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ 
  card, 
  onSwipe, 
  onDragStart, 
  onDragEnd,
  onDrag 
}) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);
  
  // Opacity for choice indicators
  const leftOpacity = useTransform(x, [0, -100], [0, 1]);
  const rightOpacity = useTransform(x, [0, 100], [0, 1]);
  
  // Optional: Background color shift based on swipe?
  // const bg = useTransform(x, [-150, 0, 150], ["rgb(255, 230, 230)", "rgb(255, 255, 255)", "rgb(230, 255, 230)"]);

  const [isDragging, setIsDragging] = React.useState(false);
  const isExitingRef = React.useRef(false);

  // Idle hint animation
  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const runAnimation = async () => {
      // If user is interacting or card is exiting, skip
      if (isDragging || isExitingRef.current || x.get() !== 0) return;

      // Smooth sway: 0 -> Left -> Right -> 0
      await controls.start({ 
        x: [0, -30, 30, 0], 
        rotate: [0, -3, 3, 0],
        transition: { 
          duration: 4, 
          ease: "easeInOut",
          times: [0, 0.33, 0.66, 1] 
        } 
      });

      // Schedule next run only if not exiting
      if (!isExitingRef.current) {
        timeoutId = setTimeout(runAnimation, 10000);
      }
    };

    // Initial delay
    timeoutId = setTimeout(runAnimation, 3000);

    return () => {
      clearTimeout(timeoutId);
      // Only stop if not in an intentional exit
      if (!isExitingRef.current) {
        controls.stop();
      }
    };
  }, [isDragging, controls, x]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    onDragEnd();
    onDrag(0); // Reset preview

    if (offset > threshold || velocity > 500) {
      // Swiped Right - mark as exiting BEFORE state change
      isExitingRef.current = true;
      setIsDragging(false);
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('right');
    } else if (offset < -threshold || velocity < -500) {
      // Swiped Left - mark as exiting BEFORE state change
      isExitingRef.current = true;
      setIsDragging(false);
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('left');
    } else {
      // Return to center - not exiting
      setIsDragging(false);
      controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const handleDrag = (_: any, info: PanInfo) => {
    onDrag(info.offset.x);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7} // Add some resistance
      onDragStart={() => { 
        controls.stop(); // Stop idle animation immediately
        setIsDragging(true);
        onDragStart(); 
      }}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      animate={controls}
      style={{ x, rotate }}
      className="absolute w-full max-w-[320px] h-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-between p-6 cursor-grab active:cursor-grabbing touch-none select-none"
    >
      {/* Choice Indicators (Overlay) */}
      <motion.div 
        style={{ opacity: rightOpacity }} 
        className="absolute top-8 left-8 border-4 border-blue-500 text-blue-500 rounded-lg px-4 py-2 font-bold text-2xl transform -rotate-12 z-20 pointer-events-none bg-white/80 backdrop-blur-sm"
      >
        {card.rightChoice}
      </motion.div>
      <motion.div 
        style={{ opacity: leftOpacity }} 
        className="absolute top-8 right-8 border-4 border-blue-500 text-blue-500 rounded-lg px-4 py-2 font-bold text-2xl transform rotate-12 z-20 pointer-events-none bg-white/80 backdrop-blur-sm"
      >
        {card.leftChoice}
      </motion.div>

      {/* Card Content */}
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-6">
        {card.image && (
            <div className="w-full h-40 bg-gray-100 rounded-xl mb-2 overflow-hidden">
                <img src={card.image} alt="Situation" className="w-full h-full object-cover" />
            </div>
        )}
        
        {/* If no image, maybe a placeholder icon or larger text */}
        {!card.image && (
             <div className="w-full h-32 bg-indigo-50 rounded-xl flex items-center justify-center mb-2">
                <span className="text-4xl">🤔</span>
             </div>
        )}

        <h3 className="text-xl font-medium text-center text-gray-800 leading-relaxed">
          {card.text}
        </h3>
      </div>
    </motion.div>
  );
};
