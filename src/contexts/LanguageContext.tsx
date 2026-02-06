import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';

type Language = 'en' | 'ru' | 'fr' | 'de' | 'es' | 'zh' | 'zh-TW' | 'ar' | 'pt' | 'ja' | 'ko' | 'hi' | 'it' | 'tr' | 'vi' | 'th' | 'hu' | 'cs' | 'el' | 'pl' | 'ro' | 'da' | 'et' | 'fi' | 'nl' | 'no' | 'sk' | 'sl' | 'sv' | 'id' | 'ms' | 'tl' | 'my' | 'bn' | 'ta' | 'te' | 'ur' | 'ne' | 'he' | 'fa' | 'sw' | 'af' | 'uk' | 'bg' | 'hr' | 'sr' | 'lt' | 'lv' | 'ka' | 'az' | 'kk' | 'uz' | 'ca' | 'eu';

// SEO-optimized languages (stored in database)
const SEO_LANGUAGES = ['de', 'fr', 'es', 'zh', 'ar', 'ru', 'ja', 'ko', 'pt', 'hi'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

// Default English translations (fallback)
const englishTranslations: Record<string, string> = {
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
  'investmentDetails': 'Investment Details',
  'bankName': 'Bank Name',
  'accountHolder': 'Account Holder',
  'cardNumber': 'Card Number',
  'copied': 'Copied!',
  'walletCopied': 'Wallet address copied!',
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
  'heroTitle': 'Invest in the',
  'heroTitleHighlight': 'Future of Electric Mobility',
  'heroSubtitle': 'Trade and track Tesla stocks in real-time. Join millions of investors capitalizing on Tesla\'s revolutionary growth.',
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
  'hindi': 'हिंदी',
  'italian': 'Italiano',
  'turkish': 'Türkçe',
  'vietnamese': 'Tiếng Việt',
  'thai': 'ไทย',
  'hungarian': 'Magyar',
  'czech': 'Čeština',
  'greek': 'Ελληνικά',
  'polish': 'Polski',
  'romanian': 'Română',
  'danish': 'Dansk',
  'estonian': 'Eesti',
  'finnish': 'Suomi',
  'dutch': 'Nederlands',
  'norwegian': 'Norsk',
  'slovak': 'Slovenčina',
  'slovenian': 'Slovenščina',
  'swedish': 'Svenska',
  
  // Footer
  'footerDescription': 'Tesla Stock is a premier investment platform specializing in electric vehicle and sustainable energy stocks. We provide secure, transparent, and profitable investment opportunities.',
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
  'testimonial1': 'Tesla Stock has completely transformed my investment portfolio. The returns have been exceptional and the platform is incredibly easy to use.',
  'testimonial2': 'I was skeptical at first, but after seeing consistent profits for 6 months, I am now a believer. Highly recommend to anyone looking to invest in the future.',
  'testimonial3': 'The transparency and professionalism of Tesla Stock is unmatched. I feel secure knowing my investments are in good hands.',
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
  'adminPanel': 'Admin Panel',
  'paymentSettings': 'Payment Settings',
  'withdrawalSettings': 'Withdrawal Settings',
  'supportSettings': 'Customer Support Settings',
  'defaultHoldMessage': 'Default Hold Message',
  'supportType': 'Support Type',
  'supportPhone': 'Support Phone/Username',
  'savePaymentSettings': 'Save Payment Settings',
  'saveWithdrawalSettings': 'Save Withdrawal Settings',
  'saveSupportSettings': 'Save Support Settings',
  'noInvestmentsYet': 'No investments yet',
  'noWithdrawalsYet': 'No withdrawals yet',
  'setProfit': 'Set Profit',
  'sendProfitEmail': 'Send Profit Email',
  'approve': 'Approve',
  'cancel': 'Cancel',
  'complete': 'Complete',
  'processing': 'Processing',
  'hold': 'Hold',
  'editMessage': 'Edit Message',
  'setPending': 'Set Pending',
  'putOnHold': 'Put on Hold',
  'setProcessing': 'Set Processing',
  'holdBillingMessage': 'Hold/Billing Fee Message',
  'autoGenerateFee': 'Auto Generate Fee',
  'quickTemplates': 'Quick Templates',
  'saveAndNotify': 'Save & Notify',
  'securityLogs': 'Security Logs',
  'loginAttempts': 'Login Attempts',
  'refreshLogs': 'Refresh',
  'success': 'Success',
  'failed': 'Failed',
  'userAgent': 'User Agent',
  'securityInfo': 'Security Information',
  'emailMonitoring': 'Email Monitoring',
  'user': 'User',
  'date': 'Date',
  'country': 'Country',
  'paymentDetailsLabel': 'Payment Details',
  'holdMessage': 'Hold Message',
  
  // Referral
  'referralCode': 'Referral Code',
  'enterReferralCode': 'Enter Referral Code',
  'optional': 'optional',
  'invalidReferralCode': 'Invalid referral code. Please check and try again.',
  'referralSettings': 'Referral Settings',
  'referralEmail': 'Notification Email',
  'saveReferralSettings': 'Save Referral Settings',
  
  // Portfolio
  'portfolioBalance': 'Portfolio Balance',
  'noBalanceYet': 'No Balance Yet',
  'investment': 'Investment',
  
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
  
  // Features Section
  'whyChooseUs': 'Why Choose Us',
  'featuresTitle': 'Everything You Need to Invest',
  'featuresSubtitle': 'A complete platform designed for both beginners and experienced investors.',
  'featureSecurity': 'Bank-Level Security',
  'featureSecurityDesc': 'Your investments are protected with 256-bit encryption and multi-factor authentication.',
  'featureInstant': 'Instant Transactions',
  'featureInstantDesc': 'Execute trades in milliseconds with our high-performance trading infrastructure.',
  'featureMobile': 'Mobile Optimized',
  'featureMobileDesc': 'Full-featured trading experience on any device, anywhere in the world.',
  'featureAnalytics': 'Real-Time Analytics',
  'featureAnalyticsDesc': 'Track your portfolio performance with live charts and detailed insights.',
  'featureWithdrawals': 'Fast Withdrawals',
  'featureWithdrawalsDesc': 'Access your funds within 24 hours via bank transfer or cryptocurrency.',
  'featureSupport': '24/7 Support',
  'featureSupportDesc': 'Dedicated support team available around the clock to assist you.',
  
  // How It Works
  'gettingStarted': 'Getting Started',
  'howItWorks': 'How It Works',
  'howItWorksSubtitle': 'Start your investment journey in four simple steps.',
  'step': 'Step',
  'howStep1Title': 'Create Your Account',
  'howStep1Desc': 'Sign up in under 2 minutes with your email. Verification is quick and secure.',
  'howStep2Title': 'Fund Your Wallet',
  'howStep2Desc': 'Deposit funds via bank transfer, credit card, or cryptocurrency.',
  'howStep3Title': 'Invest in Tesla',
  'howStep3Desc': 'Purchase Tesla shares starting from just $100 with instant confirmation.',
  'howStep4Title': 'Grow & Withdraw',
  'howStep4Desc': 'Watch your investment grow and withdraw profits anytime you want.',
  
  // Innovations
  'innovationsTitle': 'Leading Innovation',
  'innovationsSubtitle': 'Tesla\'s technological breakthroughs are reshaping entire industries',
  'innovationBattery': 'Battery Technology',
  'innovationBatteryDesc': 'Revolutionary 4680 cells delivering longer range, faster charging, and lower costs',
  'innovationBatteryStat': '500+ miles range',
  'innovationAI': 'AI & Full Self-Driving',
  'innovationAIDesc': 'Neural networks processing real-world data to achieve autonomous driving',
  'innovationAIStat': '150M+ miles driven',
  'innovationSupercharger': 'Global Supercharger Network',
  'innovationSuperchargerDesc': 'The world\'s fastest EV charging network with strategic global coverage',
  'innovationSuperchargerStat': '50K+ stations',
  'innovationSpaceX': 'SpaceX Synergy',
  'innovationSpaceXDesc': 'Cross-innovation between Tesla and SpaceX driving breakthrough technologies',
  'innovationSpaceXStat': 'Multi-planetary vision',
  
  // FAQ
  'support': 'Support',
  'faqTitle': 'Frequently Asked',
  'faqTitleHighlight': 'Questions',
  'faqSubtitle': 'Got questions? We\'ve got answers. Find everything you need to know about investing with us.',
  'faqQuestion1': 'Is this the real Tesla stock?',
  'faqAnswer1': 'Yes, we provide access to genuine Tesla (TSLA) stock investments through regulated and licensed financial partners. Your investments are backed by actual Tesla shares traded on major stock exchanges. We ensure full transparency and compliance with financial regulations.',
  'faqQuestion2': 'How secure are my investments?',
  'faqAnswer2': 'Your investments are protected by bank-level SSL encryption and stored in secure, regulated accounts. We use multi-factor authentication, advanced fraud detection, and cold storage for assets. Our platform undergoes regular security audits by independent firms to ensure the highest level of protection.',
  'faqQuestion3': 'How do I withdraw my profits?',
  'faqAnswer3': 'Withdrawing is simple! Go to your Dashboard, click on "Withdraw Funds," enter the amount you wish to withdraw, select your preferred payment method (cryptocurrency or bank transfer), and submit your request. Withdrawals are typically processed within 24-48 hours for crypto and 3-5 business days for bank transfers.',
  'faqQuestion4': 'What is the minimum investment amount?',
  'faqAnswer4': 'You can start investing with as little as $100. This low entry barrier makes Tesla stock accessible to everyone, whether you\'re a beginner or an experienced investor looking to diversify your portfolio.',
  
  // Withdrawal Form
  'withdraw': 'Withdraw',
  'withdrawProfit': 'Withdraw Profit',
  'withdrawalAmount': 'Withdrawal Amount',
  'availableForWithdrawal': 'Available for withdrawal',
  'withdrawAll': 'Withdraw all',
  'selectCountry': 'Select Your Country',
  'chooseCountry': 'Choose your country',
  'searchCountries': 'Search countries...',
  'searchCountry': 'Search Country',
  'countryRequired': 'Country selection required',
  'selectMethod': 'Select Withdrawal Method',
  'bankCard': 'Bank Card',
  'bankCardDesc': 'Withdraw to your bank card',
  'mobilePayment': 'Mobile Payment',
  'mobilePaymentDesc': 'SBP or phone number transfer',
  'cryptoPayment': 'Cryptocurrency',
  'cryptoPaymentDesc': 'Withdraw to crypto wallet',
  'enterPaymentDetails': 'Enter Payment Details',
  'enterCardNumber': 'Enter your card number',
  'enterPhoneNumber': 'Enter your phone number',
  'enterCryptoAddress': 'Enter wallet address (USDT TRC-20)',
  'amount': 'Amount',
  'method': 'Method',
  'reviewWithdrawal': 'Review & Submit',
  'submitWithdrawal': 'Submit Withdrawal Request',
  'submittingWithdrawal': 'Submitting...',
  'next': 'Next',
  'back': 'Back',
  'sberbankNotice': 'Sberbank transfers may take additional time. Please allow up to 24 hours for processing.',
  'withdrawalOnHold': 'Withdrawal On Hold',
  'withdrawalPending': 'Withdrawal Pending',
  'withdrawalCompleted': 'Withdrawal Completed',
  'contactSupport': 'Contact Support',
  'noProfitYet': 'No Profit Yet',
  'clickToWithdraw': 'Click to Withdraw',
  
  // Withdrawal availability
  'completedInvestments': 'Completed Investments',
  'investmentPlusProfit': 'Investment + Profit available',
  'activeProfit': 'Active Trading Profit',
  'profitOnlyWithdrawal': 'Only profit withdrawable while trading',
  'noWithdrawalAvailable': 'Investment still in progress. Withdraw available once trading completes.',
  'viewTransactionHistory': 'View Full Transaction History',
  'pendingWithdrawalExists': 'You already have a pending withdrawal request. Please wait for it to be processed.',
  'withdrawn': 'Withdrawn',
  
  // Crypto Payment (additional)
  'selectCrypto': 'Select Cryptocurrency',
  'selectNetwork': 'Select Network',
  'cryptoWalletAddress': 'Send your payment to:',
  'cryptoInstructions': 'After sending payment, please send your transaction hash via WhatsApp for verification.',
  'transactionHash': 'Transaction Hash',
  'enterTransactionHash': 'Enter your transaction hash',
  'walletAddress': 'USDT Wallet Address',
  'amountToSend': 'Amount to Send',
  'network': 'Network',
  'important': 'Important',
  'cryptoWarning': 'Please ensure only USDT is deposited via this address using the correct network. Any other cryptocurrency sent will NOT be credited to your account.',
  'howToPayCrypto': 'How to Make USDT Payment:',
  'cryptoStep1': 'Copy the USDT wallet address shown above',
  'cryptoStep2': 'Open your crypto wallet (Trust Wallet, Binance, Coinbase, etc.) and select USDT',
  'cryptoStep3': 'Send the exact amount using TRON (TRC20) network - verify this before confirming!',
  'cryptoStep4': 'Take a screenshot of the completed transaction and send it via WhatsApp for confirmation',
  'cryptoStep5': 'Click "Submit Investment Request" to complete your investment',
  
  // Email Verification
  'verifyYourEmail': 'Verify Your Email',
  'verificationEmailSent': 'We\'ve sent a verification email to',
  'checkInbox': 'Please check your inbox and click the verification link.',
  'resendEmail': 'Resend Email',
  'emailVerified': 'Email Verified!',
  'emailVerifiedDesc': 'Your email has been successfully verified. You can now access all features.',
  'continueToApp': 'Continue to App',
  'verificationFailed': 'Verification Failed',
  'verificationFailedDesc': 'The verification link may be expired or invalid. Please request a new one.',
  'requestNewLink': 'Request New Link',
  
  // Transaction History
  'transactionHistory': 'Transaction History',
  'allTransactions': 'All Transactions',
  'deposits': 'Deposits',
  'withdrawals': 'Withdrawals',
  'noTransactions': 'No transactions found',
  'transactionDate': 'Date',
  'transactionType': 'Type',
  'transactionAmount': 'Amount',
  'transactionStatus': 'Status',
  'deposit': 'Deposit',
  'withdrawal': 'Withdrawal',
  
  // Profile Completion
  'completeProfile': 'Complete Your Profile',
  'profileCompletionDesc': 'Please complete your profile to access all features',
  'saveProfile': 'Save Profile',
  
  // Account Settings
  'accountSettings': 'Account Settings',
  'changeEmail': 'Change Email',
  'currentEmail': 'Current Email',
  'newEmail': 'New Email',
  'updateEmail': 'Update Email',
  'emailUpdated': 'Email updated successfully',
  
  // Referral
  'yourReferralCode': 'Your Referral Code',
  'referralBonus': 'Referral Bonus',
  'referFriends': 'Refer Friends',
  'referralDesc': 'Share your referral code with friends and earn bonuses when they invest!',
  'totalReferrals': 'Total Referrals',
  'referralEarnings': 'Referral Earnings',
  'copyReferralCode': 'Copy Referral Code',
  'referralCodeCopied': 'Referral code copied!',
  
  // Live Activity
  'liveActivity': 'Live Activity',
  'recentInvestments': 'Recent Investments',
  'globalInvestors': 'Global Investors',
  'activeNow': 'Active Now',
  
  // WhatsApp Support
  'whatsappDefaultMessage': 'Hello! I would like to learn more about Tesla stocks.',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to English - clear any old language preferences
  const [language, setLanguageState] = useState<Language>('en');
  const [dbTranslations, setDbTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch translations from database for SEO-optimized languages
  const fetchTranslations = useCallback(async (lang: Language) => {
    if (!SEO_LANGUAGES.includes(lang)) {
      setDbTranslations({});
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language', lang);

      if (error) {
        console.error('Error fetching translations:', error);
        setDbTranslations({});
      } else if (data && data.length > 0) {
        const translationMap: Record<string, string> = {};
        data.forEach(item => {
          translationMap[item.key] = item.value;
        });
        setDbTranslations(translationMap);
      } else {
        setDbTranslations({});
      }
    } catch (err) {
      console.error('Error fetching translations:', err);
      setDbTranslations({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set language and update URL for SEO
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
    
    // Update document language attribute
    document.documentElement.lang = lang;
  }, []);

  // Fetch default language on mount
  useEffect(() => {
    const fetchDefaultLanguage = async () => {
      const saved = localStorage.getItem('app-language');
      if (!saved) {
        try {
          const { data, error } = await supabase
            .from('admin_settings')
            .select('setting_value')
            .eq('setting_key', 'default_language')
            .maybeSingle();
          
          if (data && !error) {
            const defaultLang = (data.setting_value as { language: string })?.language;
            if (defaultLang) {
              setLanguage(defaultLang as Language);
            }
          }
        } catch (err) {
          console.error('Error fetching default language:', err);
        }
      }
    };
    
    fetchDefaultLanguage();
  }, [setLanguage]);

  // Fetch translations when language changes
  useEffect(() => {
    fetchTranslations(language);
  }, [language, fetchTranslations]);

  // Translation function - prioritizes database translations for SEO languages
  const t = useCallback((key: string): string => {
    // For SEO languages, use database translations first
    if (SEO_LANGUAGES.includes(language) && dbTranslations[key]) {
      return dbTranslations[key];
    }
    
    // Fallback to English translations
    return englishTranslations[key] || key;
  }, [language, dbTranslations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
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

export { SEO_LANGUAGES };
