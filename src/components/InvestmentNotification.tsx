import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Comprehensive list of users from countries around the world
const allUsers = [
  // North America
  { name: "Liam", country: "United States", currency: "USD" },
  { name: "Emma", country: "United States", currency: "USD" },
  { name: "James", country: "United States", currency: "USD" },
  { name: "Olivia", country: "Canada", currency: "CAD" },
  { name: "William", country: "Canada", currency: "CAD" },
  { name: "Sofia", country: "Mexico", currency: "MXN" },
  { name: "Diego", country: "Mexico", currency: "MXN" },
  
  // Europe
  { name: "Noah", country: "United Kingdom", currency: "GBP" },
  { name: "Charlotte", country: "United Kingdom", currency: "GBP" },
  { name: "Oliver", country: "United Kingdom", currency: "GBP" },
  { name: "Klaus", country: "Germany", currency: "EUR" },
  { name: "Hannah", country: "Germany", currency: "EUR" },
  { name: "Maximilian", country: "Germany", currency: "EUR" },
  { name: "Mia", country: "France", currency: "EUR" },
  { name: "Louis", country: "France", currency: "EUR" },
  { name: "Camille", country: "France", currency: "EUR" },
  { name: "Pietro", country: "Italy", currency: "EUR" },
  { name: "Giulia", country: "Italy", currency: "EUR" },
  { name: "Marco", country: "Italy", currency: "EUR" },
  { name: "Maria", country: "Spain", currency: "EUR" },
  { name: "Carlos", country: "Spain", currency: "EUR" },
  { name: "Isabella", country: "Spain", currency: "EUR" },
  { name: "Anna", country: "Sweden", currency: "SEK" },
  { name: "Erik", country: "Sweden", currency: "SEK" },
  { name: "Lars", country: "Norway", currency: "NOK" },
  { name: "Ingrid", country: "Norway", currency: "NOK" },
  { name: "Magnus", country: "Norway", currency: "NOK" },
  { name: "Jan", country: "Netherlands", currency: "EUR" },
  { name: "Sophie", country: "Netherlands", currency: "EUR" },
  { name: "Daan", country: "Netherlands", currency: "EUR" },
  { name: "Jakub", country: "Poland", currency: "PLN" },
  { name: "Zuzanna", country: "Poland", currency: "PLN" },
  { name: "Kacper", country: "Poland", currency: "PLN" },
  { name: "Bence", country: "Hungary", currency: "HUF" },
  { name: "Eszter", country: "Hungary", currency: "HUF" },
  { name: "Levente", country: "Hungary", currency: "HUF" },
  { name: "Dmitri", country: "Russia", currency: "RUB" },
  { name: "Anastasia", country: "Russia", currency: "RUB" },
  { name: "Mikhail", country: "Russia", currency: "RUB" },
  { name: "Olga", country: "Russia", currency: "RUB" },
  { name: "Felix", country: "Switzerland", currency: "CHF" },
  { name: "Elena", country: "Switzerland", currency: "CHF" },
  { name: "Lukas", country: "Austria", currency: "EUR" },
  { name: "Nina", country: "Austria", currency: "EUR" },
  { name: "Andrei", country: "Romania", currency: "RON" },
  { name: "Ioana", country: "Romania", currency: "RON" },
  { name: "Petr", country: "Czech Republic", currency: "CZK" },
  { name: "Tereza", country: "Czech Republic", currency: "CZK" },
  { name: "Marios", country: "Greece", currency: "EUR" },
  { name: "Eleni", country: "Greece", currency: "EUR" },
  { name: "Joao", country: "Portugal", currency: "EUR" },
  { name: "Ines", country: "Portugal", currency: "EUR" },
  { name: "Luka", country: "Croatia", currency: "EUR" },
  { name: "Ivana", country: "Croatia", currency: "EUR" },
  { name: "Mathias", country: "Denmark", currency: "DKK" },
  { name: "Freja", country: "Denmark", currency: "DKK" },
  { name: "Eero", country: "Finland", currency: "EUR" },
  { name: "Aino", country: "Finland", currency: "EUR" },
  { name: "Liam", country: "Ireland", currency: "EUR" },
  { name: "Aoife", country: "Ireland", currency: "EUR" },
  { name: "Pieter", country: "Belgium", currency: "EUR" },
  { name: "Emma", country: "Belgium", currency: "EUR" },
  { name: "Viktor", country: "Ukraine", currency: "UAH" },
  { name: "Olena", country: "Ukraine", currency: "UAH" },
  { name: "Marko", country: "Serbia", currency: "RSD" },
  { name: "Milica", country: "Serbia", currency: "RSD" },
  { name: "Georgi", country: "Bulgaria", currency: "BGN" },
  { name: "Ivana", country: "Bulgaria", currency: "BGN" },
  
  // Middle East
  { name: "Ahmed", country: "United Arab Emirates", currency: "AED" },
  { name: "Fatima", country: "United Arab Emirates", currency: "AED" },
  { name: "Khalid", country: "United Arab Emirates", currency: "AED" },
  { name: "Omar", country: "Saudi Arabia", currency: "SAR" },
  { name: "Noura", country: "Saudi Arabia", currency: "SAR" },
  { name: "Abdullah", country: "Saudi Arabia", currency: "SAR" },
  { name: "Mohammad", country: "Kuwait", currency: "KWD" },
  { name: "Sara", country: "Kuwait", currency: "KWD" },
  { name: "Yousef", country: "Kuwait", currency: "KWD" },
  { name: "Ali", country: "Qatar", currency: "QAR" },
  { name: "Mariam", country: "Qatar", currency: "QAR" },
  { name: "Hassan", country: "Bahrain", currency: "BHD" },
  { name: "Layla", country: "Bahrain", currency: "BHD" },
  { name: "Ehsan", country: "Iran", currency: "IRR" },
  { name: "Maryam", country: "Iran", currency: "IRR" },
  { name: "Yusuf", country: "Turkey", currency: "TRY" },
  { name: "Zeynep", country: "Turkey", currency: "TRY" },
  { name: "David", country: "Israel", currency: "ILS" },
  { name: "Noa", country: "Israel", currency: "ILS" },
  { name: "Sami", country: "Lebanon", currency: "LBP" },
  { name: "Rania", country: "Jordan", currency: "JOD" },
  
  // Asia
  { name: "Hiroshi", country: "Japan", currency: "JPY" },
  { name: "Yuki", country: "Japan", currency: "JPY" },
  { name: "Kenji", country: "Japan", currency: "JPY" },
  { name: "Sakura", country: "Japan", currency: "JPY" },
  { name: "Wei", country: "China", currency: "CNY" },
  { name: "Chen", country: "China", currency: "CNY" },
  { name: "Ming", country: "China", currency: "CNY" },
  { name: "Xiaoli", country: "China", currency: "CNY" },
  { name: "Ji-hoon", country: "South Korea", currency: "KRW" },
  { name: "Soo-yeon", country: "South Korea", currency: "KRW" },
  { name: "Min-jun", country: "South Korea", currency: "KRW" },
  { name: "Aarav", country: "India", currency: "INR" },
  { name: "Priya", country: "India", currency: "INR" },
  { name: "Arjun", country: "India", currency: "INR" },
  { name: "Ananya", country: "India", currency: "INR" },
  { name: "Raj", country: "India", currency: "INR" },
  { name: "Nguyen", country: "Vietnam", currency: "VND" },
  { name: "Linh", country: "Vietnam", currency: "VND" },
  { name: "Somchai", country: "Thailand", currency: "THB" },
  { name: "Ploy", country: "Thailand", currency: "THB" },
  { name: "Rizal", country: "Malaysia", currency: "MYR" },
  { name: "Aisyah", country: "Malaysia", currency: "MYR" },
  { name: "Budi", country: "Indonesia", currency: "IDR" },
  { name: "Siti", country: "Indonesia", currency: "IDR" },
  { name: "Miguel", country: "Philippines", currency: "PHP" },
  { name: "Maria", country: "Philippines", currency: "PHP" },
  { name: "Yuki", country: "Singapore", currency: "SGD" },
  { name: "Wei Lin", country: "Singapore", currency: "SGD" },
  { name: "Aung", country: "Myanmar", currency: "MMK" },
  { name: "Thiri", country: "Myanmar", currency: "MMK" },
  { name: "Rashid", country: "Pakistan", currency: "PKR" },
  { name: "Ayesha", country: "Pakistan", currency: "PKR" },
  { name: "Kamal", country: "Bangladesh", currency: "BDT" },
  { name: "Fatima", country: "Bangladesh", currency: "BDT" },
  { name: "Suresh", country: "Sri Lanka", currency: "LKR" },
  { name: "Dilini", country: "Sri Lanka", currency: "LKR" },
  { name: "Karma", country: "Nepal", currency: "NPR" },
  { name: "Sujata", country: "Nepal", currency: "NPR" },
  { name: "Dorji", country: "Bhutan", currency: "BTN" },
  { name: "Tenzin", country: "Mongolia", currency: "MNT" },
  { name: "Bolormaa", country: "Mongolia", currency: "MNT" },
  
  // Africa
  { name: "Kwame", country: "Ghana", currency: "GHS" },
  { name: "Ama", country: "Ghana", currency: "GHS" },
  { name: "Chinedu", country: "Nigeria", currency: "NGN" },
  { name: "Adaeze", country: "Nigeria", currency: "NGN" },
  { name: "Oluwaseun", country: "Nigeria", currency: "NGN" },
  { name: "Ella", country: "South Africa", currency: "ZAR" },
  { name: "Thabo", country: "South Africa", currency: "ZAR" },
  { name: "Zanele", country: "South Africa", currency: "ZAR" },
  { name: "Amara", country: "Kenya", currency: "KES" },
  { name: "Juma", country: "Kenya", currency: "KES" },
  { name: "Wanjiku", country: "Kenya", currency: "KES" },
  { name: "Tendai", country: "Zimbabwe", currency: "ZWL" },
  { name: "Rudo", country: "Zimbabwe", currency: "ZWL" },
  { name: "Fatou", country: "Senegal", currency: "XOF" },
  { name: "Moussa", country: "Senegal", currency: "XOF" },
  { name: "Amina", country: "Tanzania", currency: "TZS" },
  { name: "Baraka", country: "Tanzania", currency: "TZS" },
  { name: "Youssef", country: "Egypt", currency: "EGP" },
  { name: "Nour", country: "Egypt", currency: "EGP" },
  { name: "Kareem", country: "Morocco", currency: "MAD" },
  { name: "Amira", country: "Morocco", currency: "MAD" },
  { name: "Said", country: "Algeria", currency: "DZD" },
  { name: "Leila", country: "Tunisia", currency: "TND" },
  { name: "Musa", country: "Uganda", currency: "UGX" },
  { name: "Grace", country: "Uganda", currency: "UGX" },
  { name: "Jean", country: "Rwanda", currency: "RWF" },
  { name: "Claudine", country: "Rwanda", currency: "RWF" },
  { name: "Solomon", country: "Ethiopia", currency: "ETB" },
  { name: "Tigist", country: "Ethiopia", currency: "ETB" },
  
  // Oceania
  { name: "Jack", country: "Australia", currency: "AUD" },
  { name: "Emily", country: "Australia", currency: "AUD" },
  { name: "Lachlan", country: "Australia", currency: "AUD" },
  { name: "Chloe", country: "Australia", currency: "AUD" },
  { name: "James", country: "New Zealand", currency: "NZD" },
  { name: "Amelia", country: "New Zealand", currency: "NZD" },
  { name: "Aroha", country: "New Zealand", currency: "NZD" },
  { name: "Sione", country: "Fiji", currency: "FJD" },
  { name: "Mere", country: "Fiji", currency: "FJD" },
  { name: "Tane", country: "Papua New Guinea", currency: "PGK" },
  
  // South America
  { name: "Lucas", country: "Brazil", currency: "BRL" },
  { name: "Beatriz", country: "Brazil", currency: "BRL" },
  { name: "Gabriel", country: "Brazil", currency: "BRL" },
  { name: "Valentina", country: "Argentina", currency: "ARS" },
  { name: "Mateo", country: "Argentina", currency: "ARS" },
  { name: "Camila", country: "Argentina", currency: "ARS" },
  { name: "Sebastian", country: "Colombia", currency: "COP" },
  { name: "Daniela", country: "Colombia", currency: "COP" },
  { name: "Alejandro", country: "Chile", currency: "CLP" },
  { name: "Isidora", country: "Chile", currency: "CLP" },
  { name: "Jose", country: "Peru", currency: "PEN" },
  { name: "Lucia", country: "Peru", currency: "PEN" },
  { name: "Carlos", country: "Venezuela", currency: "VES" },
  { name: "Maria", country: "Venezuela", currency: "VES" },
  { name: "Juan", country: "Ecuador", currency: "USD" },
  { name: "Ana", country: "Ecuador", currency: "USD" },
  { name: "Pablo", country: "Uruguay", currency: "UYU" },
  { name: "Sofia", country: "Uruguay", currency: "UYU" },
  { name: "Mario", country: "Paraguay", currency: "PYG" },
  { name: "Laura", country: "Paraguay", currency: "PYG" },
  { name: "Andres", country: "Bolivia", currency: "BOB" },
  { name: "Carla", country: "Bolivia", currency: "BOB" },
  
  // Central America & Caribbean
  { name: "Jose", country: "Costa Rica", currency: "CRC" },
  { name: "Maria", country: "Panama", currency: "PAB" },
  { name: "Roberto", country: "Guatemala", currency: "GTQ" },
  { name: "Carmen", country: "Honduras", currency: "HNL" },
  { name: "Miguel", country: "El Salvador", currency: "USD" },
  { name: "Ana", country: "Nicaragua", currency: "NIO" },
  { name: "Marcus", country: "Jamaica", currency: "JMD" },
  { name: "Keisha", country: "Jamaica", currency: "JMD" },
  { name: "Jean-Pierre", country: "Haiti", currency: "HTG" },
  { name: "Marie", country: "Haiti", currency: "HTG" },
  { name: "Rafael", country: "Dominican Republic", currency: "DOP" },
  { name: "Carolina", country: "Dominican Republic", currency: "DOP" },
  { name: "Ricardo", country: "Puerto Rico", currency: "USD" },
  { name: "Isabel", country: "Cuba", currency: "CUP" },
  { name: "Andre", country: "Trinidad and Tobago", currency: "TTD" },
  { name: "Priya", country: "Trinidad and Tobago", currency: "TTD" },
  { name: "Damien", country: "Barbados", currency: "BBD" },
  { name: "Shanique", country: "Bahamas", currency: "BSD" },
];

