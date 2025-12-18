export interface Resources {
  family: number;
  team: number;
  school: number;
  energy: number;
}

export type ResourceType = keyof Resources;

export interface CardEffect {
  resource: ResourceType;
  value: number;
}

export interface Card {
  id: string;
  text: string;
  image?: string; // Optional image URL
  leftChoice: string;
  rightChoice: string;
  leftEffects: CardEffect[];
  rightEffects: CardEffect[];
}

export interface GameState {
  resources: Resources;
  deck: Card[];
  currentCardIndex: number;
  isGameOver: boolean;
  weeksSurvived: number; // Each card can represent a day/week, plan says week count as score
  gameOverReason?: string;
  gameMode: 'idle' | 'playing' | 'gameover'; // Added simple state machine
}
