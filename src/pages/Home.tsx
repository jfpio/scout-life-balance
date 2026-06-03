import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { content } from '../i18n';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full space-y-12">
      <div className="text-center space-y-4">
        <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
          <GraduationCap size={48} className="text-green-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          {content.home.title}
        </h1>
        <p className="text-gray-600 text-lg max-w-xs mx-auto">
          {content.home.subtitle}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4">
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
          onClick={() => navigate('/instructions')}
          className="flex items-center justify-center gap-2"
        >
          <span>{content.home.instructions}</span>
          <BookOpen size={20} />
        </Button>
      </div>
      
      <div className="flex flex-col items-center gap-1 absolute bottom-4 w-full px-4 text-center">
        <p className="text-xs text-gray-400 font-medium">
          {content.home.creator}
        </p>
        <p className="text-[10px] text-gray-400">
          {content.home.contactPrefix} <a href="mailto:jpiotrowski@zhr.pl" className="underline hover:text-gray-600 transition-colors">jpiotrowski@zhr.pl</a>
        </p>
        <p className="text-[10px] text-gray-300 mt-1">
          {content.home.version}
        </p>
      </div>
    </div>
  );
};

export default Home;
