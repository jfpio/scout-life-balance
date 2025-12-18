import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Heart, Users, Book, Zap } from 'lucide-react';

const Instructions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white shadow-sm flex items-center gap-2 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Instrukcja</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="space-y-2">
          <h3 className="font-bold text-lg text-gray-800">Cel gry</h3>
          <p className="text-gray-600 leading-relaxed">
            Twoim zadaniem jest przetrwać jak najwięcej tygodni, balansując czterema kluczowymi obszarami życia instruktora harcerskiego.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">Zasoby</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="bg-red-100 p-2 rounded-lg"><Heart size={20} className="text-red-500" /></div>
              <div>
                <p className="font-semibold text-sm">Rodzina i przyjaciele</p>
                <p className="text-xs text-gray-500">Relacje z bliskimi</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="bg-blue-100 p-2 rounded-lg"><Users size={20} className="text-blue-500" /></div>
              <div>
                <p className="font-semibold text-sm">Drużyna (Harcerstwo)</p>
                <p className="text-xs text-gray-500">Obowiązki instruktorskie</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="bg-yellow-100 p-2 rounded-lg"><Book size={20} className="text-yellow-600" /></div>
              <div>
                <p className="font-semibold text-sm">Szkoła (Nauka)</p>
                <p className="text-xs text-gray-500">Edukacja i rozwój</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="bg-green-100 p-2 rounded-lg"><Zap size={20} className="text-green-500" /></div>
              <div>
                <p className="font-semibold text-sm">Energia</p>
                <p className="text-xs text-gray-500">Zdrowie i siły witalne</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-lg text-gray-800">Jak grać?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Pojawi się karta z opisem sytuacji.</li>
            <li>Przesuń kartę w <strong>lewo</strong> lub w <strong>prawo</strong> aby podjąć decyzję.</li>
            <li>Obserwuj paski zasobów - decyzje wpływają na nie w różny sposób.</li>
            <li>Gra kończy się, gdy którykolwiek pasek spadnie do zera.</li>
          </ul>
        </section>
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <Button fullWidth onClick={() => navigate('/game')}>
          Zrozumiałem, grajmy!
        </Button>
      </div>
    </div>
  );
};

export default Instructions;
