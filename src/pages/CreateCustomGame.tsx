import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../components/Button';
import { activeLocale } from '../i18n';
import { createCustomGame, CustomGameApiError, type CreateCustomGameResult } from '../services/customGames';

const copy = {
  pl: {
    title: 'Własna wersja gry',
    subtitle: 'Wklej publiczny link do Google Sheets z szablonem kart.',
    sheetLabel: 'Link do Google Sheets',
    sheetPlaceholder: 'https://docs.google.com/spreadsheets/d/...',
    submit: 'Utwórz grę',
    creating: 'Tworzę grę...',
    back: 'Wróć',
    successTitle: 'Gra gotowa',
    successText: (count: number) => `Zaimportowano ${count} aktywnych kart. Link działa przez 14 dni.`,
    copyLink: 'Kopiuj link',
    openGame: 'Otwórz grę',
    validationTitle: 'Popraw arkusz',
    configError: 'Brakuje konfiguracji Firebase dla tej funkcji.',
  },
  en: {
    title: 'Custom game',
    subtitle: 'Paste a public Google Sheets link that uses the card template.',
    sheetLabel: 'Google Sheets link',
    sheetPlaceholder: 'https://docs.google.com/spreadsheets/d/...',
    submit: 'Create game',
    creating: 'Creating game...',
    back: 'Back',
    successTitle: 'Game ready',
    successText: (count: number) => `Imported ${count} active cards. The link works for 14 days.`,
    copyLink: 'Copy link',
    openGame: 'Open game',
    validationTitle: 'Fix the sheet',
    configError: 'Firebase configuration is missing for this feature.',
  },
};

const CreateCustomGame: React.FC = () => {
  const navigate = useNavigate();
  const text = copy[activeLocale];
  const [sheetUrl, setSheetUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<CreateCustomGameResult | null>(null);
  const [error, setError] = React.useState<CustomGameApiError | Error | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const createdGame = await createCustomGame(sheetUrl);
      setResult(createdGame);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(text.configError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.url);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-white p-4">
        <button
          onClick={() => navigate('/')}
          className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
          aria-label={text.back}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{text.title}</h1>
          <p className="text-sm text-gray-500">{text.subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!result && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">{text.sheetLabel}</span>
              <input
                value={sheetUrl}
                onChange={(event) => setSheetUrl(event.target.value)}
                placeholder={text.sheetPlaceholder}
                type="url"
                required
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">
                  {error instanceof CustomGameApiError && error.errors.length > 0
                    ? text.validationTitle
                    : error.message}
                </p>
                {error instanceof CustomGameApiError && error.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {error.errors.slice(0, 8).map((validationError, index) => (
                      <li key={`${validationError.row ?? 'sheet'}-${index}`}>
                        {validationError.row ? `Row ${validationError.row}: ` : ''}
                        {validationError.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <Button fullWidth type="submit" disabled={isSubmitting}>
              <span className="flex items-center justify-center gap-2">
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {isSubmitting ? text.creating : text.submit}
              </span>
            </Button>
          </form>
        )}

        {result && (
          <div className="space-y-5">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <h2 className="text-lg font-bold text-green-900">{text.successTitle}</h2>
              <p className="mt-1 text-sm text-green-800">{text.successText(result.cardCount)}</p>
            </div>

            <div className="flex justify-center rounded-xl border border-gray-100 bg-white p-5">
              <QRCodeSVG value={result.url} size={220} level="M" includeMargin />
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <QrCode size={16} />
                <span>{result.slug}</span>
              </div>
              <p className="break-all text-sm text-gray-600">{result.url}</p>
            </div>

            <div className="space-y-3">
              <Button fullWidth onClick={handleCopy} className="flex items-center justify-center gap-2">
                <Copy size={18} />
                <span>{text.copyLink}</span>
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                <span>{text.openGame}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCustomGame;
