import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'invest': 'Invest',
    'signOut': 'Sign Out',
    'admin': 'Admin',
    
    // Stats
    'totalInvested': 'Total Invested',
    'totalProfit': 'Total Profit',
    'pending': 'Pending',
    'active': 'Active',
    
    // Investment Form
    'makeNewInvestment': 'Make New Investment',
    'investmentAmount': 'Investment Amount (USD)',
    'enterAmount': 'Enter amount (min $100)',
    'submitInvestment': 'Submit Investment Request',
    'processingText': 'Processing...',
    'contactViaWhatsapp': 'Our team will contact you via WhatsApp to complete the investment',
    'minInvestment': 'Minimum investment is $100',
    'investmentSubmitted': 'Investment request submitted! Our team will contact you shortly.',
    
    // Payment Details
    'paymentDetails': 'Payment Details',
    'bankName': 'Bank Name',
    'accountHolder': 'Account Holder',
    'accountNumber': 'Account Number',
    'sendReceiptVia': 'Send payment receipt via WhatsApp after transfer',
    
    // Investment History
    'investmentHistory': 'Investment History',
    'noInvestments': 'No investments yet. Start your journey today!',
    'profit': 'profit',
    
    // Chart
    'performanceChart': 'Investment Performance',
    'teslaStock': 'Tesla Stock Performance',
    
    // Notifications
    'profitNotification': 'New profit received!',
    'profitMessage': 'Your investment earned',
    
    // Currency
    'usdToRub': 'Converted to RUB',
    'exchangeRate': 'Exchange rate: 1 USD = ',
    
    // Auth
    'signIn': 'Sign In',
    'signUp': 'Sign Up',
    'email': 'Email',
    'password': 'Password',
    'fullName': 'Full Name',
    'welcomeBack': 'Welcome Back',
    'createAccount': 'Create Account',
    
    // Hero
    'heroTitle': 'Invest in the Future',
    'heroSubtitle': 'Join thousands of investors building wealth with Tesla',
    'getStarted': 'Get Started',
    'learnMore': 'Learn More',
    
    // Language
    'language': 'Language',
    'english': 'English',
    'russian': 'Russian',
  },
  ru: {
    // Header
    'invest': 'Инвестиции',
    'signOut': 'Выйти',
    'admin': 'Админ',
    
    // Stats
    'totalInvested': 'Всего инвестировано',
    'totalProfit': 'Общая прибыль',
    'pending': 'В ожидании',
    'active': 'Активные',
    
    // Investment Form
    'makeNewInvestment': 'Новая инвестиция',
    'investmentAmount': 'Сумма инвестиции (USD)',
    'enterAmount': 'Введите сумму (мин. $100)',
    'submitInvestment': 'Отправить заявку на инвестицию',
    'processingText': 'Обработка...',
    'contactViaWhatsapp': 'Наша команда свяжется с вами через WhatsApp для завершения инвестиции',
    'minInvestment': 'Минимальная инвестиция $100',
    'investmentSubmitted': 'Заявка на инвестицию отправлена! Наша команда скоро свяжется с вами.',
    
    // Payment Details
    'paymentDetails': 'Платежные реквизиты',
    'bankName': 'Наименование банка',
    'accountHolder': 'Владелец счета',
    'accountNumber': 'Номер счета',
    'sendReceiptVia': 'Отправьте квитанцию об оплате через WhatsApp после перевода',
    
    // Investment History
    'investmentHistory': 'История инвестиций',
    'noInvestments': 'Пока нет инвестиций. Начните свой путь сегодня!',
    'profit': 'прибыль',
    
    // Chart
    'performanceChart': 'Показатели инвестиций',
    'teslaStock': 'Динамика акций Tesla',
    
    // Notifications
    'profitNotification': 'Получена новая прибыль!',
    'profitMessage': 'Ваша инвестиция заработала',
    
    // Currency
    'usdToRub': 'Конвертировано в RUB',
    'exchangeRate': 'Курс: 1 USD = ',
    
    // Auth
    'signIn': 'Войти',
    'signUp': 'Регистрация',
    'email': 'Электронная почта',
    'password': 'Пароль',
    'fullName': 'Полное имя',
    'welcomeBack': 'С возвращением',
    'createAccount': 'Создать аккаунт',
    
    // Hero
    'heroTitle': 'Инвестируйте в будущее',
    'heroSubtitle': 'Присоединяйтесь к тысячам инвесторов, создающих богатство с Tesla',
    'getStarted': 'Начать',
    'learnMore': 'Узнать больше',
    
    // Language
    'language': 'Язык',
    'english': 'Английский',
    'russian': 'Русский',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
