import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const users = [
  { name: "Liam", country: "United States", currency: "USD" },
  { name: "Olivia", country: "Canada", currency: "CAD" },
  { name: "Noah", country: "United Kingdom", currency: "GBP" },
  { name: "Emma", country: "Australia", currency: "AUD" },
  { name: "Aarav", country: "India", currency: "INR" },
  { name: "Sofia", country: "Germany", currency: "EUR" },
  { name: "Lucas", country: "Brazil", currency: "BRL" },
  { name: "Ella", country: "South Africa", currency: "ZAR" },
  { name: "Mateo", country: "Mexico", currency: "MXN" },
  { name: "Mia", country: "France", currency: "EUR" },
  { name: "Hiroshi", country: "Japan", currency: "JPY" },
  { name: "Chen", country: "China", currency: "CNY" },
  { name: "Ahmed", country: "United Arab Emirates", currency: "AED" },
  { name: "Fatima", country: "Saudi Arabia", currency: "SAR" },
  { name: "Klaus", country: "Switzerland", currency: "CHF" },
  { name: "Anna", country: "Sweden", currency: "SEK" },
  { name: "Pietro", country: "Italy", currency: "EUR" },
  { name: "Maria", country: "Spain", currency: "EUR" },
  { name: "Yuki", country: "Singapore", currency: "SGD" },
  { name: "James", country: "New Zealand", currency: "NZD" },
];

const investmentMessages = [
  (user: typeof users[0], amount: string) => `${user.name} from ${user.country} just invested ${amount}.`,
  (user: typeof users[0], amount: string) => `${user.name} from ${user.country} added ${amount} to their portfolio.`,
  (user: typeof users[0], amount: string) => `New investment: ${user.name} from ${user.country} deposited ${amount}.`,
];

const withdrawalMessages = [
  (user: typeof users[0], amount: string) => `${user.name} from ${user.country} just withdrew ${amount}.`,
  (user: typeof users[0], amount: string) => `${user.name} from ${user.country} successfully received ${amount}.`,
  (user: typeof users[0], amount: string) => `Payout complete: ${user.name} from ${user.country} withdrew ${amount}.`,
];

const getRandomAmount = (currency: string): string => {
  const amount = Math.floor(Math.random() * (50000 - 10000) + 10000);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

const InvestmentNotification = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [isInvestment, setIsInvestment] = useState(true);

  useEffect(() => {
    const showNotification = () => {
      const user = users[Math.floor(Math.random() * users.length)];
      const isInv = Math.random() > 0.4; // 60% investment, 40% withdrawal
      const amount = getRandomAmount(user.currency);

      let message = '';
      if (isInv) {
        message = investmentMessages[Math.floor(Math.random() * investmentMessages.length)](user, amount);
      } else {
        message = withdrawalMessages[Math.floor(Math.random() * withdrawalMessages.length)](user, amount);
      }

      setIsInvestment(isInv);
      setNotification(message);

      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    };

    // Show first notification immediately
    showNotification();

    // Show notification every 10 seconds
    const interval = setInterval(showNotification, 10000);

    return () => clearInterval(interval);
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