const investmentMessages = [
  (user: typeof allUsers[0], amount: string) => `${user.name} from ${user.country} just invested ${amount}.`,
  (user: typeof allUsers[0], amount: string) => `${user.name} from ${user.country} added ${amount} to their portfolio.`,
  (user: typeof allUsers[0], amount: string) => `New investment: ${user.name} from ${user.country} deposited ${amount}.`,
  (user: typeof allUsers[0], amount: string) => `${user.name} from ${user.country} made a ${amount} investment.`,
  (user: typeof allUsers[0], amount: string) => `Portfolio boost: ${user.name} from ${user.country} invested ${amount}.`,
];

const withdrawalMessages = [
  (user: typeof allUsers[0], amount: string) => `${user.name} from ${user.country} just withdrew ${amount}.`,
  (user: typeof allUsers[0], amount: string) => `${user.name} from ${user.country} successfully received ${amount}.`,
  (user: typeof allUsers[0], amount: string) => `Payout complete: ${user.name} from ${user.country} withdrew ${amount}.`,
  (user: typeof allUsers[0], amount: string) => `${user.name} from ${user.country} cashed out ${amount}.`,
  (user: typeof allUsers[0], amount: string) => `Profit withdrawal: ${user.name} from ${user.country} received ${amount}.`,
];

