import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Heart, Users, Book, Zap } from 'lucide-react';
import { content } from '../i18n';

const resourceCards = [
  { key: 'family', icon: Heart, color: '#C96A2E', bg: '#FFF4EA' },
  { key: 'scouting', icon: Users, color: '#2F5A45', bg: '#EEF5EF' },
  { key: 'school', icon: Book, color: '#8A6F2F', bg: '#F8F0D6' },
  { key: 'energy', icon: Zap, color: '#3E7A66', bg: '#E8F3EF' },
] as const;

const Instructions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="z-10 flex items-center gap-3 px-5 pb-4 pt-12">
        <button
          onClick={() => navigate('/')}
          className="grid size-11 place-items-center rounded-full border border-[var(--slb-line)] bg-white text-[var(--slb-ink)] shadow-sm"
          aria-label={content.game.backToMenu}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-display text-2xl font-black text-[var(--slb-ink)]">{content.instructions.title}</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-6">
        <section className="space-y-2">
          <h3 className="font-display text-lg font-black text-[var(--slb-ink)]">{content.instructions.goalTitle}</h3>
          <p className="leading-relaxed text-[var(--slb-muted)]">
            {content.instructions.goalText}
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-lg font-black text-[var(--slb-ink)]">{content.instructions.resourcesTitle}</h3>
          <div className="grid grid-cols-1 gap-3">
            {resourceCards.map(({ key, icon: Icon, color, bg }) => (
              <div key={key} className="flex items-center gap-3 rounded-2xl border border-[var(--slb-line)] bg-white/[0.82] p-3 shadow-sm">
                <div className="grid size-11 shrink-0 place-items-center rounded-full" style={{ backgroundColor: bg }}>
                  <Icon size={20} style={{ color }} strokeWidth={2.3} />
                </div>
                <div>
                  <p className="font-display text-sm font-black text-[var(--slb-ink)]">{content.resources[key].title}</p>
                  <p className="text-xs leading-relaxed text-[var(--slb-muted)]">{content.resources[key].description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-display text-lg font-black text-[var(--slb-ink)]">{content.instructions.howToPlayTitle}</h3>
          <div className="space-y-2">
            {content.instructions.steps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl border border-[var(--slb-line)] bg-white/70 p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--slb-pine)] font-display text-xs font-black text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-[var(--slb-muted)]">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-[var(--slb-line)] bg-white/80 p-4 backdrop-blur">
        <Button fullWidth onClick={() => navigate('/game')}>
          {content.instructions.cta}
        </Button>
      </div>
    </div>
  );
};

export default Instructions;
