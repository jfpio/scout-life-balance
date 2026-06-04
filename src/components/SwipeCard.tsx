import React from 'react';
import { animate, motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import type { Card } from '../types/game';

interface SwipeCardProps {
  card: Card;
  onSwipe: (direction: 'left' | 'right') => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrag: (offset: number) => void; // Pass offset to parent for resource preview
  imageAlt: string;
}

const neutralHintStyle: React.CSSProperties = {
  transform: 'translate3d(0, 0, 0) rotate(0deg)',
  filter: 'drop-shadow(0 0 0 rgba(33,48,42,0))',
};

const leftHintStyle: React.CSSProperties = {
  transform: 'translate3d(-26px, -8px, 0) rotate(-4deg)',
  filter: 'drop-shadow(0 22px 30px rgba(33,48,42,0.18))',
};

const rightHintStyle: React.CSSProperties = {
  transform: 'translate3d(26px, -8px, 0) rotate(4deg)',
  filter: 'drop-shadow(0 22px 30px rgba(33,48,42,0.18))',
};

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
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [hintStyle, setHintStyle] = React.useState<React.CSSProperties>(neutralHintStyle);
  const [hintDirection, setHintDirection] = React.useState<'left' | 'right' | null>(null);

  React.useEffect(() => {
    if (hasInteracted || isDragging) {
      setHintStyle(neutralHintStyle);
      setHintDirection(null);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (
      delay: number,
      style: React.CSSProperties,
      direction: 'left' | 'right' | null,
    ) => {
      timers.push(setTimeout(() => {
        setHintStyle(style);
        setHintDirection(direction);
      }, delay));
    };
    const scheduleCycle = (offset: number) => {
      schedule(offset + 450, leftHintStyle, 'left');
      schedule(offset + 1850, neutralHintStyle, null);
      schedule(offset + 2450, rightHintStyle, 'right');
      schedule(offset + 3850, neutralHintStyle, null);
    };

    scheduleCycle(0);
    scheduleCycle(10000);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [hasInteracted, isDragging]);

  const stopHint = () => {
    setHasInteracted(true);
    setHintDirection(null);
    setHintStyle(neutralHintStyle);
  };

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
      await Promise.all([
        animate(x, 500, { duration: 0.2 }).finished,
        controls.start({ opacity: 0, transition: { duration: 0.2 } }),
      ]);
      onSwipe('right');
    } else if (offset < -threshold || velocity < -500) {
      // Swiped Left - mark as exiting BEFORE state change
      isExitingRef.current = true;
      setIsDragging(false);
      await Promise.all([
        animate(x, -500, { duration: 0.2 }).finished,
        controls.start({ opacity: 0, transition: { duration: 0.2 } }),
      ]);
      onSwipe('left');
    } else {
      // Return to center - not exiting
      setIsDragging(false);
      void animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
      void controls.start({ opacity: 1, transition: { duration: 0.12 } });
    }
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onDrag(info.offset.x);
  };

  return (
    <div
      className="swipe-hint-shell absolute inset-0 transition-[transform,filter] duration-500 ease-in-out"
      style={hintStyle}
      onPointerDown={stopHint}
    >
      <div
        className="pointer-events-none absolute right-5 top-8 z-30 max-w-[136px] rotate-12 rounded-2xl border-[3px] border-[var(--slb-orange)] bg-white/90 px-3 py-2 text-center font-display text-sm font-black uppercase leading-tight text-[var(--slb-orange)] shadow-sm backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: hintDirection === 'left' ? 1 : 0 }}
      >
        {card.leftChoice.text}
      </div>
      <div
        className="pointer-events-none absolute left-5 top-8 z-30 max-w-[136px] -rotate-12 rounded-2xl border-[3px] border-[var(--slb-pine)] bg-white/90 px-3 py-2 text-center font-display text-sm font-black uppercase leading-tight text-[var(--slb-pine)] shadow-sm backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: hintDirection === 'right' ? 1 : 0 }}
      >
        {card.rightChoice.text}
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7} // Add some resistance
        onDragStart={() => { 
          controls.stop(); // Stop idle animation immediately
          setIsDragging(true);
          stopHint();
          onDragStart(); 
        }}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        animate={controls}
        style={{ x, rotate }}
        whileDrag={{
          scale: 1.035,
          y: -8,
          boxShadow: '0 30px 70px rgba(33,48,42,0.24)',
        }}
        className="h-full w-full cursor-grab select-none touch-none overflow-hidden rounded-[32px] border border-[var(--slb-line)] bg-[var(--slb-card)] p-5 shadow-[0_22px_60px_rgba(33,48,42,0.16)] active:cursor-grabbing"
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

          <div className="flex min-h-0 flex-1 items-center overflow-hidden px-1 py-2">
            <h3 className="max-w-full break-words text-center font-display text-[clamp(1.05rem,5.1vw,1.45rem)] font-black leading-[1.08] text-[var(--slb-ink)] [overflow-wrap:anywhere]">
              {card.description}
            </h3>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
