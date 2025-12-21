import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Book, Zap, ArrowLeft, RotateCcw } from 'lucide-react';
import type { RootState } from '../store/store';
import { ResourceBar } from '../components/ResourceBar';
import { Button } from '../components/Button';
import { startGame, resetGame, applyCardEffect, continueGame } from '../store/gameSlice';
import { SwipeCard } from '../components/SwipeCard';

// Temporary mock deck


const Game: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resources, deck, currentCardIndex, weeksSurvived, isGameOver, gameOverReason, gameMode } = useSelector((state: RootState) => state.game);
  
  // Local state for previewing resource changes
  const [dragOffset, setDragOffset] = React.useState(0);
  
  useEffect(() => {
    if (gameMode === 'idle') {
      dispatch(startGame([])); // Empty array triggers default deck in reducer
    }
  }, [dispatch, gameMode]);

  const handleRestart = () => {
    dispatch(startGame([]));
  };

  const handleExit = () => {
    dispatch(resetGame());
    navigate('/');
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    dispatch(applyCardEffect(direction));
    setDragOffset(0);
  };
  
  const handleDrag = (offset: number) => {
    setDragOffset(offset);
  };

  const currentCard = deck[currentCardIndex];

  // Calculate previews based on drag direction
  const getResourcePreview = (resourceKey: keyof typeof resources) => {
     if (!currentCard || Math.abs(dragOffset) < 20) return 0;
     
     const isRight = dragOffset > 0;
     const choice = isRight ? currentCard.rightChoice : currentCard.leftChoice;
     const effects = choice.effects;
     return effects[resourceKey] || 0;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 w-full z-50 flex justify-between items-center p-4">
        <button onClick={handleExit} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
           <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
          Tydzień: {weeksSurvived}
        </div>
      </div>

      {/* Main Game Area (Card) */}
      <div className="flex-1 flex items-center justify-center p-4 mt-4 mb-32 relative w-full h-full max-h-[80dvh]">
         <div className="relative w-full max-w-[360px] h-full max-h-[70dvh] min-h-[300px] aspect-[3/4]">
            {/* Background cards for stack effect */}
            <div className="absolute top-2 left-0 right-0 h-full bg-white rounded-2xl shadow-sm scale-95 opacity-50 translate-y-2" />
            <div className="absolute top-4 left-0 right-0 h-full bg-white rounded-2xl shadow-sm scale-90 opacity-30 translate-y-4" />
            
            {/* Active Card */}
            {currentCard && !isGameOver && (
                <div className="absolute inset-0 z-20">
                    <SwipeCard 
                        key={currentCard.id} // Key ensures remount/reset on new card
                        card={currentCard}
                        onSwipe={handleSwipe}
                        onDragStart={() => {}}
                        onDragEnd={() => {}}
                        onDrag={handleDrag}
                    />
                </div>
            )}
            
            {/* Empty State / Game Won */}
            {!currentCard && !isGameOver && (
                <div className="absolute inset-0 z-10 bg-white rounded-2xl shadow-xl flex items-center justify-center p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800">Brak nowych wyzwań!</h3>
                    <p className="text-gray-500 mt-2">Czekaj na aktualizację...</p>
                </div>
            )}
         </div>
      </div>

      {/* Resources Footer */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-3xl transition-transform duration-300">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <ResourceBar 
            icon={Heart} 
            value={resources.family} 
            color="bg-red-500" 
            label="Rodzina" 
            previewChange={isGameOver ? 0 : getResourcePreview('family')}
          />
          <ResourceBar 
            icon={Users} 
            value={resources.scouting} 
            color="bg-blue-500" 
            label="Drużyna" 
            previewChange={isGameOver ? 0 : getResourcePreview('scouting')}
          />
          <ResourceBar 
            icon={Book} 
            value={resources.school} 
            color="bg-yellow-500" 
            label="Szkoła" 
            previewChange={isGameOver ? 0 : getResourcePreview('school')}
          />
          <ResourceBar 
            icon={Zap} 
            value={resources.energy} 
            color="bg-green-500" 
            label="Energia" 
            previewChange={isGameOver ? 0 : getResourcePreview('energy')}
          />
        </div>
      </div>

      {/* Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col justify-center items-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 transform animate-in zoom-in-95 duration-300">
             
             <div className="space-y-2">
               <h2 className="text-3xl font-bold text-gray-900">Koniec Gry</h2>
               <div className="inline-block bg-gray-100 px-4 py-1 rounded-full">
                  <p className="text-sm font-semibold text-gray-600">
                    Przetrwałeś {weeksSurvived} {
                    weeksSurvived === 1 ? 'tydzień' :
                    (weeksSurvived % 10 >= 2 && weeksSurvived % 10 <= 4 && (weeksSurvived % 100 < 10 || weeksSurvived % 100 >= 20)) ? 'tygodnie' :
                    'tygodni'
                  }
                  </p>
               </div>
             </div>
             
             <div className="bg-red-50 p-4 rounded-xl border border-red-100">
               <p className="text-gray-800 font-medium leading-relaxed">
                 {gameOverReason}
               </p>
             </div>

             {/* Secret Password Field */}
             <div className="pt-2">
                <p className="text-xs text-center text-gray-400 mb-1 uppercase tracking-wider font-bold">Tajne hasło</p>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Wpisz hasło..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                    onChange={(e) => {
                      if (e.target.value.toLowerCase() === 'wsparcie') {
                        dispatch(continueGame());
                      }
                    }}
                  />
                </div>
             </div>

             <div className="space-y-3 pt-2">
                <Button fullWidth onClick={handleRestart} className="shadow-lg shadow-blue-100">
                  <div className="flex items-center justify-center gap-2">
                    <RotateCcw size={18} />
                    <span>Zagraj ponownie</span>
                  </div>
                </Button>
                <Button fullWidth variant="secondary" onClick={handleExit}>
                  Wróć do menu
                </Button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Game;
