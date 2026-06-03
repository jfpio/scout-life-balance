export interface Resources {
  family: number;
  scouting: number;
  school: number;
  energy: number;
}

export type ResourceType = keyof Resources;
export type GameOverReasons = Record<ResourceType, string>;

export interface Choice {
  text: string;
  effects: Partial<Resources>;
}

export interface Card {
  id: number;
  description: string;
  image?: string;
  leftChoice: Choice;
  rightChoice: Choice;
}

export interface GameState {
  resources: Resources;
  deck: Card[];
  gameOverReasons: GameOverReasons;
  currentCardIndex: number;
  isGameOver: boolean;
  weeksSurvived: number;
  gameOverReason?: string;
  gameMode: 'idle' | 'playing' | 'gameover';
}

export interface StartGamePayload {
  deck: Card[];
  gameOverReasons: GameOverReasons;
}

export interface CustomGameDocument {
  slug: string;
  cards: Card[];
  gameOverReasons: GameOverReasons;
  createdAt: Date | null;
  expiresAt: Date;
  sourceSheetUrl: string;
  cardCount: number;
}
