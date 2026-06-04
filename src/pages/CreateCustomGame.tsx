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
    passwordTitle: 'Dostęp dla instruktorów',
    passwordText: 'Wpisz proste hasło, aby utworzyć własną wersję gry.',
    passwordLabel: 'Hasło',
    passwordPlaceholder: 'Hasło',
    passwordSubmit: 'Odblokuj',
    passwordError: 'Nieprawidłowe hasło.',
    templateTitle: 'Szablon arkusza',
    templateText: 'Skopiuj szablon do swojego Google Drive, uzupełnij aktywne karty i udostępnij arkusz jako „każdy z linkiem może wyświetlać”.',
    templateOpen: 'Otwórz szablon',
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
    passwordTitle: 'Leader access',
    passwordText: 'Enter the simple password to create a custom game.',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Password',
    passwordSubmit: 'Unlock',
    passwordError: 'Wrong password.',
    templateTitle: 'Spreadsheet template',
    templateText: 'Copy the template to your Google Drive, fill in the active cards, and share it as anyone with the link can view.',
    templateOpen: 'Open template',
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

const templateSheetUrls = {
  pl: 'https://docs.google.com/spreadsheets/d/1HOdjQs9DVRU6BJK8fW6NjXFFlCd_DobqSSSkRBK-P80/edit?usp=sharing',
  en: 'https://docs.google.com/spreadsheets/d/1xA7D_a3DXaPOpN9gzTvTHZUsZ4Km6JerFQtpn5vEAeU/edit?usp=sharing',
};

const CreateCustomGame: React.FC = () => {
  const navigate = useNavigate();
  const text = copy[activeLocale];
  const templateSheetUrl = templateSheetUrls[activeLocale];
  const [isUnlocked, setIsUnlocked] = React.useState(
    () => sessionStorage.getItem('custom-game-creator-unlocked') === 'true',
  );
  const [creatorPassword, setCreatorPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
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

  const handleUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creatorPassword.trim().toLowerCase() !== 'instruktor') {
      setPasswordError(text.passwordError);
      return;
    }

    sessionStorage.setItem('custom-game-creator-unlocked', 'true');
    setIsUnlocked(true);
    setPasswordError('');
    setCreatorPassword('');
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.url);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-4 pt-12">
        <button
          onClick={() => navigate('/')}
          className="grid size-11 place-items-center rounded-full border border-[var(--slb-line)] bg-white text-[var(--slb-ink)] shadow-sm transition-colors hover:bg-white/80"
          aria-label={text.back}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--slb-ink)]">{text.title}</h1>
          <p className="text-sm text-[var(--slb-muted)]">{text.subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {!isUnlocked && (
          <form onSubmit={handleUnlock} className="space-y-5">
            <div className="rounded-3xl border border-[var(--slb-line)] bg-white/80 p-5 shadow-sm">
              <h2 className="font-display text-lg font-black text-[var(--slb-ink)]">{text.passwordTitle}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--slb-muted)]">{text.passwordText}</p>
            </div>

            <label className="block space-y-2">
              <span className="font-display text-xs font-black uppercase tracking-[0.12em] text-[var(--slb-muted)]">{text.passwordLabel}</span>
              <input
                value={creatorPassword}
                onChange={(event) => setCreatorPassword(event.target.value)}
                placeholder={text.passwordPlaceholder}
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-full border border-[var(--slb-line)] bg-white px-4 py-3 text-sm text-[var(--slb-ink)] outline-none transition-all placeholder:text-[var(--slb-muted)] focus:border-[var(--slb-pine)] focus:ring-2 focus:ring-[rgba(47,90,69,0.14)]"
              />
            </label>

            {passwordError && (
              <div className="rounded-2xl border border-[rgba(201,106,46,0.22)] bg-[#FFF4EA] p-4 text-sm font-semibold text-[var(--slb-orange)]">
                {passwordError}
              </div>
            )}

            <Button fullWidth type="submit">
              {text.passwordSubmit}
            </Button>
          </form>
        )}

        {isUnlocked && !result && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-3xl border border-[var(--slb-line)] bg-white/80 p-5 shadow-sm">
              <h2 className="font-display text-lg font-black text-[var(--slb-ink)]">{text.templateTitle}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--slb-muted)]">{text.templateText}</p>
              <a
                href={templateSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#EEF5EF] px-5 font-display text-sm font-black text-[var(--slb-pine)] transition-colors hover:bg-[#E0EFE5]"
              >
                {text.templateOpen}
              </a>
            </div>

            <label className="block space-y-2">
              <span className="font-display text-xs font-black uppercase tracking-[0.12em] text-[var(--slb-muted)]">{text.sheetLabel}</span>
              <input
                value={sheetUrl}
                onChange={(event) => setSheetUrl(event.target.value)}
                placeholder={text.sheetPlaceholder}
                type="url"
                required
                className="w-full rounded-full border border-[var(--slb-line)] bg-white px-4 py-3 text-sm text-[var(--slb-ink)] outline-none transition-all placeholder:text-[var(--slb-muted)] focus:border-[var(--slb-pine)] focus:ring-2 focus:ring-[rgba(47,90,69,0.14)]"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-[rgba(201,106,46,0.22)] bg-[#FFF4EA] p-4 text-sm text-[var(--slb-orange)]">
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
            <div className="rounded-3xl border border-[rgba(47,90,69,0.18)] bg-[#EEF5EF] p-5">
              <h2 className="font-display text-lg font-black text-[var(--slb-pine)]">{text.successTitle}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--slb-pine)]">{text.successText(result.cardCount)}</p>
            </div>

            <div className="flex justify-center rounded-3xl border border-[var(--slb-line)] bg-white p-5 shadow-sm">
              <QRCodeSVG value={result.url} size={220} level="M" includeMargin />
            </div>

            <div className="rounded-3xl border border-[var(--slb-line)] bg-white/80 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--slb-ink)]">
                <QrCode size={16} />
                <span>{result.slug}</span>
              </div>
              <p className="break-all text-sm leading-relaxed text-[var(--slb-muted)]">{result.url}</p>
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
