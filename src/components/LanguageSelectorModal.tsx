import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Language {
  name: string;
  code: string;
  flag: string;
}

interface LanguageSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLanguage: string;
  onLanguageSelect: (code: string) => void;
}

// Complete list of Google Translate supported languages (2026)
const languages: Language[] = [
  { name: "Afrikaans", code: "af", flag: "🇿🇦" },
  { name: "Albanian", code: "sq", flag: "🇦🇱" },
  { name: "Amharic", code: "am", flag: "🇪🇹" },
  { name: "Arabic", code: "ar", flag: "🇸🇦" },
  { name: "Armenian", code: "hy", flag: "🇦🇲" },
  { name: "Azerbaijani", code: "az", flag: "🇦🇿" },
  { name: "Basque", code: "eu", flag: "🇪🇸" },
  { name: "Belarusian", code: "be", flag: "🇧🇾" },
  { name: "Bengali", code: "bn", flag: "🇧🇩" },
  { name: "Bosnian", code: "bs", flag: "🇧🇦" },
  { name: "Bulgarian", code: "bg", flag: "🇧🇬" },
  { name: "Catalan", code: "ca", flag: "🇪🇸" },
  { name: "Cebuano", code: "ceb", flag: "🇵🇭" },
  { name: "Chinese (Simplified)", code: "zh-CN", flag: "🇨🇳" },
  { name: "Chinese (Traditional)", code: "zh-TW", flag: "🇹🇼" },
  { name: "Croatian", code: "hr", flag: "🇭🇷" },
  { name: "Czech", code: "cs", flag: "🇨🇿" },
  { name: "Danish", code: "da", flag: "🇩🇰" },
  { name: "Dutch", code: "nl", flag: "🇳🇱" },
  { name: "English", code: "en", flag: "🇺🇸" },
  { name: "Estonian", code: "et", flag: "🇪🇪" },
  { name: "Filipino", code: "tl", flag: "🇵🇭" },
  { name: "Finnish", code: "fi", flag: "🇫🇮" },
  { name: "French", code: "fr", flag: "🇫🇷" },
  { name: "Galician", code: "gl", flag: "🇪🇸" },
  { name: "Georgian", code: "ka", flag: "🇬🇪" },
  { name: "German", code: "de", flag: "🇩🇪" },
  { name: "Greek", code: "el", flag: "🇬🇷" },
  { name: "Gujarati", code: "gu", flag: "🇮🇳" },
  { name: "Haitian Creole", code: "ht", flag: "🇭🇹" },
  { name: "Hausa", code: "ha", flag: "🇳🇬" },
  { name: "Hebrew", code: "he", flag: "🇮🇱" },
  { name: "Hindi", code: "hi", flag: "🇮🇳" },
  { name: "Hungarian", code: "hu", flag: "🇭🇺" },
  { name: "Icelandic", code: "is", flag: "🇮🇸" },
  { name: "Igbo", code: "ig", flag: "🇳🇬" },
  { name: "Indonesian", code: "id", flag: "🇮🇩" },
  { name: "Irish", code: "ga", flag: "🇮🇪" },
  { name: "Italian", code: "it", flag: "🇮🇹" },
  { name: "Japanese", code: "ja", flag: "🇯🇵" },
  { name: "Javanese", code: "jv", flag: "🇮🇩" },
  { name: "Kannada", code: "kn", flag: "🇮🇳" },
  { name: "Kazakh", code: "kk", flag: "🇰🇿" },
  { name: "Khmer", code: "km", flag: "🇰🇭" },
  { name: "Kinyarwanda", code: "rw", flag: "🇷🇼" },
  { name: "Korean", code: "ko", flag: "🇰🇷" },
  { name: "Kurdish", code: "ku", flag: "🇮🇶" },
  { name: "Kyrgyz", code: "ky", flag: "🇰🇬" },
  { name: "Lao", code: "lo", flag: "🇱🇦" },
  { name: "Latvian", code: "lv", flag: "🇱🇻" },
  { name: "Lithuanian", code: "lt", flag: "🇱🇹" },
  { name: "Luxembourgish", code: "lb", flag: "🇱🇺" },
  { name: "Macedonian", code: "mk", flag: "🇲🇰" },
  { name: "Malagasy", code: "mg", flag: "🇲🇬" },
  { name: "Malay", code: "ms", flag: "🇲🇾" },
  { name: "Malayalam", code: "ml", flag: "🇮🇳" },
  { name: "Maltese", code: "mt", flag: "🇲🇹" },
  { name: "Maori", code: "mi", flag: "🇳🇿" },
  { name: "Marathi", code: "mr", flag: "🇮🇳" },
  { name: "Mongolian", code: "mn", flag: "🇲🇳" },
  { name: "Myanmar (Burmese)", code: "my", flag: "🇲🇲" },
  { name: "Nepali", code: "ne", flag: "🇳🇵" },
  { name: "Norwegian", code: "no", flag: "🇳🇴" },
  { name: "Odia (Oriya)", code: "or", flag: "🇮🇳" },
  { name: "Pashto", code: "ps", flag: "🇦🇫" },
  { name: "Persian", code: "fa", flag: "🇮🇷" },
  { name: "Polish", code: "pl", flag: "🇵🇱" },
  { name: "Portuguese (Brazil)", code: "pt-BR", flag: "🇧🇷" },
  { name: "Portuguese (Portugal)", code: "pt-PT", flag: "🇵🇹" },
  { name: "Punjabi", code: "pa", flag: "🇮🇳" },
  { name: "Romanian", code: "ro", flag: "🇷🇴" },
  { name: "Russian", code: "ru", flag: "🇷🇺" },
  { name: "Samoan", code: "sm", flag: "🇼🇸" },
  { name: "Serbian", code: "sr", flag: "🇷🇸" },
  { name: "Shona", code: "sn", flag: "🇿🇼" },
  { name: "Sindhi", code: "sd", flag: "🇵🇰" },
  { name: "Sinhala", code: "si", flag: "🇱🇰" },
  { name: "Slovak", code: "sk", flag: "🇸🇰" },
  { name: "Slovenian", code: "sl", flag: "🇸🇮" },
  { name: "Somali", code: "so", flag: "🇸🇴" },
  { name: "Spanish", code: "es", flag: "🇪🇸" },
  { name: "Spanish (Mexico)", code: "es-MX", flag: "🇲🇽" },
  { name: "Sundanese", code: "su", flag: "🇮🇩" },
  { name: "Swahili", code: "sw", flag: "🇰🇪" },
  { name: "Swedish", code: "sv", flag: "🇸🇪" },
  { name: "Tajik", code: "tg", flag: "🇹🇯" },
  { name: "Tamil", code: "ta", flag: "🇮🇳" },
  { name: "Tatar", code: "tt", flag: "🇷🇺" },
  { name: "Telugu", code: "te", flag: "🇮🇳" },
  { name: "Thai", code: "th", flag: "🇹🇭" },
  { name: "Turkish", code: "tr", flag: "🇹🇷" },
  { name: "Turkmen", code: "tk", flag: "🇹🇲" },
  { name: "Ukrainian", code: "uk", flag: "🇺🇦" },
  { name: "Urdu", code: "ur", flag: "🇵🇰" },
  { name: "Uyghur", code: "ug", flag: "🇨🇳" },
  { name: "Uzbek", code: "uz", flag: "🇺🇿" },
  { name: "Vietnamese", code: "vi", flag: "🇻🇳" },
  { name: "Welsh", code: "cy", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { name: "Xhosa", code: "xh", flag: "🇿🇦" },
  { name: "Yiddish", code: "yi", flag: "🇮🇱" },
  { name: "Yoruba", code: "yo", flag: "🇳🇬" },
  { name: "Zulu", code: "zu", flag: "🇿🇦" },
];

// Popular/suggested languages
const suggestedLanguages = ["en", "es", "zh-CN", "fr", "de", "ru", "ar", "hi", "pt-BR", "ja"];

const LanguageSelectorModal = ({ 
  open, 
  onOpenChange, 
  currentLanguage,
  onLanguageSelect 
}: LanguageSelectorModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const suggested = useMemo(() => 
    languages.filter(lang => suggestedLanguages.includes(lang.code)),
    []
  );

  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return languages;
    const query = searchQuery.toLowerCase();
    return languages.filter(lang => 
      lang.name.toLowerCase().includes(query) || 
      lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelect = (code: string) => {
    onLanguageSelect(code);
    onOpenChange(false);
    setSearchQuery('');
  };

  const LanguageItem = ({ lang, showCheck = true }: { lang: Language; showCheck?: boolean }) => (
    <button
      onClick={() => handleSelect(lang.code)}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left w-full transition-all duration-200 hover:bg-electric-blue/10 group ${
        currentLanguage === lang.code ? 'bg-electric-blue/15 text-electric-blue' : 'text-foreground'
      }`}
    >
      <span className="text-lg shrink-0">{lang.flag}</span>
      <span className="text-sm font-medium truncate flex-1">{lang.name}</span>
      {showCheck && currentLanguage === lang.code && (
        <Check className="w-4 h-4 text-electric-blue shrink-0" />
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 gap-0 max-h-[85vh] overflow-hidden">
        <DialogHeader className="p-4 pb-0 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Select your language
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Search bar */}
          <div className="relative mt-4 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-border focus:border-electric-blue"
            />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-4 space-y-6">
            {/* Suggested languages - only show when not searching */}
            {!searchQuery && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Suggested for you
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                  {suggested.map(lang => (
                    <LanguageItem key={lang.code} lang={lang} />
                  ))}
                </div>
              </div>
            )}

            {/* All languages */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {searchQuery ? `Results (${filteredLanguages.length})` : 'All languages'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                {filteredLanguages.map(lang => (
                  <LanguageItem key={lang.code} lang={lang} />
                ))}
              </div>
              {filteredLanguages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No languages found for "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelectorModal;
