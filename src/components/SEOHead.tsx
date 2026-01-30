import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

// Language configurations for SEO
const LANGUAGE_CONFIG: Record<string, { 
  name: string; 
  hreflang: string;
  title: string;
  description: string;
}> = {
  en: {
    name: 'English',
    hreflang: 'en',
    title: 'Tesla Investment | Secure Your Future In EV Innovation',
    description: 'Invest in Tesla stock and take part in the future of clean technology. Trusted, fast, and secure-grow your wealth with one of the world\'s leading innovators.',
  },
  de: {
    name: 'Deutsch',
    hreflang: 'de',
    title: 'Tesla Investment | Sichern Sie Ihre Zukunft in der EV-Innovation',
    description: 'Investieren Sie in Tesla-Aktien und nehmen Sie an der Zukunft der sauberen Technologie teil. Vertrauenswürdig, schnell und sicher.',
  },
  fr: {
    name: 'Français',
    hreflang: 'fr',
    title: 'Tesla Investment | Sécurisez Votre Avenir dans l\'Innovation EV',
    description: 'Investissez dans les actions Tesla et participez à l\'avenir de la technologie propre. Fiable, rapide et sécurisé.',
  },
  es: {
    name: 'Español',
    hreflang: 'es',
    title: 'Tesla Investment | Asegura Tu Futuro en la Innovación EV',
    description: 'Invierte en acciones de Tesla y participa en el futuro de la tecnología limpia. Confiable, rápido y seguro.',
  },
  zh: {
    name: '中文',
    hreflang: 'zh',
    title: 'Tesla Investment | 在电动汽车创新中保障您的未来',
    description: '投资特斯拉股票，参与清洁技术的未来。可信、快速、安全。',
  },
  ar: {
    name: 'العربية',
    hreflang: 'ar',
    title: 'Tesla Investment | أمّن مستقبلك في ابتكار المركبات الكهربائية',
    description: 'استثمر في أسهم تسلا وشارك في مستقبل التكنولوجيا النظيفة. موثوق وسريع وآمن.',
  },
  ru: {
    name: 'Русский',
    hreflang: 'ru',
    title: 'Tesla Investment | Обеспечьте Свое Будущее в Инновациях EV',
    description: 'Инвестируйте в акции Tesla и участвуйте в будущем чистых технологий. Надежно, быстро и безопасно.',
  },
  ja: {
    name: '日本語',
    hreflang: 'ja',
    title: 'Tesla Investment | EV イノベーションで未来を確保',
    description: 'テスラ株に投資し、クリーンテクノロジーの未来に参加しましょう。信頼性、迅速性、安全性。',
  },
  ko: {
    name: '한국어',
    hreflang: 'ko',
    title: 'Tesla Investment | EV 혁신으로 미래를 확보하세요',
    description: '테슬라 주식에 투자하고 청정 기술의 미래에 참여하세요. 신뢰할 수 있고 빠르며 안전합니다.',
  },
  pt: {
    name: 'Português',
    hreflang: 'pt',
    title: 'Tesla Investment | Garanta Seu Futuro na Inovação EV',
    description: 'Invista em ações da Tesla e participe do futuro da tecnologia limpa. Confiável, rápido e seguro.',
  },
  hi: {
    name: 'हिंदी',
    hreflang: 'hi',
    title: 'Tesla Investment | EV इनोवेशन में अपना भविष्य सुरक्षित करें',
    description: 'टेस्ला स्टॉक में निवेश करें और स्वच्छ प्रौद्योगिकी के भविष्य में भाग लें। विश्वसनीय, तेज़ और सुरक्षित।',
  },
};

const BASE_URL = 'https://msktesla.net';

interface SEOHeadProps {
  pageTitle?: string;
  pageDescription?: string;
}

export const SEOHead = ({ pageTitle, pageDescription }: SEOHeadProps) => {
  const { language } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en'];
    
    // Update document language
    document.documentElement.lang = config.hreflang;
    
    // Update title
    const title = pageTitle || config.title;
    document.title = title;
    
    // Update meta description
    const description = pageDescription || config.description;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
    
    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
    
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }
    
    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute('content', description);
    }
    
    // Update canonical URL
    const currentPath = location.pathname;
    const canonicalUrl = language === 'en' 
      ? `${BASE_URL}${currentPath === '/' ? '' : currentPath}`
      : `${BASE_URL}/${language}${currentPath === `/${language}` ? '' : currentPath.replace(`/${language}`, '')}`;
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    }
    
    // Update/create hreflang links
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(link => link.remove());
    
    const head = document.head;
    
    // Add hreflang for each supported language
    Object.entries(LANGUAGE_CONFIG).forEach(([langCode, langConfig]) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = langConfig.hreflang;
      
      // Construct the URL for this language
      const basePath = currentPath.replace(/^\/(de|fr|es|zh|ar|ru|ja|ko|pt|hi)/, '');
      const langUrl = langCode === 'en' 
        ? `${BASE_URL}${basePath || '/'}`
        : `${BASE_URL}/${langCode}${basePath || ''}`;
      
      link.href = langUrl;
      head.appendChild(link);
    });
    
    // Add x-default hreflang
    const xDefaultLink = document.createElement('link');
    xDefaultLink.rel = 'alternate';
    xDefaultLink.hreflang = 'x-default';
    xDefaultLink.href = `${BASE_URL}/`;
    head.appendChild(xDefaultLink);
    
  }, [language, location.pathname, pageTitle, pageDescription]);

  return null;
};

export const SUPPORTED_LANGUAGE_CODES = Object.keys(LANGUAGE_CONFIG);
export { LANGUAGE_CONFIG };
