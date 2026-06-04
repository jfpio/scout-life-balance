import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Book, Zap, ArrowLeft, RotateCcw } from 'lucide-react';
import type { RootState } from '../store/store';
import { ResourceBar } from '../components/ResourceBar';
import { Button } from '../components/Button';
import { startGame, resetGame, applyCardEffect, continueGame } from '../store/gameSlice';
import { SwipeCard } from '../components/SwipeCard';
import { content } from '../i18n';
import type { Card, GameOverReasons } from '../types/game';

interface GameProps {
  deck?: Card[];
  gameOverReasons?: GameOverReasons;
  sessionKey?: string;
  exitPath?: string;
}

const Game: React.FC<GameProps> = ({
  deck,
  gameOverReasons,
  sessionKey = 'default',
  exitPath = '/',
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    resources,
    deck: activeDeck,
    currentCardIndex,
    weeksSurvived,
    isGameOver,
    gameOverReason,
    gameMode,
  } = useSelector((state: RootState) => state.game);
  
  // Local state for previewing resource changes
  const [dragOffset, setDragOffset] = React.useState(0);
  const lastStartedSessionKey = React.useRef<string | null>(null);
  const gameDeck = deck ?? content.deck;
  const resolvedGameOverReasons = gameOverReasons ?? content.game.gameOverReasons;
  
  useEffect(() => {
    if (gameMode === 'idle' || lastStartedSessionKey.current !== sessionKey) {
      dispatch(startGame({ deck: gameDeck, gameOverReasons: resolvedGameOverReasons }));
      lastStartedSessionKey.current = sessionKey;
    }
  }, [dispatch, gameDeck, gameMode, resolvedGameOverReasons, sessionKey]);

  const handleRestart = () => {
    dispatch(startGame({ deck: gameDeck, gameOverReasons: resolvedGameOverReasons }));
    lastStartedSessionKey.current = sessionKey;
  };

  const handleExit = () => {
    dispatch(resetGame());
    navigate(exitPath);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    dispatch(applyCardEffect(direction));
    setDragOffset(0);
  };
  
  const handleDrag = (offset: number) => {
    setDragOffset(offset);
  };

  const currentCard = activeDeck[currentCardIndex];

  // Calculate previews based on drag direction
  const getResourcePreview = (resourceKey: keyof typeof resources) => {
     if (!currentCard || Math.abs(dragOffset) < 20) return 0;
     
     const isRight = dragOffset > 0;
     const choice = isRight ? currentCard.rightChoice : currentCard.leftChoice;
     const effects = choice.effects;
     return effects[resourceKey] || 0;
  };

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden">
      <div className="z-40 flex items-center justify-between px-4 pb-2 pt-12">
        <button
          onClick={handleExit}
          className="grid size-11 place-items-center rounded-full border border-[var(--slb-line)] bg-white/90 text-[var(--slb-ink)] shadow-sm backdrop-blur transition-colors hover:bg-white"
          aria-label={content.game.backToMenu}
        >
           <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-[var(--slb-line)] bg-white/90 px-4 py-2 font-display text-sm font-black text-[var(--slb-ink)] shadow-sm backdrop-blur">
          <span className="size-2.5 rotate-45 rounded-[2px] bg-[var(--slb-orange)]" />
          {content.game.weekLabel(weeksSurvived)}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-5 pb-[148px] pt-2">
         <div className="relative h-full min-h-[320px] w-full max-w-[326px] max-h-[520px]">
            <div className="absolute inset-0 translate-y-4 rotate-[-3deg] rounded-[32px] border border-[var(--slb-line)] bg-white/55 shadow-sm" />
            <div className="absolute inset-0 translate-y-2 rotate-[3deg] rounded-[32px] border border-[var(--slb-line)] bg-white/80 shadow-sm" />
            
            {currentCard && !isGameOver && (
                <div className="absolute inset-0 z-20">
                    <SwipeCard 
                        key={currentCard.id} // Key ensures remount/reset on new card
                        card={currentCard}
                        onSwipe={handleSwipe}
                        onDragStart={() => {}}
                        onDragEnd={() => {}}
                        onDrag={handleDrag}
                        imageAlt={content.game.imageAlt}
                    />
                </div>
            )}
            
            {!currentCard && !isGameOver && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[32px] border border-[var(--slb-line)] bg-white p-6 text-center shadow-[0_22px_60px_rgba(33,48,42,0.16)]">
                    <h3 className="font-display text-2xl font-black text-[var(--slb-ink)]">{content.game.emptyTitle}</h3>
                    <p className="mt-2 leading-relaxed text-[var(--slb-muted)]">{content.game.emptySubtitle}</p>
                </div>
            )}
         </div>
      </div>

      <div className="absolute bottom-0 w-full px-3 pb-4">
        <div className="grid grid-cols-4 gap-2 rounded-[30px] border border-[var(--slb-line)] bg-white/[0.92] px-3 py-4 shadow-[0_-18px_42px_rgba(33,48,42,0.12)] backdrop-blur">
          <ResourceBar 
            icon={Heart} 
            value={resources.family} 
            color="#C96A2E" 
            label={content.resources.family.short} 
            previewChange={isGameOver ? 0 : getResourcePreview('family')}
          />
          <ResourceBar 
            icon={Users} 
            value={resources.scouting} 
            color="#2F5A45" 
            label={content.resources.scouting.short} 
            previewChange={isGameOver ? 0 : getResourcePreview('scouting')}
          />
          <ResourceBar 
            icon={Book} 
            value={resources.school} 
            color="#8A6F2F" 
            label={content.resources.school.short} 
            previewChange={isGameOver ? 0 : getResourcePreview('school')}
          />
          <ResourceBar 
            icon={Zap} 
            value={resources.energy} 
            color="#3E7A66" 
            label={content.resources.energy.short} 
            previewChange={isGameOver ? 0 : getResourcePreview('energy')}
          />
        </div>
      </div>

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-end bg-[rgba(33,48,42,0.45)] p-3 backdrop-blur-sm">
           <div className="sheet-up w-full rounded-[34px] border border-[var(--slb-line)] bg-white p-6 text-center shadow-2xl">
             
             <div className="space-y-2">
               <h2 className="font-display text-3xl font-black text-[var(--slb-ink)]">{content.game.gameOverTitle}</h2>
               <div className="inline-block rounded-full bg-[#EEF5EF] px-4 py-1">
                  <p className="font-display text-xs font-black uppercase tracking-[0.08em] text-[var(--slb-pine)]">
                    {content.game.survivedText(weeksSurvived)}
                  </p>
               </div>
             </div>
             
             <div className="mt-5 rounded-2xl border border-[rgba(201,106,46,0.18)] bg-[#FFF4EA] p-4">
               <p className="font-medium leading-relaxed text-[var(--slb-ink)]">
                 {gameOverReason}
               </p>
             </div>

             <div className="pt-5">
                <p className="mb-2 text-center font-display text-[10px] font-black uppercase tracking-[0.12em] text-[var(--slb-muted)]">{content.game.secretPasswordLabel}</p>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder={content.game.secretPasswordPlaceholder}
                    className="w-full rounded-full border border-[var(--slb-line)] bg-[#FBFAF6] px-4 py-3 text-center text-[var(--slb-ink)] outline-none transition-all placeholder:text-[var(--slb-muted)] focus:border-[var(--slb-pine)] focus:ring-2 focus:ring-[rgba(47,90,69,0.14)]"
                    onChange={(e) => {
                      if (e.target.value.toLowerCase() === 'wsparcie') {
                        dispatch(continueGame());
                      }
                    }}
                  />
                </div>
             </div>

             <div className="space-y-3 pt-5">
                <Button fullWidth onClick={handleRestart}>
                  <div className="flex items-center justify-center gap-2">
                    <RotateCcw size={18} />
                    <span>{content.game.restart}</span>
                  </div>
                </Button>
                <Button fullWidth variant="secondary" onClick={handleExit}>
                  {content.game.backToMenu}
                </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Game;
