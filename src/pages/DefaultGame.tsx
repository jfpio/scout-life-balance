import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Game from './Game';
import harcerzeCards from '../data/cards.harcerze.json';
import harcerkiCards from '../data/cards.harcerki.json';
import { content } from '../i18n';
import type { Card } from '../types/game';

type DefaultGameVariant = 'harcerze' | 'harcerki';

const defaultDecks: Record<DefaultGameVariant, Card[]> = {
  harcerze: harcerzeCards as Card[],
  harcerki: harcerkiCards as Card[],
};

const isDefaultGameVariant = (value: string | undefined): value is DefaultGameVariant => {
  return value === 'harcerze' || value === 'harcerki';
};

const DefaultGame: React.FC = () => {
  const { variant } = useParams();

  if (!isDefaultGameVariant(variant)) {
    return <Navigate to="/game" replace />;
  }

  return (
    <Game
      deck={defaultDecks[variant]}
      gameOverReasons={content.game.gameOverReasons}
      sessionKey={`default-${variant}`}
      exitPath="/game"
    />
  );
};

export default DefaultGame;
