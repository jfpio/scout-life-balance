import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mars, Venus } from 'lucide-react';
import { Button } from '../components/Button';
import { activeLocale } from '../i18n';

const copy = {
  pl: {
    title: 'Wybierz wersję gry',
    subtitle: 'Podstawowa gra ma dwa zestawy pytań dostosowane do kursów monopłciowych.',
    back: 'Wróć',
    boys: 'Wersja dla harcerzy',
    boysText: 'Pytania zapisane językiem kursu męskiego.',
    girls: 'Wersja dla harcerek',
    girlsText: 'Pytania zapisane językiem kursu żeńskiego.',
  },
  en: {
    title: 'Choose game version',
    subtitle: 'The default game has two Polish question sets for single-gender courses.',
    back: 'Back',
    boys: 'Scouts version',
    boysText: 'Questions written for boys courses.',
    girls: 'Girl scouts version',
    girlsText: 'Questions written for girls courses.',
  },
};

const GameVariantSelect: React.FC = () => {
  const navigate = useNavigate();
  const text = copy[activeLocale];

  return (
    <div className="flex h-full flex-col px-5 pb-8 pt-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="grid size-11 place-items-center rounded-full border border-[var(--slb-line)] bg-white text-[var(--slb-ink)] shadow-sm transition-colors hover:bg-white/80"
          aria-label={text.back}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--slb-ink)]">{text.title}</h1>
          <p className="text-sm leading-relaxed text-[var(--slb-muted)]">{text.subtitle}</p>
        </div>
      </div>

      <div className="mt-8 grid flex-1 content-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/game/harcerze')}
          className="rounded-[28px] border border-[var(--slb-line)] bg-white/85 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
        >
          <div className="mb-4 grid size-12 place-items-center rounded-full bg-[#EEF5EF] text-[var(--slb-pine)]">
            <Mars size={24} />
          </div>
          <h2 className="font-display text-xl font-black text-[var(--slb-ink)]">{text.boys}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--slb-muted)]">{text.boysText}</p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/game/harcerki')}
          className="rounded-[28px] border border-[var(--slb-line)] bg-white/85 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
        >
          <div className="mb-4 grid size-12 place-items-center rounded-full bg-[#FFF4EA] text-[var(--slb-orange)]">
            <Venus size={24} />
          </div>
          <h2 className="font-display text-xl font-black text-[var(--slb-ink)]">{text.girls}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--slb-muted)]">{text.girlsText}</p>
        </button>
      </div>

      <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
        {text.back}
      </Button>
    </div>
  );
};

export default GameVariantSelect;
