import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Book, Zap, ArrowLeft, RotateCcw } from 'lucide-react';
import type { RootState } from '../store/store';
import { ResourceBar } from '../components/ResourceBar';
import { Button } from '../components/Button';
import { startGame, resetGame, applyCardEffect } from '../store/gameSlice';
import type { Card } from '../types/game';
import { SwipeCard } from '../components/SwipeCard';

// Temporary mock deck
const MOCK_DECK: Card[] = [
  {
    id: '1',
    text: 'Masz ważny sprawdzian jutro, ale drużyna potrzebuje pomocy przy zbiórce.',
    leftChoice: 'Uczę się',
    rightChoice: 'Pomagam drużynie',
    leftEffects: [
      { resource: 'school', value: 10 },
      { resource: 'team', value: -10 },
      { resource: 'energy', value: -5 }
    ],
    rightEffects: [
      { resource: 'school', value: -15 },
      { resource: 'team', value: 10 },
      { resource: 'family', value: 5 }
    ]
  },
  {
    id: '2',
    text: 'Rodzina zaprasza na obiad, ale jesteś zmęczony po biwaku.',
    leftChoice: 'Idę na obiad',
    rightChoice: 'Odpoczywam',
    leftEffects: [
      { resource: 'family', value: 10 },
      { resource: 'energy', value: -10 }
    ],
    rightEffects: [
      { resource: 'family', value: -10 },
      { resource: 'energy', value: 15 }
    ]
  }
];

const Game: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resources, deck, currentCardIndex, weeksSurvived, isGameOver, gameOverReason, gameMode } = useSelector((state: RootState) => state.game);
  
  // Local state for previewing resource changes
  const [dragOffset, setDragOffset] = React.useState(0);
  
  useEffect(() => {
    if (gameMode === 'idle') {
      dispatch(startGame(MOCK_DECK));
    }
  }, [dispatch, gameMode]);

  const handleRestart = () => {
    dispatch(startGame(MOCK_DECK));
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
     const effects = isRight ? currentCard.rightEffects : currentCard.leftEffects;
     const effect = effects.find(e => e.resource === resourceKey);
     return effect ? effect.value : 0;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 w-full z-10 flex justify-between items-center p-4">
        <button onClick={handleExit} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
           <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
          Tydzień: {weeksSurvived}
        </div>
      </div>

      {/* Main Game Area (Card) */}
      <div className="flex-1 flex items-center justify-center p-6 mt-8 mb-24 relative">
         <div className="relative w-full max-w-[320px] h-[420px]">
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
            value={resources.team} 
            color="bg-blue-500" 
            label="Drużyna" 
            previewChange={isGameOver ? 0 : getResourcePreview('team')}
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
                    Przetrwałeś {weeksSurvived} {weeksSurvived === 1 ? 'tydzień' : 'tygodni'}
                  </p>
               </div>
             </div>
             
             <div className="bg-red-50 p-4 rounded-xl border border-red-100">
               <p className="text-gray-800 font-medium leading-relaxed">
                 {gameOverReason}
               </p>
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
