import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'home': 'Home',
    'about': 'About',
    'investments': 'Investments',
    'security': 'Security',
    'dashboard': 'Dashboard',
    
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
    'forgotPassword': 'Forgot Password?',
    'resetPassword': 'Reset Password',
    'enterPhone': 'Enter your registered phone number',
    'phoneNumber': 'Phone Number',
    'newPassword': 'New Password',
    'confirmPassword': 'Confirm Password',
    'passwordChanged': 'Password changed successfully!',
    'invalidPhone': 'Invalid phone number',
    'backToLogin': 'Back to Login',
    
    // Hero
    'heroTitle': 'Invest in the Future',
    'heroSubtitle': 'Join thousands of investors building wealth with Tesla',
    'getStarted': 'Get Started',
    'learnMore': 'Learn More',
    
    // Language
    'language': 'Language',
    'english': 'English',
    'russian': 'Russian',
    
    // Footer
    'footerDescription': 'Tesla Invest is a premier investment platform specializing in electric vehicle and sustainable energy stocks. We provide secure, transparent, and profitable investment opportunities.',
    'company': 'Company',
    'aboutUs': 'About Us',
    'ourTeam': 'Our Team',
    'careers': 'Careers',
    'contact': 'Contact',
    'legal': 'Legal',
    'termsOfService': 'Terms of Service',
    'privacyPolicy': 'Privacy Policy',
    'riskDisclosure': 'Risk Disclosure',
    'cookiePolicy': 'Cookie Policy',
    'regulatory': 'Regulatory',
    'license': 'License',
    'compliance': 'Compliance',
    'amlPolicy': 'AML Policy',
    'investorProtection': 'Investor Protection',
    'regulatedEntity': 'Regulated Investment Platform',
    'licenseNumber': 'License Number',
    'allRightsReserved': 'All rights reserved.',
    'registrationInfo': 'Registered in California, USA. Registration No. 2024-INV-001234',
    
    // Testimonials
    'testimonialTitle': 'What Our Investors Say',
    'testimonialSubtitle': 'Join thousands of satisfied investors worldwide',
    'investor': 'Investor',
    'testimonial1': 'Tesla Invest has completely transformed my investment portfolio. The returns have been exceptional and the platform is incredibly easy to use.',
    'testimonial2': 'I was skeptical at first, but after seeing consistent profits for 6 months, I am now a believer. Highly recommend to anyone looking to invest in the future.',
    'testimonial3': 'The transparency and professionalism of Tesla Invest is unmatched. I feel secure knowing my investments are in good hands.',
    'testimonial4': 'Started with a small investment and have grown it significantly. The real-time tracking and profit notifications are fantastic.',
    'testimonial5': 'Best investment decision I have ever made. The team is responsive and the platform delivers on its promises.',
    'testimonial6': 'Tesla Invest makes investing in EV stocks accessible and profitable. My portfolio has never looked better.',
    'ceoQuote': 'The future is electric. Every day, we are getting closer to a sustainable energy future that will benefit all of humanity.',
    
    // Stock Growth
    'marketLeader': 'Market Leader',
    'stockGrowthTitle': 'Tesla Stock:',
    'exponentialGrowth': 'Exponential Growth',
    'stockGrowthDesc': 'Tesla has consistently outperformed the market, delivering exceptional returns to early investors. Join the movement today.',
    'yearToDate': 'Year to Date',
    'fiveYear': '5 Year Return',
    'sinceIPO': 'Since IPO',
    
    // Admin
    'adminPasscode': 'Enter Admin Passcode',
    'accessDenied': 'Access Denied',
    'enterPasscode': 'Enter passcode to access admin panel',
  },
  ru: {
    // Navigation
    'home': 'Главная',
    'about': 'О нас',
    'investments': 'Инвестиции',
    'security': 'Безопасность',
    'dashboard': 'Панель',
    
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
    'forgotPassword': 'Забыли пароль?',
    'resetPassword': 'Сбросить пароль',
    'enterPhone': 'Введите ваш зарегистрированный номер телефона',
    'phoneNumber': 'Номер телефона',
    'newPassword': 'Новый пароль',
    'confirmPassword': 'Подтвердите пароль',
    'passwordChanged': 'Пароль успешно изменен!',
    'invalidPhone': 'Неверный номер телефона',
    'backToLogin': 'Назад к входу',
    
    // Hero
    'heroTitle': 'Инвестируйте в будущее',
    'heroSubtitle': 'Присоединяйтесь к тысячам инвесторов, создающих богатство с Tesla',
    'getStarted': 'Начать',
    'learnMore': 'Узнать больше',
    
    // Language
    'language': 'Язык',
    'english': 'Английский',
    'russian': 'Русский',
    
    // Footer
    'footerDescription': 'Tesla Invest — ведущая инвестиционная платформа, специализирующаяся на акциях электромобилей и устойчивой энергетики. Мы обеспечиваем безопасные, прозрачные и прибыльные инвестиционные возможности.',
    'company': 'Компания',
    'aboutUs': 'О нас',
    'ourTeam': 'Наша команда',
    'careers': 'Карьера',
    'contact': 'Контакты',
    'legal': 'Юридическая информация',
    'termsOfService': 'Условия использования',
    'privacyPolicy': 'Политика конфиденциальности',
    'riskDisclosure': 'Раскрытие рисков',
    'cookiePolicy': 'Политика cookie',
    'regulatory': 'Регулирование',
    'license': 'Лицензия',
    'compliance': 'Соответствие',
    'amlPolicy': 'Политика ПОД/ФТ',
    'investorProtection': 'Защита инвесторов',
    'regulatedEntity': 'Регулируемая инвестиционная платформа',
    'licenseNumber': 'Номер лицензии',
    'allRightsReserved': 'Все права защищены.',
    'registrationInfo': 'Зарегистрировано в Калифорнии, США. Рег. номер 2024-INV-001234',
    
    // Testimonials
    'testimonialTitle': 'Отзывы наших инвесторов',
    'testimonialSubtitle': 'Присоединяйтесь к тысячам довольных инвесторов по всему миру',
    'investor': 'Инвестор',
    'testimonial1': 'Tesla Invest полностью преобразил мой инвестиционный портфель. Доходность была исключительной, а платформа невероятно проста в использовании.',
    'testimonial2': 'Сначала я был скептически настроен, но после 6 месяцев стабильной прибыли я убедился. Настоятельно рекомендую всем, кто хочет инвестировать в будущее.',
    'testimonial3': 'Прозрачность и профессионализм Tesla Invest не имеют себе равных. Я чувствую себя уверенно, зная, что мои инвестиции в надежных руках.',
    'testimonial4': 'Начал с небольшой инвестиции и значительно увеличил её. Отслеживание в реальном времени и уведомления о прибыли — это фантастика.',
    'testimonial5': 'Лучшее инвестиционное решение в моей жизни. Команда отзывчива, а платформа выполняет свои обещания.',
    'testimonial6': 'Tesla Invest делает инвестиции в акции электромобилей доступными и прибыльными. Мой портфель никогда не выглядел лучше.',
    'ceoQuote': 'Будущее за электричеством. Каждый день мы приближаемся к устойчивому энергетическому будущему, которое принесет пользу всему человечеству.',
    
    // Stock Growth
    'marketLeader': 'Лидер рынка',
    'stockGrowthTitle': 'Акции Tesla:',
    'exponentialGrowth': 'Экспоненциальный рост',
    'stockGrowthDesc': 'Tesla стабильно превосходит рынок, обеспечивая исключительную доходность ранним инвесторам. Присоединяйтесь сегодня.',
    'yearToDate': 'С начала года',
    'fiveYear': 'За 5 лет',
    'sinceIPO': 'С IPO',
    
    // Admin
    'adminPasscode': 'Введите пароль администратора',
    'accessDenied': 'Доступ запрещен',
    'enterPasscode': 'Введите пароль для доступа к панели администратора',
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
