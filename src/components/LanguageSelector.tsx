import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: '🇺🇸 English', name: 'english' },
  { code: 'ru', label: '🇷🇺 Русский', name: 'russian' },
  { code: 'fr', label: '🇫🇷 Français', name: 'french' },
  { code: 'de', label: '🇩🇪 Deutsch', name: 'german' },
  { code: 'es', label: '🇪🇸 Español', name: 'spanish' },
  { code: 'zh', label: '🇨🇳 中文', name: 'chinese' },
  { code: 'ar', label: '🇸🇦 العربية', name: 'arabic' },
  { code: 'pt', label: '🇧🇷 Português', name: 'portuguese' },
  { code: 'ja', label: '🇯🇵 日本語', name: 'japanese' },
  { code: 'ko', label: '🇰🇷 한국어', name: 'korean' },
  { code: 'hi', label: '🇮🇳 हिंदी', name: 'hindi' },
  { code: 'it', label: '🇮🇹 Italiano', name: 'italian' },
  { code: 'tr', label: '🇹🇷 Türkçe', name: 'turkish' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt', name: 'vietnamese' },
  { code: 'th', label: '🇹🇭 ไทย', name: 'thai' },
  { code: 'hu', label: '🇭🇺 Magyar', name: 'hungarian' },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[80px]">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang?.code.toUpperCase() || 'RU'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border z-50 max-h-80 overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={language === lang.code ? 'bg-primary/10' : ''}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
