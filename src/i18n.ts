import type { Card, ResourceType } from './types/game';
import plCards from './data/cards.json';
import enCards from './data/cards.en.json';

export type Locale = 'pl' | 'en';

export type GameOverReasons = Record<ResourceType, string>;

interface ResourceText {
  short: string;
  title: string;
  description: string;
}

interface LocaleContent {
  deck: Card[];
  home: {
    title: string;
    subtitle: string;
    play: string;
    instructions: string;
    creator: string;
    contactPrefix: string;
    version: string;
  };
  instructions: {
    title: string;
    goalTitle: string;
    goalText: string;
    resourcesTitle: string;
    howToPlayTitle: string;
    steps: string[];
    cta: string;
  };
  game: {
    weekLabel: (weeks: number) => string;
    emptyTitle: string;
    emptySubtitle: string;
    gameOverTitle: string;
    survivedText: (weeks: number) => string;
    secretPasswordLabel: string;
    secretPasswordPlaceholder: string;
    restart: string;
    backToMenu: string;
    imageAlt: string;
    gameOverReasons: GameOverReasons;
  };
  resources: Record<ResourceType, ResourceText>;
}

const polishWeekWord = (weeks: number) => {
  if (weeks === 1) return 'tydzień';
  if (weeks % 10 >= 2 && weeks % 10 <= 4 && (weeks % 100 < 10 || weeks % 100 >= 20)) {
    return 'tygodnie';
  }
  return 'tygodni';
};

const plContent: LocaleContent = {
    deck: plCards as Card[],
    home: {
      title: 'scout-life-balance',
      subtitle: 'Zarządzaj czasem, energią i obowiązkami młodego instruktora.',
      play: 'Graj',
      instructions: 'Instrukcja',
      creator: 'Twórca: phm. Jan Piotrowski HR',
      contactPrefix: 'Chcesz pomóc dopracować grę? Pisz:',
      version: 'Wersja 0.2.0 MVP',
    },
    instructions: {
      title: 'Instrukcja',
      goalTitle: 'Cel gry',
      goalText:
        'Twoim zadaniem jest przetrwać jak najwięcej tygodni, balansując czterema kluczowymi obszarami życia instruktora harcerskiego.',
      resourcesTitle: 'Zasoby',
      howToPlayTitle: 'Jak grać?',
      steps: [
        'Pojawi się karta z opisem sytuacji.',
        'Przesuń kartę w lewo lub w prawo aby podjąć decyzję.',
        'Obserwuj paski zasobów - decyzje wpływają na nie w różny sposób.',
        'Gra kończy się, gdy którykolwiek pasek spadnie do zera.',
      ],
      cta: 'Zrozumiałem, grajmy!',
    },
    game: {
      weekLabel: (weeks) => `Tydzień: ${weeks}`,
      emptyTitle: 'Brak nowych wyzwań!',
      emptySubtitle: 'Czekaj na aktualizację...',
      gameOverTitle: 'Koniec Gry',
      survivedText: (weeks) => `Przetrwałeś ${weeks} ${polishWeekWord(weeks)}`,
      secretPasswordLabel: 'Tajne hasło',
      secretPasswordPlaceholder: 'Wpisz hasło...',
      restart: 'Zagraj ponownie',
      backToMenu: 'Wróć do menu',
      imageAlt: 'Sytuacja',
      gameOverReasons: {
        family: 'Twoja rodzina i przyjaciele czują się zaniedbani. Zostałeś sam.',
        scouting: 'Twoja gromada lub drużyna się rozpadła.',
        school: 'Twoje wyniki w nauce spadły do zera. Musisz powtarzać rok.',
        energy: 'Wypaliłeś się. Brak sił witalnych uniemożliwia dalsze działanie.',
      },
    },
    resources: {
      family: {
        short: 'Rodzina',
        title: 'Rodzina i przyjaciele',
        description: 'Relacje z bliskimi',
      },
      scouting: {
        short: 'Drużyna',
        title: 'Drużyna (Harcerstwo)',
        description: 'Obowiązki instruktorskie',
      },
      school: {
        short: 'Szkoła',
        title: 'Szkoła (Nauka)',
        description: 'Edukacja i rozwój',
      },
      energy: {
        short: 'Energia',
        title: 'Energia',
        description: 'Zdrowie i siły witalne',
      },
    },
};

const enContent: LocaleContent = {
    deck: enCards as Card[],
    home: {
      title: 'scout-life-balance',
      subtitle: 'Balance time, energy, school, relationships, and scout leadership.',
      play: 'Play',
      instructions: 'Instructions',
      creator: 'Created by Jan Piotrowski',
      contactPrefix: 'Want to help improve the game? Write to:',
      version: 'Version 0.2.0 MVP',
    },
    instructions: {
      title: 'Instructions',
      goalTitle: 'Goal',
      goalText:
        'Survive as many weeks as possible by balancing four key areas of a young scout leader’s life.',
      resourcesTitle: 'Resources',
      howToPlayTitle: 'How to play',
      steps: [
        'A card with a situation will appear.',
        'Swipe the card left or right to make a decision.',
        'Watch the resource bars - each decision affects them differently.',
        'The game ends when any resource drops to zero.',
      ],
      cta: 'Got it, let’s play!',
    },
    game: {
      weekLabel: (weeks) => `Week: ${weeks}`,
      emptyTitle: 'No new challenges!',
      emptySubtitle: 'Wait for an update...',
      gameOverTitle: 'Game Over',
      survivedText: (weeks) => `You survived ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`,
      secretPasswordLabel: 'Secret password',
      secretPasswordPlaceholder: 'Enter password...',
      restart: 'Play again',
      backToMenu: 'Back to menu',
      imageAlt: 'Situation',
      gameOverReasons: {
        family: 'Your family and friends feel neglected. You are left alone.',
        scouting: 'Your scout unit fell apart.',
        school: 'Your school results dropped to zero. You have to repeat the year.',
        energy: 'You burned out. You do not have enough energy to keep going.',
      },
    },
    resources: {
      family: {
        short: 'Family',
        title: 'Family and friends',
        description: 'Relationships with people close to you',
      },
      scouting: {
        short: 'Troop',
        title: 'Troop (Scouting)',
        description: 'Scout leadership responsibilities',
      },
      school: {
        short: 'School',
        title: 'School (Learning)',
        description: 'Education and personal growth',
      },
      energy: {
        short: 'Energy',
        title: 'Energy',
        description: 'Health and vitality',
      },
    },
};

const isEnglishBuild = import.meta.env.VITE_APP_LOCALE === 'en';

export const activeLocale: Locale = isEnglishBuild ? 'en' : 'pl';
export const content = isEnglishBuild ? enContent : plContent;
