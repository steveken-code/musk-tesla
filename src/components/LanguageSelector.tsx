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
  { code: 'ar', label: '🇸🇦 العربية', name: 'arabic' },
  { code: 'cs', label: '🇨🇿 Čeština', name: 'czech' },
  { code: 'da', label: '🇩🇰 Dansk', name: 'danish' },
  { code: 'de', label: '🇩🇪 Deutsch', name: 'german' },
  { code: 'el', label: '🇬🇷 Ελληνικά', name: 'greek' },
  { code: 'en', label: '🇺🇸 English', name: 'english' },
  { code: 'es', label: '🇪🇸 Español', name: 'spanish' },
  { code: 'et', label: '🇪🇪 Eesti', name: 'estonian' },
  { code: 'fi', label: '🇫🇮 Suomi', name: 'finnish' },
  { code: 'fr', label: '🇫🇷 Français', name: 'french' },
  { code: 'hi', label: '🇮🇳 हिंदी', name: 'hindi' },
  { code: 'hu', label: '🇭🇺 Magyar', name: 'hungarian' },
  { code: 'it', label: '🇮🇹 Italiano', name: 'italian' },
  { code: 'ja', label: '🇯🇵 日本語', name: 'japanese' },
  { code: 'ko', label: '🇰🇷 한국어', name: 'korean' },
  { code: 'nl', label: '🇳🇱 Nederlands', name: 'dutch' },
  { code: 'no', label: '🇳🇴 Norsk', name: 'norwegian' },
  { code: 'pl', label: '🇵🇱 Polski', name: 'polish' },
  { code: 'pt', label: '🇧🇷 Português', name: 'portuguese' },
  { code: 'ro', label: '🇷🇴 Română', name: 'romanian' },
  { code: 'ru', label: '🇷🇺 Русский', name: 'russian' },
  { code: 'sk', label: '🇸🇰 Slovenčina', name: 'slovak' },
  { code: 'sl', label: '🇸🇮 Slovenščina', name: 'slovenian' },
  { code: 'sv', label: '🇸🇪 Svenska', name: 'swedish' },
  { code: 'th', label: '🇹🇭 ไทย', name: 'thai' },
  { code: 'tr', label: '🇹🇷 Türkçe', name: 'turkish' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt', name: 'vietnamese' },
  { code: 'zh', label: '🇨🇳 中文', name: 'chinese' },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[80px]">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang?.code.toUpperCase() || 'EN'}</span>
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