// Generate realistic random amounts with varied ranges
const getRandomAmount = (currency: string): string => {
  // Different amount ranges for more variety (weighted towards higher amounts for realism)
  const ranges = [
    { min: 5000, max: 15000, weight: 15 },
    { min: 15000, max: 35000, weight: 25 },
    { min: 35000, max: 75000, weight: 30 },
    { min: 75000, max: 150000, weight: 20 },
    { min: 150000, max: 500000, weight: 8 },
    { min: 500000, max: 1000000, weight: 2 },
  ];
  
  // Weighted random selection
  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedRange = ranges[0];
  
  for (const range of ranges) {
    random -= range.weight;
    if (random <= 0) {
      selectedRange = range;
      break;
    }
  }
  
  const amount = Math.floor(Math.random() * (selectedRange.max - selectedRange.min) + selectedRange.min);
  
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
};

// Get random interval between 6-15 seconds for variety
const getRandomInterval = (): number => {
  return Math.floor(Math.random() * (15000 - 6000) + 6000);
};

const InvestmentNotification = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [isInvestment, setIsInvestment] = useState(true);
  const usedIndices = useRef<Set<number>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get a unique random user that hasn't been used recently
  const getUniqueUser = () => {
    // Reset if we've used most users
    if (usedIndices.current.size >= allUsers.length * 0.7) {
      usedIndices.current.clear();
    }
    
    let index: number;
    do {
      index = Math.floor(Math.random() * allUsers.length);
    } while (usedIndices.current.has(index));
    
    usedIndices.current.add(index);
    return allUsers[index];
  };

  useEffect(() => {
    const showNotification = () => {
      const user = getUniqueUser();
      const isInv = Math.random() > 0.35; // 65% investment, 35% withdrawal
      const amount = getRandomAmount(user.currency);

      let message = '';
      if (isInv) {
        message = investmentMessages[Math.floor(Math.random() * investmentMessages.length)](user, amount);
      } else {
        message = withdrawalMessages[Math.floor(Math.random() * withdrawalMessages.length)](user, amount);
      }

      setIsInvestment(isInv);
      setNotification(message);

      // Hide notification after 4-6 seconds (random)
      const hideDelay = Math.floor(Math.random() * (6000 - 4000) + 4000);
      timeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, hideDelay);
    };

    // Show first notification after a short delay
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 2000);

    // Schedule next notifications with varying intervals
    const scheduleNext = () => {
      intervalRef.current = setTimeout(() => {
        showNotification();
        scheduleNext();
      }, getRandomInterval());
    };
    
    // Start the scheduling after initial notification
    setTimeout(scheduleNext, 2000);

    return () => {
      clearTimeout(initialDelay);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-5 left-5 z-50 max-w-xs sm:max-w-sm"
        >
          <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isInvestment 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {isInvestment ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium leading-relaxed">
                  {notification}
                </p>
                <p className="text-white/50 text-xs mt-1">Just now</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvestmentNotification;
