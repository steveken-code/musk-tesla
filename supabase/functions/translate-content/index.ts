import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Supported languages for translation (Global Top 10)
const SUPPORTED_LANGUAGES = [
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
];

// All translation keys from the English source (extracted from LanguageContext)
const ENGLISH_TRANSLATIONS: Record<string, string> = {
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
  'newPassword': 'New Password',
  'confirmPassword': 'Confirm Password',
  'passwordChanged': 'Password changed successfully!',
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
  'heroSubtitle': 'Trade and track Tesla stocks in real-time. Join thousands of investors capitalizing on Tesla\'s revolutionary growth.',
  'getStarted': 'Get Started',
  'learnMore': 'Learn More',
  
  // Language
  'language': 'Language',
  
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
  
  // Features
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
  
  // FAQ
  'support': 'Support',
  'faqTitle': 'Frequently Asked',
  'faqTitleHighlight': 'Questions',
  'faqSubtitle': 'Got questions? We\'ve got answers. Find everything you need to know about investing with us.',
  'faqQuestion1': 'Is this the real Tesla stock?',
  'faqAnswer1': 'Yes, we provide access to genuine Tesla (TSLA) stock investments through regulated and licensed financial partners.',
  'faqQuestion2': 'How secure are my investments?',
  'faqAnswer2': 'Your investments are protected by bank-level SSL encryption and stored in secure, regulated accounts.',
  'faqQuestion3': 'How do I withdraw my profits?',
  'faqAnswer3': 'Withdrawing is simple! Go to your Dashboard, click on "Withdraw Funds," and follow the instructions.',
  'faqQuestion4': 'What is the minimum investment amount?',
  'faqAnswer4': 'You can start investing with as little as $100.',
  
  // Withdrawal
  'withdraw': 'Withdraw',
  'withdrawProfit': 'Withdraw Profit',
  'withdrawalAmount': 'Withdrawal Amount',
  'availableForWithdrawal': 'Available for withdrawal',
  'selectCountry': 'Select Your Country',
  'chooseCountry': 'Choose your country',
  'searchCountries': 'Search countries...',
  'selectMethod': 'Select Withdrawal Method',
  'bankCard': 'Bank Card',
  'cryptoPayment': 'Cryptocurrency',
  'enterPaymentDetails': 'Enter Payment Details',
  'amount': 'Amount',
  'method': 'Method',
  'reviewWithdrawal': 'Review & Submit',
  'submitWithdrawal': 'Submit Withdrawal Request',
  'next': 'Next',
  'back': 'Back',
  'contactSupport': 'Contact Support',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { targetLanguage, keys } = await req.json();

    // If specific keys provided, use those. Otherwise use all keys
    const keysToTranslate = keys && keys.length > 0 
      ? keys 
      : Object.keys(ENGLISH_TRANSLATIONS);

    // Find the language info
    const languageInfo = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
    if (!languageInfo) {
      throw new Error(`Unsupported language: ${targetLanguage}. Supported: ${SUPPORTED_LANGUAGES.map(l => l.code).join(', ')}`);
    }

    console.log(`Starting translation to ${languageInfo.name} (${targetLanguage}) for ${keysToTranslate.length} keys`);

    // Check which keys already exist
    const { data: existingTranslations } = await supabase
      .from('translations')
      .select('key')
      .eq('language', targetLanguage);

    const existingKeys = new Set(existingTranslations?.map(t => t.key) || []);
    const keysToActuallyTranslate = keysToTranslate.filter((key: string) => !existingKeys.has(key));

    if (keysToActuallyTranslate.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: `All ${keysToTranslate.length} keys already translated to ${languageInfo.name}`,
        translated: 0,
        skipped: keysToTranslate.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare content for translation (batch in chunks of 30 to avoid token limits)
    const BATCH_SIZE = 30;
    const translations: Array<{ key: string; language: string; value: string }> = [];

    for (let i = 0; i < keysToActuallyTranslate.length; i += BATCH_SIZE) {
      const batch = keysToActuallyTranslate.slice(i, i + BATCH_SIZE);
      const contentToTranslate = batch.map((key: string) => ({
        key,
        text: ENGLISH_TRANSLATIONS[key] || key
      }));

      console.log(`Translating batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} keys`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following English texts to ${languageInfo.name}. 
              
IMPORTANT RULES:
- Maintain the same tone and formality level
- Keep technical terms (like "Tesla", "TSLA", "USD") unchanged
- Keep placeholder symbols like "$" and numbers unchanged
- Return ONLY a valid JSON object with the translations
- The response must be a JSON object where keys are the original keys and values are the translated texts
- Do NOT add any markdown formatting, code blocks, or explanations
- Just return the raw JSON object`
            },
            {
              role: 'user',
              content: `Translate these texts to ${languageInfo.name}. Return as JSON object:\n\n${JSON.stringify(contentToTranslate, null, 2)}`
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI translation failed: ${response.status}`, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Payment required. Please add credits to continue.');
        }
        throw new Error(`AI translation failed: ${response.status}`);
      }

      const aiResponse = await response.json();
      const translatedContent = aiResponse.choices?.[0]?.message?.content;

      if (!translatedContent) {
        console.error('No content in AI response');
        continue;
      }

      // Parse the translated content
      try {
        // Clean the response - remove markdown code blocks if present
        let cleanedContent = translatedContent.trim();
        if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
        }
        
        const parsed = JSON.parse(cleanedContent);
        
        for (const item of contentToTranslate) {
          const translatedText = parsed[item.key] || item.text;
          translations.push({
            key: item.key,
            language: targetLanguage,
            value: translatedText
          });
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError, translatedContent);
        // Fallback: use original text
        for (const item of contentToTranslate) {
          translations.push({
            key: item.key,
            language: targetLanguage,
            value: item.text
          });
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < keysToActuallyTranslate.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Insert translations into database
    if (translations.length > 0) {
      const { error: insertError } = await supabase
        .from('translations')
        .upsert(translations, { 
          onConflict: 'key,language',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('Failed to insert translations:', insertError);
        throw new Error(`Failed to save translations: ${insertError.message}`);
      }
    }

    console.log(`Successfully translated ${translations.length} keys to ${languageInfo.name}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Translated ${translations.length} keys to ${languageInfo.name}`,
      translated: translations.length,
      skipped: existingKeys.size,
      language: targetLanguage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
