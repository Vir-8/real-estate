import { Language } from '@/types';
import { useState } from 'react';
import { ChevronDown, Globe, Languages } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onChange: (language: Language) => void;
}

export default function LanguageSelector({ selectedLanguage, onChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { value: 'English', label: 'English', flag: '🇬🇧' },
    { value: 'Hindi', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'Marathi', label: 'मराठी', flag: '🇮🇳' },
    { value: 'Telugu', label: 'తెలుగు', flag: '🇮🇳' },
    { value: 'Mixed', label: 'Mixed', flag: '🌐' },
  ];

  const selectedOption = languages.find(lang => lang.value === selectedLanguage);

  const handleSelect = (value: Language) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Languages size={16} className="mr-2 text-gray-500" />
          <span className="mr-1">{selectedOption?.flag}</span>
          <span>{selectedOption?.label || 'Select language'}</span>
        </div>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <ul className="py-1 overflow-auto max-h-60">
            {languages.map((language) => (
              <li
                key={language.value}
                className={`flex items-center px-3 py-2 text-sm cursor-pointer ${
                  selectedLanguage === language.value
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleSelect(language.value as Language)}
              >
                <span className="mr-2">{language.flag}</span>
                <span>{language.label}</span>
                {selectedLanguage === language.value && (
                  <span className="ml-auto">✓</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
