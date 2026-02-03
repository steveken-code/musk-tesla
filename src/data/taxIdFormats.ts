// Country-specific Tax ID configurations and validation

export interface TaxIdConfig {
  label: string;
  labelLocal?: string;
  format: string;
  placeholder: string;
  regex: RegExp;
  maxLength?: number;
}

export interface AccountConfig {
  type: 'card' | 'iban' | 'routing_account' | 'sort_account' | 'bank_account';
  label: string;
  format: string;
  placeholder: string;
  length?: number;
  routingLength?: number;
  accountLength?: string;
  prefix?: string;
}

export const getTaxIdConfig = (countryCode: string): TaxIdConfig => {
  const configs: Record<string, TaxIdConfig> = {
    RU: { 
      label: 'TIN / ИНН', 
      labelLocal: 'ИНН',
      format: '10-12 digits', 
      placeholder: '7712345678',
      regex: /^\d{10,12}$/,
      maxLength: 12
    },
    US: { 
      label: 'SSN', 
      format: 'XXX-XX-XXXX (9 digits)', 
      placeholder: '123-45-6789',
      regex: /^\d{3}-?\d{2}-?\d{4}$/,
      maxLength: 11
    },
    DE: { 
      label: 'Steuer-ID', 
      format: '11 digits', 
      placeholder: '12345678901',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    GB: { 
      label: 'NI Number', 
      format: 'XX 00 00 00 X', 
      placeholder: 'AB 12 34 56 C',
      regex: /^[A-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]$/i,
      maxLength: 13
    },
    FR: { 
      label: 'NIF', 
      format: '13 digits', 
      placeholder: '1234567890123',
      regex: /^\d{13}$/,
      maxLength: 13
    },
    ES: { 
      label: 'NIF/NIE', 
      format: '8 digits + letter', 
      placeholder: '12345678A',
      regex: /^[XYZ]?\d{7,8}[A-Z]$/i,
      maxLength: 9
    },
    IT: { 
      label: 'Codice Fiscale', 
      format: '16 alphanumeric characters', 
      placeholder: 'RSSMRA85T10A562S',
      regex: /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i,
      maxLength: 16
    },
    CA: { 
      label: 'SIN', 
      format: '9 digits', 
      placeholder: '123-456-789',
      regex: /^\d{3}-?\d{3}-?\d{3}$/,
      maxLength: 11
    },
    AU: { 
      label: 'TFN', 
      format: '8-9 digits', 
      placeholder: '123456789',
      regex: /^\d{8,9}$/,
      maxLength: 9
    },
    NL: { 
      label: 'BSN', 
      format: '8-9 digits', 
      placeholder: '123456789',
      regex: /^\d{8,9}$/,
      maxLength: 9
    },
    BE: { 
      label: 'National Number', 
      format: '11 digits', 
      placeholder: '12.34.56-789.01',
      regex: /^[\d.]{11,15}$/,
      maxLength: 15
    },
    AT: { 
      label: 'Tax Number', 
      format: '9 digits', 
      placeholder: '123456789',
      regex: /^\d{9}$/,
      maxLength: 9
    },
    CH: { 
      label: 'AHV/AVS', 
      format: '13 digits', 
      placeholder: '756.1234.5678.97',
      regex: /^756\.?\d{4}\.?\d{4}\.?\d{2}$/,
      maxLength: 16
    },
    PL: { 
      label: 'PESEL', 
      format: '11 digits', 
      placeholder: '12345678901',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    SE: { 
      label: 'Personnummer', 
      format: '10-12 digits', 
      placeholder: '19850101-1234',
      regex: /^\d{8,12}[-]?\d{0,4}$/,
      maxLength: 13
    },
    NO: { 
      label: 'Fødselsnummer', 
      format: '11 digits', 
      placeholder: '01019012345',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    DK: { 
      label: 'CPR', 
      format: '10 digits', 
      placeholder: '0101901234',
      regex: /^\d{10}$/,
      maxLength: 10
    },
    FI: { 
      label: 'HETU', 
      format: '11 characters', 
      placeholder: '010190-1234',
      regex: /^\d{6}[-+A]\d{3}[0-9A-Z]$/,
      maxLength: 11
    },
    PT: { 
      label: 'NIF', 
      format: '9 digits', 
      placeholder: '123456789',
      regex: /^\d{9}$/,
      maxLength: 9
    },
    CZ: { 
      label: 'Rodné číslo', 
      format: '9-10 digits', 
      placeholder: '8501011234',
      regex: /^\d{9,10}$/,
      maxLength: 10
    },
    SK: { 
      label: 'Rodné číslo', 
      format: '10 digits', 
      placeholder: '8501011234',
      regex: /^\d{10}$/,
      maxLength: 10
    },
    HU: { 
      label: 'Adóazonosító jel', 
      format: '10 digits', 
      placeholder: '1234567890',
      regex: /^\d{10}$/,
      maxLength: 10
    },
    RO: { 
      label: 'CNP', 
      format: '13 digits', 
      placeholder: '1234567890123',
      regex: /^\d{13}$/,
      maxLength: 13
    },
    BG: { 
      label: 'EGN', 
      format: '10 digits', 
      placeholder: '1234567890',
      regex: /^\d{10}$/,
      maxLength: 10
    },
    HR: { 
      label: 'OIB', 
      format: '11 digits', 
      placeholder: '12345678901',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    SI: { 
      label: 'EMŠO', 
      format: '13 digits', 
      placeholder: '1234567890123',
      regex: /^\d{13}$/,
      maxLength: 13
    },
    GR: { 
      label: 'AFM', 
      format: '9 digits', 
      placeholder: '123456789',
      regex: /^\d{9}$/,
      maxLength: 9
    },
    IE: { 
      label: 'PPS Number', 
      format: '7 digits + 1-2 letters', 
      placeholder: '1234567TW',
      regex: /^\d{7}[A-Z]{1,2}$/,
      maxLength: 9
    },
    LU: { 
      label: 'National ID', 
      format: '13 digits', 
      placeholder: '1234567890123',
      regex: /^\d{13}$/,
      maxLength: 13
    },
    MT: { 
      label: 'ID Card Number', 
      format: '7-8 alphanumeric', 
      placeholder: '12345M',
      regex: /^[0-9A-Z]{7,8}$/,
      maxLength: 8
    },
    CY: { 
      label: 'TIC', 
      format: '8 alphanumeric', 
      placeholder: '12345678',
      regex: /^[0-9A-Z]{8}$/,
      maxLength: 8
    },
    EE: { 
      label: 'Isikukood', 
      format: '11 digits', 
      placeholder: '38501010001',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    LV: { 
      label: 'Personas kods', 
      format: '11 digits', 
      placeholder: '12345612345',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    LT: { 
      label: 'Asmens kodas', 
      format: '11 digits', 
      placeholder: '38501010001',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    UA: { 
      label: 'РНОКПП', 
      format: '10 digits', 
      placeholder: '1234567890',
      regex: /^\d{10}$/,
      maxLength: 10
    },
    BY: { 
      label: 'Identification Number', 
      format: '14 characters', 
      placeholder: '1234567A123AB1',
      regex: /^[0-9A-Z]{14}$/i,
      maxLength: 14
    },
    IN: { 
      label: 'PAN', 
      format: 'AAAAA0000A', 
      placeholder: 'ABCDE1234F',
      regex: /^[A-Z]{5}\d{4}[A-Z]$/,
      maxLength: 10
    },
    CN: { 
      label: '身份证号', 
      format: '18 digits', 
      placeholder: '110101199001011234',
      regex: /^\d{17}[\dX]$/,
      maxLength: 18
    },
    JP: { 
      label: 'My Number', 
      format: '12 digits', 
      placeholder: '123456789012',
      regex: /^\d{12}$/,
      maxLength: 12
    },
    KR: { 
      label: '주민등록번호', 
      format: '13 digits', 
      placeholder: '850101-1234567',
      regex: /^\d{6}-?\d{7}$/,
      maxLength: 14
    },
    SG: { 
      label: 'NRIC/FIN', 
      format: '9 alphanumeric', 
      placeholder: 'S1234567D',
      regex: /^[STFG]\d{7}[A-Z]$/,
      maxLength: 9
    },
    HK: { 
      label: 'HKID', 
      format: '8-9 alphanumeric', 
      placeholder: 'A1234567',
      regex: /^[A-Z]{1,2}\d{6,7}\([0-9A]\)$/i,
      maxLength: 12
    },
    AE: { 
      label: 'Emirates ID', 
      format: '15 digits', 
      placeholder: '784-1234-1234567-1',
      regex: /^\d{3}-?\d{4}-?\d{7}-?\d$/,
      maxLength: 18
    },
    SA: { 
      label: 'National ID', 
      format: '10 digits', 
      placeholder: '1234567890',
      regex: /^\d{10}$/,
      maxLength: 10
    },
    IL: { 
      label: 'Teudat Zehut', 
      format: '9 digits', 
      placeholder: '123456789',
      regex: /^\d{9}$/,
      maxLength: 9
    },
    TR: { 
      label: 'T.C. Kimlik No', 
      format: '11 digits', 
      placeholder: '12345678901',
      regex: /^\d{11}$/,
      maxLength: 11
    },
    BR: { 
      label: 'CPF', 
      format: '11 digits', 
      placeholder: '123.456.789-00',
      regex: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
      maxLength: 14
    },
    MX: { 
      label: 'CURP', 
      format: '18 alphanumeric', 
      placeholder: 'XXXX000000XXXXXX00',
      regex: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
      maxLength: 18
    },
    ZA: { 
      label: 'ID Number', 
      format: '13 digits', 
      placeholder: '8501015009087',
      regex: /^\d{13}$/,
      maxLength: 13
    },
    NZ: { 
      label: 'IRD Number', 
      format: '8-9 digits', 
      placeholder: '12-345-678',
      regex: /^\d{2}-?\d{3}-?\d{3}$/,
      maxLength: 10
    },
  };
  
  return configs[countryCode.toUpperCase()] || { 
    label: 'Tax ID', 
    format: 'Country-specific', 
    placeholder: 'Enter your tax ID',
    regex: /^.{1,50}$/,
    maxLength: 50
  };
};

export const getAccountConfig = (countryCode: string): AccountConfig => {
  const upperCode = countryCode.toUpperCase();
  
  // Russia - Card number only
  if (upperCode === 'RU') {
    return { 
      type: 'card', 
      label: 'Card Number', 
      format: '16 digits',
      placeholder: '2200 0000 0000 0000',
      length: 16 
    };
  }
  
  // USA - Routing + Account
  if (upperCode === 'US') {
    return { 
      type: 'routing_account', 
      label: 'Account Number',
      format: 'Routing (9 digits) + Account (8-12 digits)',
      placeholder: '123456789',
      routingLength: 9, 
      accountLength: '8-12' 
    };
  }
  
  // UK - Sort Code + Account
  if (upperCode === 'GB' || upperCode === 'UK') {
    return { 
      type: 'sort_account', 
      label: 'Account Number',
      format: 'Sort Code (6 digits) + Account (8 digits)',
      placeholder: '12345678',
      length: 8
    };
  }
  
  // IBAN countries (Europe + others)
  const ibanCountries: Record<string, { prefix: string; length: number }> = {
    DE: { prefix: 'DE', length: 22 },
    FR: { prefix: 'FR', length: 27 },
    ES: { prefix: 'ES', length: 24 },
    IT: { prefix: 'IT', length: 27 },
    NL: { prefix: 'NL', length: 18 },
    BE: { prefix: 'BE', length: 16 },
    AT: { prefix: 'AT', length: 20 },
    CH: { prefix: 'CH', length: 21 },
    PL: { prefix: 'PL', length: 28 },
    PT: { prefix: 'PT', length: 25 },
    SE: { prefix: 'SE', length: 24 },
    NO: { prefix: 'NO', length: 15 },
    DK: { prefix: 'DK', length: 18 },
    FI: { prefix: 'FI', length: 18 },
    IE: { prefix: 'IE', length: 22 },
    LU: { prefix: 'LU', length: 20 },
    GR: { prefix: 'GR', length: 27 },
    CZ: { prefix: 'CZ', length: 24 },
    SK: { prefix: 'SK', length: 24 },
    HU: { prefix: 'HU', length: 28 },
    RO: { prefix: 'RO', length: 24 },
    BG: { prefix: 'BG', length: 22 },
    HR: { prefix: 'HR', length: 21 },
    SI: { prefix: 'SI', length: 19 },
    EE: { prefix: 'EE', length: 20 },
    LV: { prefix: 'LV', length: 21 },
    LT: { prefix: 'LT', length: 20 },
    CY: { prefix: 'CY', length: 28 },
    MT: { prefix: 'MT', length: 31 },
    UA: { prefix: 'UA', length: 29 },
    BY: { prefix: 'BY', length: 28 },
  };
  
  if (ibanCountries[upperCode]) {
    const config = ibanCountries[upperCode];
    return { 
      type: 'iban', 
      label: 'IBAN',
      format: `${config.length} characters starting with ${config.prefix}`,
      placeholder: `${config.prefix}00 0000 0000 0000 0000 00`,
      prefix: config.prefix, 
      length: config.length 
    };
  }
  
  // Default - Generic bank account
  return { 
    type: 'bank_account', 
    label: 'Account Number',
    format: 'Bank account number',
    placeholder: 'Enter account number'
  };
};

// Get all supported countries with their names
export const getCountryList = (): { code: string; name: string }[] => [
  // Europe
  { code: 'AL', name: 'Albania' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AT', name: 'Austria' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'XK', name: 'Kosovo' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SM', name: 'San Marino' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'VA', name: 'Vatican City' },
  // Americas
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'BO', name: 'Bolivia' },
  // Asia
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'PH', name: 'Philippines' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  // Oceania
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'FJ', name: 'Fiji' },
  // Africa
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'TZ', name: 'Tanzania' },
  // Middle East
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turkey' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
];

// Currency list
export const getCurrencyList = (): { code: string; name: string; symbol: string }[] => [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
];
