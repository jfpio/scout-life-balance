import React from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import type { Card } from '../types/game';

interface SwipeCardProps {
  card: Card;
  onSwipe: (direction: 'left' | 'right') => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrag: (offset: number) => void; // Pass offset to parent for resource preview
  imageAlt: string;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ 
  card, 
  onSwipe, 
  onDragStart, 
  onDragEnd,
  onDrag,
  imageAlt
}) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);
  
  // Opacity for choice indicators
  const leftOpacity = useTransform(x, [-120, -45], [1, 0]);
  const rightOpacity = useTransform(x, [45, 120], [0, 1]);
  
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

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
      className="card-enter absolute h-full w-full max-w-[326px] cursor-grab select-none touch-none overflow-hidden rounded-[32px] border border-[var(--slb-line)] bg-[var(--slb-card)] p-5 shadow-[0_22px_60px_rgba(33,48,42,0.16)] active:cursor-grabbing"
    >
      <motion.div 
        style={{ opacity: rightOpacity }} 
        className="pointer-events-none absolute left-5 top-8 z-20 max-w-[136px] -rotate-12 rounded-2xl border-[3px] border-[var(--slb-pine)] bg-white/90 px-3 py-2 text-center font-display text-sm font-black uppercase leading-tight text-[var(--slb-pine)] shadow-sm backdrop-blur-sm"
      >
        {card.rightChoice.text}
      </motion.div>
      <motion.div 
        style={{ opacity: leftOpacity }} 
        className="pointer-events-none absolute right-5 top-8 z-20 max-w-[136px] rotate-12 rounded-2xl border-[3px] border-[var(--slb-orange)] bg-white/90 px-3 py-2 text-center font-display text-sm font-black uppercase leading-tight text-[var(--slb-orange)] shadow-sm backdrop-blur-sm"
      >
        {card.leftChoice.text}
      </motion.div>

      <div className="flex h-full w-full flex-col items-center justify-between gap-4 rounded-[24px] border border-[rgba(33,48,42,0.08)] bg-[linear-gradient(180deg,#fff_0%,#fbfaf6_100%)] p-4">
        {card.image && (
            <div className={`w-full ${card.image.length < 5 ? 'min-h-[132px] flex items-center justify-center bg-[#F0EEE4]' : 'h-[154px] bg-[#F0EEE4]'} overflow-hidden rounded-[24px] border border-[var(--slb-line)]`}>
                {card.image.length < 5 ? (
                    <span className="text-6xl leading-none">{card.image}</span>
                ) : (
                    <img src={card.image} alt={imageAlt} className="w-full h-full object-cover" />
                )}
            </div>
        )}
        
        {!card.image && (
             <div className="flex min-h-[132px] w-full items-center justify-center rounded-[24px] border border-[var(--slb-line)] bg-[#F0EEE4]">
                <span className="text-5xl leading-none">🤔</span>
             </div>
        )}

        <h3 className="flex flex-1 items-center px-1 text-center font-display text-[clamp(1.3rem,7vw,1.9rem)] font-black leading-[1.05] text-[var(--slb-ink)]">
          {card.description}
        </h3>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="min-h-[58px] rounded-2xl border border-[rgba(201,106,46,0.18)] bg-[#FFF4EA] px-3 py-2 text-center">
            <p className="break-words font-display text-[11px] font-black uppercase leading-tight text-[var(--slb-orange)]">
              {card.leftChoice.text}
            </p>
          </div>
          <div className="min-h-[58px] rounded-2xl border border-[rgba(47,90,69,0.18)] bg-[#EEF5EF] px-3 py-2 text-center">
            <p className="break-words font-display text-[11px] font-black uppercase leading-tight text-[var(--slb-pine)]">
              {card.rightChoice.text}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
