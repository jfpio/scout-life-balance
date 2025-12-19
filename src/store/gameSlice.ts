import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GameState, Card, Resources } from '../types/game';
import cardsData from '../data/cards.json';

const initialDeck: Card[] = cardsData as Card[];

const initialResources: Resources = {
  family: 50,
  scouting: 50,
  school: 50,
  energy: 50,
};

const DIFFICULTY_SCALE = 8;

const initialState: GameState = {
  resources: initialResources,
  deck: initialDeck,
  currentCardIndex: 0,
  isGameOver: false,
  weeksSurvived: 0,
  gameMode: 'idle',
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<Card[]>) => {
      state.resources = { ...initialResources };
      // Shuffle the deck (if provided, otherwise use default full deck)
      const deckToUse = action.payload.length > 0 ? action.payload : initialDeck;
      state.deck = shuffleArray([...deckToUse]);
      state.currentCardIndex = 0;
      state.isGameOver = false;
      state.weeksSurvived = 0;
      state.gameMode = 'playing';
      state.gameOverReason = undefined;
    },
    applyCardEffect: (state, action: PayloadAction<'left' | 'right'>) => {
      const currentCard = state.deck[state.currentCardIndex];
      if (!currentCard) return;

      const choice = action.payload === 'left' ? currentCard.leftChoice : currentCard.rightChoice;
      const effects = choice.effects;

      // Apply effects
      Object.entries(effects).forEach(([resource, value]) => {
          const key = resource as keyof Resources;
          if (state.resources[key] !== undefined && typeof value === 'number') {
               const scaledValue = value * DIFFICULTY_SCALE;
               state.resources[key] = Math.max(0, Math.min(100, state.resources[key] + scaledValue));
          }
      });

      // Check game over conditions
      let gameOver = false;
      let reason = '';

      // Check if any resource hit 0
      if (state.resources.family <= 0) {
        gameOver = true;
        reason = "Twoja rodzina i przyjaciele czują się zaniedbani. Zostałeś sam.";
      } else if (state.resources.scouting <= 0) {
        gameOver = true;
        reason = "Twoja gromada lub drużyna się rozpadła.";
      } else if (state.resources.school <= 0) {
        gameOver = true;
        reason = "Twoje wyniki w nauce spadły do zera. Musisz powtarzać rok.";
      } else if (state.resources.energy <= 0) {
        gameOver = true;
        reason = "Wypaliłeś się. Brak sił witalnych uniemożliwia dalsze działanie.";
      }

      if (gameOver) {
        state.isGameOver = true;
        state.gameMode = 'gameover';
        state.gameOverReason = reason;
      } else {
        // Prepare next card
        state.weeksSurvived += 1;
        state.currentCardIndex += 1;

        // If deck ends, reshuffle and loop
        if (state.currentCardIndex >= state.deck.length) {
          state.deck = shuffleArray([...state.deck]);
          state.currentCardIndex = 0;
        }
      }
    },
    continueGame: (state) => {
      // Reset any resource below 20 to 50
      (Object.keys(state.resources) as Array<keyof Resources>).forEach((key) => {
        if (state.resources[key] < 20) {
          state.resources[key] = 50;
        }
      });
      
      state.isGameOver = false;
      state.gameMode = 'playing';
      state.gameOverReason = undefined;
    },
    resetGame: (state) => {
        state.gameMode = 'idle';
    }
  },
});

// Helper function to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const { startGame, applyCardEffect, continueGame, resetGame } = gameSlice.actions;
export default gameSlice.reducer;
