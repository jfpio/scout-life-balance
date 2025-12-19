export interface Resources {
  family: number;
  scouting: number;
  school: number;
  energy: number;
}

export type ResourceType = keyof Resources;

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
  currentCardIndex: number;
  isGameOver: boolean;
  weeksSurvived: number;
  gameOverReason?: string;
  gameMode: 'idle' | 'playing' | 'gameover';
}
