import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { activeLocale } from '../i18n';
import { loadCustomGame } from '../services/customGames';
import type { CustomGameDocument } from '../types/game';
import Game from './Game';

const copy = {
  pl: {
    loading: 'Ładuję grę...',
    unavailableTitle: 'Gra niedostępna',
    unavailableText: 'Ten link wygasł albo gra została usunięta.',
    back: 'Wróć do menu',
    configError: 'Brakuje konfiguracji Firebase dla tej funkcji.',
  },
  en: {
    loading: 'Loading game...',
    unavailableTitle: 'Game unavailable',
    unavailableText: 'This link has expired or the game was removed.',
    back: 'Back to menu',
    configError: 'Firebase configuration is missing for this feature.',
  },
};

const CustomGame: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const text = copy[activeLocale];
  const [customGame, setCustomGame] = React.useState<CustomGameDocument | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!slug) {
        setError(text.unavailableText);
        setIsLoading(false);
        return;
      }

      try {
        const game = await loadCustomGame(slug);
        if (!isMounted) return;
        if (!game) {
          setError(text.unavailableText);
          return;
        }
        setCustomGame(game);
      } catch (caughtError) {
        if (!isMounted) return;
        if (caughtError instanceof Error && caughtError.message.includes('Firebase')) {
          setError(text.configError);
        } else {
          setError(text.unavailableText);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [slug, text.configError, text.unavailableText]);

  if (customGame) {
    return (
      <Game
        deck={customGame.cards}
        gameOverReasons={customGame.gameOverReasons}
        sessionKey={`custom:${customGame.slug}`}
      />
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 p-6 text-center">
      {isLoading ? (
        <div className="space-y-3">
          <Loader2 size={32} className="mx-auto animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-gray-600">{text.loading}</p>
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-5">
          <button
            onClick={() => navigate('/')}
            className="mx-auto rounded-full bg-white p-3 text-gray-600 shadow-sm transition-colors hover:bg-gray-100"
            aria-label={text.back}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{text.unavailableTitle}</h1>
            <p className="mt-2 text-sm text-gray-500">{error ?? text.unavailableText}</p>
          </div>
          <Button fullWidth onClick={() => navigate('/')}>
            {text.back}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomGame;
