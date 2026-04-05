import { useTranslation } from 'react-i18next';
import { Globe, MapPin } from 'lucide-react';
import { Language } from '../types';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#1D9E75] rounded-lg flex items-center justify-center text-white shadow-md">
            <MapPin size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-none tracking-tight">
              Arzoni
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {t('tagline')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full border border-gray-200">
          <button
            onClick={() => changeLanguage('uz')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              i18n.language === 'uz' ? 'bg-white text-[#1D9E75] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            UZ
          </button>
          <button
            onClick={() => changeLanguage('ru')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              i18n.language === 'ru' ? 'bg-white text-[#1D9E75] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              i18n.language === 'en' ? 'bg-white text-[#1D9E75] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </nav>
  );
}
