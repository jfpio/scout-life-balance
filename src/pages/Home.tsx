import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowRight, BookOpen, Compass, QrCode } from 'lucide-react';
import { activeLocale, content } from '../i18n';

const customGameLabel = {
  pl: 'Stwórz własną grę',
  en: 'Create custom game',
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col justify-between px-7 pb-8 pt-12">
      <div className="fade-up">
        <div className="mb-8 flex items-center justify-between">
          <div className="grid size-14 place-items-center rounded-full border border-[var(--slb-line)] bg-white shadow-sm">
            <Compass size={30} className="text-[var(--slb-pine)]" strokeWidth={2.2} />
          </div>
          <div className="rounded-full border border-[var(--slb-line)] bg-white/70 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--slb-muted)]">
            {content.home.version}
          </div>
        </div>

        <h1 className="font-display text-[clamp(3.1rem,16vw,4.7rem)] font-black uppercase leading-[0.82] tracking-normal text-[var(--slb-ink)]">
          <span className="block">Scout</span>
          <span className="block text-[var(--slb-orange)]">Life</span>
          <span className="block">Balance</span>
        </h1>
        <p className="mt-6 max-w-[300px] text-base leading-relaxed text-[var(--slb-muted)]">
          {content.home.subtitle}
        </p>
      </div>

      <div className="w-full space-y-4 fade-up">
        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => navigate('/game')}
          className="flex items-center justify-center gap-2"
        >
          <span>{content.home.play}</span>
          <ArrowRight size={20} />
        </Button>

        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => navigate('/create')}
          className="flex items-center justify-center gap-2"
        >
          <span>{customGameLabel[activeLocale]}</span>
          <QrCode size={20} />
        </Button>

        <Button 
          variant="outline" 
          fullWidth 
          onClick={() => navigate('/instructions')}
          className="flex items-center justify-center gap-2"
        >
          <span>{content.home.instructions}</span>
          <BookOpen size={20} />
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-xs font-semibold text-[var(--slb-muted)]">
          {content.home.creator}
        </p>
        <p className="mt-1 text-[10px] text-[var(--slb-muted)]">
          {content.home.contactPrefix} <a href="mailto:jpiotrowski@zhr.pl" className="underline underline-offset-2 transition-colors hover:text-[var(--slb-pine)]">jpiotrowski@zhr.pl</a>
        </p>
      </div>
    </div>
  );
};

export default Home;
