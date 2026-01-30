import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'zh', 'ar', 'ru', 'ja', 'ko', 'pt', 'hi'];

interface LanguageRouteHandlerProps {
  children: React.ReactNode;
}

export const LanguageRouteHandler = ({ children }: LanguageRouteHandlerProps) => {
  const { lang } = useParams<{ lang?: string }>();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If URL has a language prefix, update the context
    if (lang && SUPPORTED_LANGUAGES.includes(lang) && lang !== language) {
      setLanguage(lang as typeof language);
    }
  }, [lang, language, setLanguage]);

  // Redirect to language-prefixed URL if needed
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentUrlLang = pathParts[0];
    
    // If the current URL doesn't match the selected language
    if (language !== 'en') {
      // Check if URL already has a language prefix
      if (!SUPPORTED_LANGUAGES.includes(currentUrlLang)) {
        // Add language prefix
        const newPath = `/${language}${location.pathname}`;
        navigate(newPath, { replace: true });
      } else if (currentUrlLang !== language) {
        // Replace language prefix
        pathParts[0] = language;
        navigate(`/${pathParts.join('/')}`, { replace: true });
      }
    } else if (language === 'en' && SUPPORTED_LANGUAGES.includes(currentUrlLang) && currentUrlLang !== 'en') {
      // If language is English but URL has a different language prefix, remove it
      // But only if we explicitly set to English
      const savedLang = localStorage.getItem('app-language');
      if (savedLang === 'en') {
        pathParts.shift(); // Remove language prefix
        navigate(`/${pathParts.join('/')}` || '/', { replace: true });
      }
    }
  }, [language, location.pathname, navigate]);

  return <>{children}</>;
};

export { SUPPORTED_LANGUAGES };
