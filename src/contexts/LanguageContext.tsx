import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ru' | 'fr' | 'de' | 'es' | 'zh' | 'ar' | 'pt' | 'ja' | 'ko';

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
    'marketCap': 'Market Cap',
    'stockPrice': 'Stock Price',
    'globalDeliveries': 'Global Deliveries',
    'superchargers': 'Superchargers',
    
    // Investment Form
    'makeNewInvestment': 'Make New Investment',
    'investmentAmount': 'Investment Amount (USD)',
    'enterAmount': 'Enter amount (min $100)',
    'submitInvestment': 'Submit Investment Request',
    'processingText': 'Processing...',
    'contactViaWhatsapp': 'Our team will contact you via WhatsApp to complete the investment',
    'minInvestment': 'Minimum investment is $100',
    'investmentSubmitted': 'Investment request submitted! Our team will contact you shortly.',
    'loadingPayment': 'Loading payment details...',
    
    // Payment Details
    'paymentDetails': 'Payment Details',
    'bankName': 'Bank Name',
    'accountHolder': 'Account Holder',
    'cardNumber': 'Card Number',
    'copied': 'Card number copied!',
    'sendReceiptVia': 'Send payment receipt via WhatsApp after transfer',
    'dashboardSubtitle': 'Manage your investments and track your profits',
    
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
    'signInSubtitle': 'Sign in to access your account',
    'createAccountSubtitle': 'Create an account to get started',
    'continueWithGoogle': 'Continue with Google',
    'connecting': 'Connecting...',
    'or': 'or',
    'enterFullName': 'Enter your full name',
    'enterEmail': 'Enter your email address',
    'enterPassword': 'Enter your password',
    'noAccount': "Don't have an account? ",
    'alreadyHaveAccount': 'Already have an account? ',
    'termsAgreement': 'By continuing, you agree to our Terms of Service and Privacy Policy',
    
    // Hero
    'heroTitle': 'Tesla Stock Is A Premier',
    'heroSubtitle': 'Investment platform specializing in electric vehicle and sustainable energy stocks. Join thousands of investors capitalizing on Tesla\'s revolutionary growth.',
    'getStarted': 'Get Started',
    'learnMore': 'Learn More',
    
    // Language
    'language': 'Language',
    'english': 'English',
    'russian': 'Русский',
    'french': 'Français',
    'german': 'Deutsch',
    'spanish': 'Español',
    'chinese': '中文',
    'arabic': 'العربية',
    'portuguese': 'Português',
    'japanese': '日本語',
    'korean': '한국어',
    
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
    'testimonial6': 'The platform has exceeded my expectations. Real-time tracking and expert market insights have helped me make smarter investment decisions.',
    'ceoQuote': 'Invest in the future where innovation meets sustainable returns. Tesla stock represents the convergence of technology, clean energy, and unprecedented market growth.',
    
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
    'defaultLanguage': 'Default Language',
    'setDefaultLanguage': 'Set Default Language',
    
    // Investment Steps
    'investmentSteps': 'Steps to Complete Investment:',
    'step1': 'Make payment to the account details above',
    'step2': 'Send payment receipt via WhatsApp',
    'step3': 'Click "Submit Investment Request"',
    
    // Vision Section
    'visionTitle': 'The Investment Opportunity',
    'visionSubtitle': 'Why smart investors are choosing Tesla for exponential portfolio growth',
    'sustainableEnergy': 'Sustainable Energy',
    'sustainableEnergyDesc': 'Accelerating the world\'s transition to renewable energy',
    'autonomousFuture': 'Autonomous Future',
    'autonomousFutureDesc': 'Full self-driving technology changing transportation',
    'globalScale': 'Global Scale',
    'globalScaleDesc': 'Manufacturing excellence with Gigafactories worldwide',
    
    // Investment Reasons
    'whyInvest': 'Why Invest in Tesla?',
    'sixReasons': 'Six compelling reasons to consider Tesla for your portfolio',
    'reason1': 'Market leader in EV industry with 20%+ market share',
    'reason2': 'Vertically integrated manufacturing reducing costs',
    'reason3': 'Growing energy storage and solar business',
    'reason4': 'Expanding AI and autonomous driving capabilities',
    'reason5': 'Strong brand loyalty and customer satisfaction',
    'reason6': 'Global expansion with new Gigafactories',
    'getStartedToday': 'Get Started Today',
    'downloadProspectus': 'Download Prospectus',
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
    'marketCap': 'Капитализация',
    'stockPrice': 'Цена акций',
    'globalDeliveries': 'Поставки',
    'superchargers': 'Суперчарджеры',
    
    // Investment Form
    'makeNewInvestment': 'Новая инвестиция',
    'investmentAmount': 'Сумма инвестиции (USD)',
    'enterAmount': 'Введите сумму (мин. $100)',
    'submitInvestment': 'Отправить заявку на инвестицию',
    'processingText': 'Обработка...',
    'contactViaWhatsapp': 'Наша команда свяжется с вами через WhatsApp для завершения инвестиции',
    'minInvestment': 'Минимальная инвестиция $100',
    'investmentSubmitted': 'Заявка на инвестицию отправлена! Наша команда скоро свяжется с вами.',
    'loadingPayment': 'Загрузка платежных реквизитов...',
    
    // Payment Details
    'paymentDetails': 'Платежные реквизиты',
    'bankName': 'Наименование банка',
    'accountHolder': 'Владелец счета',
    'cardNumber': 'Номер карты',
    'copied': 'Номер карты скопирован!',
    'dashboardSubtitle': 'Управляйте своими инвестициями и отслеживайте прибыль',
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
    'signInSubtitle': 'Войдите, чтобы получить доступ к вашему аккаунту',
    'createAccountSubtitle': 'Создайте аккаунт, чтобы начать',
    'continueWithGoogle': 'Продолжить с Google',
    'connecting': 'Подключение...',
    'or': 'или',
    'enterFullName': 'Введите ваше полное имя',
    'enterEmail': 'Введите ваш email',
    'enterPassword': 'Введите ваш пароль',
    'noAccount': 'Нет аккаунта? ',
    'alreadyHaveAccount': 'Уже есть аккаунт? ',
    'termsAgreement': 'Продолжая, вы соглашаетесь с Условиями использования и Политикой конфиденциальности',
    
    // Hero
    'heroTitle': 'Tesla Stock — Ведущая',
    'heroSubtitle': 'Инвестиционная платформа, специализирующаяся на акциях электромобилей и устойчивой энергетики. Присоединяйтесь к тысячам инвесторов.',
    'getStarted': 'Начать',
    'learnMore': 'Узнать больше',
    
    // Language
    'language': 'Язык',
    'english': 'English',
    'russian': 'Русский',
    'french': 'Français',
    'german': 'Deutsch',
    'spanish': 'Español',
    'chinese': '中文',
    'arabic': 'العربية',
    'portuguese': 'Português',
    'japanese': '日本語',
    'korean': '한국어',
    
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
    'testimonial6': 'Платформа превзошла мои ожидания. Отслеживание в реальном времени помогло мне принимать более разумные инвестиционные решения.',
    'ceoQuote': 'Инвестируйте в будущее, где инновации сочетаются с устойчивой доходностью. Акции Tesla — это слияние технологий, чистой энергии и беспрецедентного роста рынка.',
    
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
    'defaultLanguage': 'Язык по умолчанию',
    'setDefaultLanguage': 'Установить язык по умолчанию',
    
    // Investment Steps
    'investmentSteps': 'Шаги для завершения инвестиции:',
    'step1': 'Сделайте платеж по указанным реквизитам',
    'step2': 'Отправьте квитанцию об оплате через WhatsApp',
    'step3': 'Нажмите "Отправить заявку на инвестицию"',
    
    // Vision Section
    'visionTitle': 'Инвестиционная возможность',
    'visionSubtitle': 'Почему умные инвесторы выбирают Tesla для экспоненциального роста портфеля',
    'sustainableEnergy': 'Устойчивая энергия',
    'sustainableEnergyDesc': 'Ускорение перехода мира на возобновляемую энергию',
    'autonomousFuture': 'Автономное будущее',
    'autonomousFutureDesc': 'Технология автопилота меняет транспорт',
    'globalScale': 'Глобальный масштаб',
    'globalScaleDesc': 'Производственное совершенство с Гигафабриками по всему миру',
    
    // Investment Reasons
    'whyInvest': 'Почему инвестировать в Tesla?',
    'sixReasons': 'Шесть веских причин рассмотреть Tesla для вашего портфеля',
    'reason1': 'Лидер рынка EV с долей более 20%',
    'reason2': 'Вертикально интегрированное производство снижает затраты',
    'reason3': 'Растущий бизнес хранения энергии и солнечной энергетики',
    'reason4': 'Расширение возможностей ИИ и автономного вождения',
    'reason5': 'Сильная лояльность бренда и удовлетворенность клиентов',
    'reason6': 'Глобальная экспансия с новыми Гигафабриками',
    'getStartedToday': 'Начать сегодня',
    'downloadProspectus': 'Скачать проспект',
  },
  fr: {
    'home': 'Accueil', 'about': 'À propos', 'investments': 'Investissements', 'security': 'Sécurité', 'dashboard': 'Tableau de bord',
    'invest': 'Investir', 'signOut': 'Déconnexion', 'admin': 'Admin', 'totalInvested': 'Total investi', 'totalProfit': 'Profit total',
    'pending': 'En attente', 'active': 'Actif', 'marketCap': 'Cap. boursière', 'stockPrice': 'Prix action', 'globalDeliveries': 'Livraisons', 'superchargers': 'Superchargeurs',
    'makeNewInvestment': 'Nouvel investissement', 'investmentAmount': 'Montant (USD)', 'enterAmount': 'Entrez le montant (min 100$)',
    'submitInvestment': 'Soumettre', 'processingText': 'Traitement...', 'loadingPayment': 'Chargement...',
    'paymentDetails': 'Détails de paiement', 'bankName': 'Nom de la banque', 'accountHolder': 'Titulaire', 'accountNumber': 'Numéro de compte',
    'signIn': 'Connexion', 'signUp': 'Inscription', 'email': 'Email', 'password': 'Mot de passe', 'fullName': 'Nom complet',
    'heroTitle': 'Investissez dans le futur', 'heroSubtitle': 'Rejoignez des milliers d\'investisseurs', 'getStarted': 'Commencer',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': 'Depuis le début', 'welcomeBack': 'Bon retour', 'createAccount': 'Créer un compte',
    'forgotPassword': 'Mot de passe oublié?', 'backToLogin': 'Retour', 'adminPasscode': 'Code admin', 'accessDenied': 'Accès refusé',
    'signInSubtitle': 'Connectez-vous pour accéder à votre compte', 'createAccountSubtitle': 'Créez un compte pour commencer',
    'continueWithGoogle': 'Continuer avec Google', 'connecting': 'Connexion...', 'or': 'ou',
    'enterFullName': 'Entrez votre nom complet', 'enterEmail': 'Entrez votre email', 'enterPassword': 'Entrez votre mot de passe',
    'noAccount': 'Pas de compte? ', 'alreadyHaveAccount': 'Déjà un compte? ',
    'termsAgreement': 'En continuant, vous acceptez nos Conditions d\'utilisation et Politique de confidentialité',
  },
  de: {
    'home': 'Startseite', 'about': 'Über uns', 'investments': 'Investitionen', 'security': 'Sicherheit', 'dashboard': 'Dashboard',
    'invest': 'Investieren', 'signOut': 'Abmelden', 'admin': 'Admin', 'totalInvested': 'Gesamt investiert', 'totalProfit': 'Gesamtgewinn',
    'pending': 'Ausstehend', 'active': 'Aktiv', 'marketCap': 'Marktkapital', 'stockPrice': 'Aktienkurs', 'globalDeliveries': 'Lieferungen', 'superchargers': 'Supercharger',
    'makeNewInvestment': 'Neue Investition', 'investmentAmount': 'Betrag (USD)', 'enterAmount': 'Betrag eingeben (min 100$)',
    'submitInvestment': 'Einreichen', 'processingText': 'Verarbeitung...', 'loadingPayment': 'Laden...',
    'signIn': 'Anmelden', 'signUp': 'Registrieren', 'email': 'E-Mail', 'password': 'Passwort', 'fullName': 'Vollständiger Name',
    'heroTitle': 'In die Zukunft investieren', 'heroSubtitle': 'Schließen Sie sich Tausenden von Investoren an', 'getStarted': 'Starten',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': 'Seit Jahresbeginn', 'welcomeBack': 'Willkommen zurück', 'createAccount': 'Konto erstellen',
    'forgotPassword': 'Passwort vergessen?', 'backToLogin': 'Zurück', 'adminPasscode': 'Admin-Code', 'accessDenied': 'Zugriff verweigert',
    'signInSubtitle': 'Melden Sie sich an, um auf Ihr Konto zuzugreifen', 'createAccountSubtitle': 'Erstellen Sie ein Konto, um zu beginnen',
    'continueWithGoogle': 'Mit Google fortfahren', 'connecting': 'Verbinden...', 'or': 'oder',
    'enterFullName': 'Vollständigen Namen eingeben', 'enterEmail': 'E-Mail eingeben', 'enterPassword': 'Passwort eingeben',
    'noAccount': 'Kein Konto? ', 'alreadyHaveAccount': 'Bereits ein Konto? ',
    'termsAgreement': 'Mit dem Fortfahren stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu',
  },
  es: {
    'home': 'Inicio', 'about': 'Acerca de', 'investments': 'Inversiones', 'security': 'Seguridad', 'dashboard': 'Panel',
    'invest': 'Invertir', 'signOut': 'Cerrar sesión', 'admin': 'Admin', 'totalInvested': 'Total invertido', 'totalProfit': 'Ganancia total',
    'pending': 'Pendiente', 'active': 'Activo', 'marketCap': 'Cap. mercado', 'stockPrice': 'Precio acción', 'globalDeliveries': 'Entregas', 'superchargers': 'Supercargadores',
    'makeNewInvestment': 'Nueva inversión', 'investmentAmount': 'Monto (USD)', 'enterAmount': 'Ingrese monto (mín 100$)',
    'submitInvestment': 'Enviar', 'processingText': 'Procesando...', 'loadingPayment': 'Cargando...',
    'signIn': 'Iniciar sesión', 'signUp': 'Registrarse', 'email': 'Correo', 'password': 'Contraseña', 'fullName': 'Nombre completo',
    'heroTitle': 'Invierte en el futuro', 'heroSubtitle': 'Únete a miles de inversores', 'getStarted': 'Comenzar',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': 'Año hasta la fecha', 'welcomeBack': 'Bienvenido de nuevo', 'createAccount': 'Crear cuenta',
    'forgotPassword': '¿Olvidaste tu contraseña?', 'backToLogin': 'Volver', 'adminPasscode': 'Código admin', 'accessDenied': 'Acceso denegado',
    'signInSubtitle': 'Inicia sesión para acceder a tu cuenta', 'createAccountSubtitle': 'Crea una cuenta para comenzar',
    'continueWithGoogle': 'Continuar con Google', 'connecting': 'Conectando...', 'or': 'o',
    'enterFullName': 'Ingresa tu nombre completo', 'enterEmail': 'Ingresa tu correo', 'enterPassword': 'Ingresa tu contraseña',
    'noAccount': '¿No tienes cuenta? ', 'alreadyHaveAccount': '¿Ya tienes cuenta? ',
    'termsAgreement': 'Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad',
  },
  zh: {
    'home': '首页', 'about': '关于', 'investments': '投资', 'security': '安全', 'dashboard': '仪表板',
    'invest': '投资', 'signOut': '登出', 'admin': '管理', 'totalInvested': '总投资', 'totalProfit': '总利润',
    'pending': '待处理', 'active': '活跃', 'marketCap': '市值', 'stockPrice': '股价', 'globalDeliveries': '交付量', 'superchargers': '超级充电站',
    'makeNewInvestment': '新投资', 'investmentAmount': '金额 (USD)', 'enterAmount': '输入金额 (最低100$)',
    'submitInvestment': '提交', 'processingText': '处理中...', 'loadingPayment': '加载中...',
    'signIn': '登录', 'signUp': '注册', 'email': '邮箱', 'password': '密码', 'fullName': '全名',
    'heroTitle': '投资未来', 'heroSubtitle': '加入成千上万的投资者', 'getStarted': '开始',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': '年初至今', 'welcomeBack': '欢迎回来', 'createAccount': '创建账户',
    'forgotPassword': '忘记密码?', 'backToLogin': '返回', 'adminPasscode': '管理员密码', 'accessDenied': '访问被拒绝',
    'signInSubtitle': '登录以访问您的账户', 'createAccountSubtitle': '创建账户开始使用',
    'continueWithGoogle': '使用Google继续', 'connecting': '连接中...', 'or': '或',
    'enterFullName': '输入您的全名', 'enterEmail': '输入您的邮箱', 'enterPassword': '输入您的密码',
    'noAccount': '没有账户？', 'alreadyHaveAccount': '已有账户？',
    'termsAgreement': '继续即表示您同意我们的服务条款和隐私政策',
  },
  ar: {
    'home': 'الرئيسية', 'about': 'حول', 'investments': 'استثمارات', 'security': 'أمان', 'dashboard': 'لوحة القيادة',
    'invest': 'استثمار', 'signOut': 'خروج', 'admin': 'إدارة', 'totalInvested': 'إجمالي الاستثمار', 'totalProfit': 'إجمالي الربح',
    'pending': 'معلق', 'active': 'نشط', 'marketCap': 'القيمة السوقية', 'stockPrice': 'سعر السهم', 'globalDeliveries': 'التسليمات', 'superchargers': 'الشواحن',
    'makeNewInvestment': 'استثمار جديد', 'investmentAmount': 'المبلغ (USD)', 'enterAmount': 'أدخل المبلغ (حد أدنى 100$)',
    'submitInvestment': 'إرسال', 'processingText': 'جاري المعالجة...', 'loadingPayment': 'جاري التحميل...',
    'signIn': 'تسجيل الدخول', 'signUp': 'إنشاء حساب', 'email': 'البريد', 'password': 'كلمة المرور', 'fullName': 'الاسم الكامل',
    'heroTitle': 'استثمر في المستقبل', 'heroSubtitle': 'انضم لآلاف المستثمرين', 'getStarted': 'ابدأ',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': 'منذ بداية العام', 'welcomeBack': 'مرحباً بعودتك', 'createAccount': 'إنشاء حساب',
    'forgotPassword': 'نسيت كلمة المرور؟', 'backToLogin': 'رجوع', 'adminPasscode': 'رمز الإدارة', 'accessDenied': 'تم رفض الوصول',
    'signInSubtitle': 'سجل الدخول للوصول إلى حسابك', 'createAccountSubtitle': 'أنشئ حساباً للبدء',
    'continueWithGoogle': 'المتابعة مع Google', 'connecting': 'جاري الاتصال...', 'or': 'أو',
    'enterFullName': 'أدخل اسمك الكامل', 'enterEmail': 'أدخل بريدك الإلكتروني', 'enterPassword': 'أدخل كلمة المرور',
    'noAccount': 'ليس لديك حساب؟ ', 'alreadyHaveAccount': 'لديك حساب بالفعل؟ ',
    'termsAgreement': 'بالمتابعة، فإنك توافق على شروط الخدمة وسياسة الخصوصية',
  },
  pt: {
    'home': 'Início', 'about': 'Sobre', 'investments': 'Investimentos', 'security': 'Segurança', 'dashboard': 'Painel',
    'invest': 'Investir', 'signOut': 'Sair', 'admin': 'Admin', 'totalInvested': 'Total investido', 'totalProfit': 'Lucro total',
    'pending': 'Pendente', 'active': 'Ativo', 'marketCap': 'Cap. mercado', 'stockPrice': 'Preço ação', 'globalDeliveries': 'Entregas', 'superchargers': 'Supercarregadores',
    'makeNewInvestment': 'Novo investimento', 'investmentAmount': 'Valor (USD)', 'enterAmount': 'Digite o valor (mín 100$)',
    'submitInvestment': 'Enviar', 'processingText': 'Processando...', 'loadingPayment': 'Carregando...',
    'signIn': 'Entrar', 'signUp': 'Cadastrar', 'email': 'Email', 'password': 'Senha', 'fullName': 'Nome completo',
    'heroTitle': 'Invista no futuro', 'heroSubtitle': 'Junte-se a milhares de investidores', 'getStarted': 'Começar',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': 'No ano', 'welcomeBack': 'Bem-vindo de volta', 'createAccount': 'Criar conta',
    'forgotPassword': 'Esqueceu a senha?', 'backToLogin': 'Voltar', 'adminPasscode': 'Código admin', 'accessDenied': 'Acesso negado',
    'signInSubtitle': 'Entre para acessar sua conta', 'createAccountSubtitle': 'Crie uma conta para começar',
    'continueWithGoogle': 'Continuar com Google', 'connecting': 'Conectando...', 'or': 'ou',
    'enterFullName': 'Digite seu nome completo', 'enterEmail': 'Digite seu email', 'enterPassword': 'Digite sua senha',
    'noAccount': 'Não tem conta? ', 'alreadyHaveAccount': 'Já tem conta? ',
    'termsAgreement': 'Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade',
  },
  ja: {
    'home': 'ホーム', 'about': '概要', 'investments': '投資', 'security': 'セキュリティ', 'dashboard': 'ダッシュボード',
    'invest': '投資', 'signOut': 'ログアウト', 'admin': '管理', 'totalInvested': '総投資額', 'totalProfit': '総利益',
    'pending': '保留中', 'active': 'アクティブ', 'marketCap': '時価総額', 'stockPrice': '株価', 'globalDeliveries': '配送', 'superchargers': 'スーパーチャージャー',
    'makeNewInvestment': '新規投資', 'investmentAmount': '金額 (USD)', 'enterAmount': '金額を入力 (最低100$)',
    'submitInvestment': '送信', 'processingText': '処理中...', 'loadingPayment': '読み込み中...',
    'signIn': 'ログイン', 'signUp': '登録', 'email': 'メール', 'password': 'パスワード', 'fullName': '氏名',
    'heroTitle': '未来に投資', 'heroSubtitle': '何千人もの投資家に参加', 'getStarted': '開始',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': '年初来', 'welcomeBack': 'おかえりなさい', 'createAccount': 'アカウント作成',
    'forgotPassword': 'パスワードを忘れた?', 'backToLogin': '戻る', 'adminPasscode': '管理者コード', 'accessDenied': 'アクセス拒否',
    'signInSubtitle': 'アカウントにアクセスするにはログインしてください', 'createAccountSubtitle': '開始するにはアカウントを作成してください',
    'continueWithGoogle': 'Googleで続行', 'connecting': '接続中...', 'or': 'または',
    'enterFullName': '氏名を入力', 'enterEmail': 'メールを入力', 'enterPassword': 'パスワードを入力',
    'noAccount': 'アカウントをお持ちでないですか？', 'alreadyHaveAccount': 'すでにアカウントをお持ちですか？',
    'termsAgreement': '続行することで、利用規約とプライバシーポリシーに同意したことになります',
  },
  ko: {
    'home': '홈', 'about': '소개', 'investments': '투자', 'security': '보안', 'dashboard': '대시보드',
    'invest': '투자', 'signOut': '로그아웃', 'admin': '관리', 'totalInvested': '총 투자액', 'totalProfit': '총 수익',
    'pending': '대기 중', 'active': '활성', 'marketCap': '시가총액', 'stockPrice': '주가', 'globalDeliveries': '배송', 'superchargers': '슈퍼차저',
    'makeNewInvestment': '새 투자', 'investmentAmount': '금액 (USD)', 'enterAmount': '금액 입력 (최소 100$)',
    'submitInvestment': '제출', 'processingText': '처리 중...', 'loadingPayment': '로딩 중...',
    'signIn': '로그인', 'signUp': '가입', 'email': '이메일', 'password': '비밀번호', 'fullName': '이름',
    'heroTitle': '미래에 투자', 'heroSubtitle': '수천 명의 투자자와 함께', 'getStarted': '시작',
    'english': 'English', 'russian': 'Русский', 'french': 'Français', 'german': 'Deutsch', 'spanish': 'Español',
    'chinese': '中文', 'arabic': 'العربية', 'portuguese': 'Português', 'japanese': '日本語', 'korean': '한국어',
    'yearToDate': '연초 대비', 'welcomeBack': '다시 오신 것을 환영합니다', 'createAccount': '계정 만들기',
    'forgotPassword': '비밀번호 찾기', 'backToLogin': '돌아가기', 'adminPasscode': '관리자 코드', 'accessDenied': '접근 거부',
    'signInSubtitle': '계정에 액세스하려면 로그인하세요', 'createAccountSubtitle': '시작하려면 계정을 만드세요',
    'continueWithGoogle': 'Google로 계속', 'connecting': '연결 중...', 'or': '또는',
    'enterFullName': '이름 입력', 'enterEmail': '이메일 입력', 'enterPassword': '비밀번호 입력',
    'noAccount': '계정이 없으신가요? ', 'alreadyHaveAccount': '이미 계정이 있으신가요? ',
    'termsAgreement': '계속하면 서비스 약관 및 개인정보 보호정책에 동의하는 것입니다',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'ru'; // Default to Russian
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
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
