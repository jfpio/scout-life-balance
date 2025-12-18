import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { GameState, Card, Resources, CardEffect } from '../types/game';

// Placeholder deck (will be populated properly or fetched)
const initialDeck: Card[] = [];

const initialResources: Resources = {
  family: 50,
  team: 50,
  school: 50,
  energy: 50,
};

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
      state.deck = action.payload; // Deck should be shuffled before passing
      state.currentCardIndex = 0;
      state.isGameOver = false;
      state.weeksSurvived = 0;
      state.gameMode = 'playing';
      state.gameOverReason = undefined;
    },
    applyCardEffect: (state, action: PayloadAction<'left' | 'right'>) => {
      const currentCard = state.deck[state.currentCardIndex];
      if (!currentCard) return;

      const effects = action.payload === 'left' ? currentCard.leftEffects : currentCard.rightEffects;

      // Apply effects
      effects.forEach((effect: CardEffect) => {
        state.resources[effect.resource] = Math.max(0, Math.min(100, state.resources[effect.resource] + effect.value));
      });

      // Check game over conditions
      let gameOver = false;
      let reason = '';

      // Check if any resource hit 0
      if (state.resources.family <= 0) {
        gameOver = true;
        reason = "Twoja rodzina i przyjaciele czują się zaniedbani. Zostałeś sam.";
      } else if (state.resources.team <= 0) {
        gameOver = true;
        reason = "Twoja gromada lub drużyna się rozpadła. Harcerstwo to służba, ale wymaga też obecności.";
      } else if (state.resources.school <= 0) {
        gameOver = true;
        reason = "Twoje wyniki w nauce spadły do poziomu krytycznego. Musisz powtarzać rok.";
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
        state.weeksSurvived += 1; // Increment score
        state.currentCardIndex += 1;

        // Loop deck or end game if deck empty?
        // Plan says "survive as long as possible". If deck runs out, maybe reshuffle or win?
        // For MVP, if deck runs out, we can just say "You survived all scenarios!" or reshuffle.
        // Let's loop for endless play for now, but unique questions per game as per plan?
        // Plan: "Każde pytanie pojawia się tylko raz na rozgrywkę."
        // So if index >= length, maybe we need more cards or game ends (Win).
        if (state.currentCardIndex >= state.deck.length) {
             state.isGameOver = true;
             state.gameMode = 'gameover';
             state.gameOverReason = "Przeszedłeś wszystkie przygotowane scenariusze! Gratulacje, jesteś mistrzem balansu.";
        }
      }
    },
    resetGame: (state) => {
        state.gameMode = 'idle';
    }
  },
});

export const { startGame, applyCardEffect, resetGame } = gameSlice.actions;
export default gameSlice.reducer;
