import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Heart, Users, Book, Zap } from 'lucide-react';
import { content } from '../i18n';

const resourceCards = [
  { key: 'family', icon: Heart, colorClass: 'bg-red-100', iconClass: 'text-red-500' },
  { key: 'scouting', icon: Users, colorClass: 'bg-blue-100', iconClass: 'text-blue-500' },
  { key: 'school', icon: Book, colorClass: 'bg-yellow-100', iconClass: 'text-yellow-600' },
  { key: 'energy', icon: Zap, colorClass: 'bg-green-100', iconClass: 'text-green-500' },
] as const;

const Instructions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white shadow-sm flex items-center gap-2 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{content.instructions.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="space-y-2">
          <h3 className="font-bold text-lg text-gray-800">{content.instructions.goalTitle}</h3>
          <p className="text-gray-600 leading-relaxed">
            {content.instructions.goalText}
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">{content.instructions.resourcesTitle}</h3>
          <div className="grid grid-cols-1 gap-3">
            {resourceCards.map(({ key, icon: Icon, colorClass, iconClass }) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className={`${colorClass} p-2 rounded-lg`}><Icon size={20} className={iconClass} /></div>
                <div>
                  <p className="font-semibold text-sm">{content.resources[key].title}</p>
                  <p className="text-xs text-gray-500">{content.resources[key].description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-lg text-gray-800">{content.instructions.howToPlayTitle}</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {content.instructions.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <Button fullWidth onClick={() => navigate('/game')}>
          {content.instructions.cta}
        </Button>
      </div>
    </div>
  );
};

export default Instructions;
