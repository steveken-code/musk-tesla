import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Comprehensive list of users from countries around the world with authentic names and flags
const allUsers = [
  // United States
  { name: "Liam", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Olivia", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Noah", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Emma", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "James", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Charlotte", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Benjamin", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Sophia", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "William", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Isabella", country: "United States", currency: "USD", flag: "🇺🇸" },
  
  // Russia
  { name: "Dmitri", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Anastasia", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Mikhail", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Olga", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Sergei", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Natalia", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Ekaterina", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Alexei", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Yulia", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Vladimir", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  
  // Germany
  { name: "Lukas", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Anna", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Maximilian", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Sophie", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Felix", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Marie", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Paul", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Emilia", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Leon", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Hannah", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  
  // United Kingdom
  { name: "Oliver", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Amelia", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "George", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Grace", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Harry", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Freya", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Thomas", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Lily", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  
  // France
  { name: "Gabriel", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Léa", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Louis", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Chloé", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Raphaël", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Manon", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Jules", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Camille", country: "France", currency: "EUR", flag: "🇫🇷" },
  
  // Hungary
  { name: "Bence", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Eszter", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Levente", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Zsófia", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Máté", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Petra", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Ádám", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Lilla", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  
  // Netherlands
  { name: "Daan", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Emma", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Sem", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Sophie", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Lucas", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Julia", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Levi", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Lotte", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  
  // Norway
  { name: "Lars", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Ingrid", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Magnus", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Astrid", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Eirik", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Nora", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Henrik", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Sigrid", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  
  // Poland
  { name: "Jakub", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Zuzanna", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Kacper", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Maja", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Antoni", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Lena", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Szymon", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Hanna", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  
  // Kuwait
  { name: "Mohammad", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Sara", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Yousef", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Fatima", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Abdulrahman", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Maryam", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Faisal", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Noura", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  
  // United Arab Emirates (Dubai)
  { name: "Ahmed", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Aisha", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Khalid", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Hessa", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Sultan", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Mariam", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Rashid", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Latifa", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  
  // Kenya (Authentic Kenyan Names)
  { name: "Njeri", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Wambui", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Kamau", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Achieng", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Otieno", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Wanjiku", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Ochieng", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Nyambura", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  
  // Nigeria
  { name: "Chukwuemeka", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Adaeze", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Oluwaseun", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Chidinma", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Emeka", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Ngozi", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Olumide", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Funke", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  
  // South Africa
  { name: "Thabo", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { name: "Naledi", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { name: "Sipho", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { name: "Lindiwe", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { name: "Mandla", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { name: "Thandiwe", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  
  // Japan
  { name: "Haruto", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Yui", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Sota", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Himari", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Minato", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Hana", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Riku", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Sakura", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  
  // China
  { name: "Wei", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Xiao", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Ming", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Mei", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Chen", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Ling", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Jian", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Yan", country: "China", currency: "CNY", flag: "🇨🇳" },
  
  // Australia
  { name: "Jack", country: "Australia", currency: "AUD", flag: "🇦🇺" },
  { name: "Charlotte", country: "Australia", currency: "AUD", flag: "🇦🇺" },
  { name: "William", country: "Australia", currency: "AUD", flag: "🇦🇺" },
  { name: "Mia", country: "Australia", currency: "AUD", flag: "🇦🇺" },
  { name: "Henry", country: "Australia", currency: "AUD", flag: "🇦🇺" },
  { name: "Isla", country: "Australia", currency: "AUD", flag: "🇦🇺" },
  
  // Canada
  { name: "Ethan", country: "Canada", currency: "CAD", flag: "🇨🇦" },
  { name: "Emma", country: "Canada", currency: "CAD", flag: "🇨🇦" },
  { name: "Alexander", country: "Canada", currency: "CAD", flag: "🇨🇦" },
  { name: "Olivia", country: "Canada", currency: "CAD", flag: "🇨🇦" },
  { name: "Jacob", country: "Canada", currency: "CAD", flag: "🇨🇦" },
  { name: "Sophia", country: "Canada", currency: "CAD", flag: "🇨🇦" },
  
  // Brazil
  { name: "Miguel", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { name: "Helena", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { name: "Arthur", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { name: "Alice", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { name: "Bernardo", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { name: "Valentina", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  
  // Mexico
  { name: "Santiago", country: "Mexico", currency: "MXN", flag: "🇲🇽" },
  { name: "Sofía", country: "Mexico", currency: "MXN", flag: "🇲🇽" },
  { name: "Mateo", country: "Mexico", currency: "MXN", flag: "🇲🇽" },
  { name: "Valentina", country: "Mexico", currency: "MXN", flag: "🇲🇽" },
  { name: "Sebastián", country: "Mexico", currency: "MXN", flag: "🇲🇽" },
  { name: "Regina", country: "Mexico", currency: "MXN", flag: "🇲🇽" },
  
  // India
  { name: "Aarav", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Priya", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Vivaan", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Ananya", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Aditya", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Ishita", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Arjun", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Saanvi", country: "India", currency: "INR", flag: "🇮🇳" },
  
  // Saudi Arabia
  { name: "Abdullah", country: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  { name: "Fatimah", country: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  { name: "Mohammed", country: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  { name: "Nora", country: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  { name: "Salman", country: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  { name: "Lama", country: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  
  // Italy
  { name: "Francesco", country: "Italy", currency: "EUR", flag: "🇮🇹" },
  { name: "Giulia", country: "Italy", currency: "EUR", flag: "🇮🇹" },
  { name: "Alessandro", country: "Italy", currency: "EUR", flag: "🇮🇹" },
  { name: "Sofia", country: "Italy", currency: "EUR", flag: "🇮🇹" },
  { name: "Lorenzo", country: "Italy", currency: "EUR", flag: "🇮🇹" },
  { name: "Aurora", country: "Italy", currency: "EUR", flag: "🇮🇹" },
  
  // Spain
  { name: "Hugo", country: "Spain", currency: "EUR", flag: "🇪🇸" },
  { name: "Lucía", country: "Spain", currency: "EUR", flag: "🇪🇸" },
  { name: "Martín", country: "Spain", currency: "EUR", flag: "🇪🇸" },
  { name: "María", country: "Spain", currency: "EUR", flag: "🇪🇸" },
  { name: "Pablo", country: "Spain", currency: "EUR", flag: "🇪🇸" },
  { name: "Carmen", country: "Spain", currency: "EUR", flag: "🇪🇸" },
  
  // South Korea
  { name: "Minjun", country: "South Korea", currency: "KRW", flag: "🇰🇷" },
  { name: "Seoyeon", country: "South Korea", currency: "KRW", flag: "🇰🇷" },
  { name: "Jiho", country: "South Korea", currency: "KRW", flag: "🇰🇷" },
  { name: "Soyeon", country: "South Korea", currency: "KRW", flag: "🇰🇷" },
  { name: "Junwoo", country: "South Korea", currency: "KRW", flag: "🇰🇷" },
  { name: "Jiyeon", country: "South Korea", currency: "KRW", flag: "🇰🇷" },
  
  // Turkey
  { name: "Yusuf", country: "Turkey", currency: "TRY", flag: "🇹🇷" },
  { name: "Zeynep", country: "Turkey", currency: "TRY", flag: "🇹🇷" },
  { name: "Eymen", country: "Turkey", currency: "TRY", flag: "🇹🇷" },
  { name: "Elif", country: "Turkey", currency: "TRY", flag: "🇹🇷" },
  { name: "Kerem", country: "Turkey", currency: "TRY", flag: "🇹🇷" },
  { name: "Defne", country: "Turkey", currency: "TRY", flag: "🇹🇷" },
  
  // Sweden
  { name: "Oscar", country: "Sweden", currency: "SEK", flag: "🇸🇪" },
  { name: "Maja", country: "Sweden", currency: "SEK", flag: "🇸🇪" },
  { name: "William", country: "Sweden", currency: "SEK", flag: "🇸🇪" },
  { name: "Ella", country: "Sweden", currency: "SEK", flag: "🇸🇪" },
  { name: "Liam", country: "Sweden", currency: "SEK", flag: "🇸🇪" },
  { name: "Astrid", country: "Sweden", currency: "SEK", flag: "🇸🇪" },
  
  // Switzerland
  { name: "Noah", country: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { name: "Mia", country: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { name: "Luca", country: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { name: "Emma", country: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { name: "Matteo", country: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { name: "Elena", country: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  
  // Singapore
  { name: "Ryan", country: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { name: "Chloe", country: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { name: "Ethan", country: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { name: "Sophia", country: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { name: "Lucas", country: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { name: "Charlotte", country: "Singapore", currency: "SGD", flag: "🇸🇬" },
  
  // Qatar
  { name: "Hamad", country: "Qatar", currency: "QAR", flag: "🇶🇦" },
  { name: "Shaikha", country: "Qatar", currency: "QAR", flag: "🇶🇦" },
  { name: "Khalifa", country: "Qatar", currency: "QAR", flag: "🇶🇦" },
  { name: "Mozah", country: "Qatar", currency: "QAR", flag: "🇶🇦" },
  { name: "Tamim", country: "Qatar", currency: "QAR", flag: "🇶🇦" },
  { name: "Aljazi", country: "Qatar", currency: "QAR", flag: "🇶🇦" },
  
  // Egypt
  { name: "Omar", country: "Egypt", currency: "EGP", flag: "🇪🇬" },
  { name: "Mariam", country: "Egypt", currency: "EGP", flag: "🇪🇬" },
  { name: "Youssef", country: "Egypt", currency: "EGP", flag: "🇪🇬" },
  { name: "Nour", country: "Egypt", currency: "EGP", flag: "🇪🇬" },
  { name: "Adam", country: "Egypt", currency: "EGP", flag: "🇪🇬" },
  { name: "Salma", country: "Egypt", currency: "EGP", flag: "🇪🇬" },
  
  // Thailand
  { name: "Tanawat", country: "Thailand", currency: "THB", flag: "🇹🇭" },
  { name: "Pimchanok", country: "Thailand", currency: "THB", flag: "🇹🇭" },
  { name: "Phakhin", country: "Thailand", currency: "THB", flag: "🇹🇭" },
  { name: "Siriporn", country: "Thailand", currency: "THB", flag: "🇹🇭" },
  { name: "Nattapong", country: "Thailand", currency: "THB", flag: "🇹🇭" },
  { name: "Kanokwan", country: "Thailand", currency: "THB", flag: "🇹🇭" },
  
  // Indonesia
  { name: "Budi", country: "Indonesia", currency: "IDR", flag: "🇮🇩" },
  { name: "Siti", country: "Indonesia", currency: "IDR", flag: "🇮🇩" },
  { name: "Andi", country: "Indonesia", currency: "IDR", flag: "🇮🇩" },
  { name: "Dewi", country: "Indonesia", currency: "IDR", flag: "🇮🇩" },
  { name: "Rizky", country: "Indonesia", currency: "IDR", flag: "🇮🇩" },
  { name: "Putri", country: "Indonesia", currency: "IDR", flag: "🇮🇩" },
  
  // Malaysia
  { name: "Ahmad", country: "Malaysia", currency: "MYR", flag: "🇲🇾" },
  { name: "Nur", country: "Malaysia", currency: "MYR", flag: "🇲🇾" },
  { name: "Muhammad", country: "Malaysia", currency: "MYR", flag: "🇲🇾" },
  { name: "Aisha", country: "Malaysia", currency: "MYR", flag: "🇲🇾" },
  { name: "Hafiz", country: "Malaysia", currency: "MYR", flag: "🇲🇾" },
  { name: "Fatimah", country: "Malaysia", currency: "MYR", flag: "🇲🇾" },
  
  // New Zealand
  { name: "Oliver", country: "New Zealand", currency: "NZD", flag: "🇳🇿" },
  { name: "Amelia", country: "New Zealand", currency: "NZD", flag: "🇳🇿" },
  { name: "Leo", country: "New Zealand", currency: "NZD", flag: "🇳🇿" },
  { name: "Isla", country: "New Zealand", currency: "NZD", flag: "🇳🇿" },
  { name: "Jack", country: "New Zealand", currency: "NZD", flag: "🇳🇿" },
  { name: "Charlotte", country: "New Zealand", currency: "NZD", flag: "🇳🇿" },
  
  // Ireland
  { name: "Conor", country: "Ireland", currency: "EUR", flag: "🇮🇪" },
  { name: "Aoife", country: "Ireland", currency: "EUR", flag: "🇮🇪" },
  { name: "Sean", country: "Ireland", currency: "EUR", flag: "🇮🇪" },
  { name: "Saoirse", country: "Ireland", currency: "EUR", flag: "🇮🇪" },
  { name: "Fionn", country: "Ireland", currency: "EUR", flag: "🇮🇪" },
  { name: "Caoimhe", country: "Ireland", currency: "EUR", flag: "🇮🇪" },
  
  // Austria
  { name: "Elias", country: "Austria", currency: "EUR", flag: "🇦🇹" },
  { name: "Emma", country: "Austria", currency: "EUR", flag: "🇦🇹" },
  { name: "David", country: "Austria", currency: "EUR", flag: "🇦🇹" },
  { name: "Anna", country: "Austria", currency: "EUR", flag: "🇦🇹" },
  { name: "Maximilian", country: "Austria", currency: "EUR", flag: "🇦🇹" },
  { name: "Sophie", country: "Austria", currency: "EUR", flag: "🇦🇹" },
  
  // Belgium
  { name: "Lucas", country: "Belgium", currency: "EUR", flag: "🇧🇪" },
  { name: "Marie", country: "Belgium", currency: "EUR", flag: "🇧🇪" },
  { name: "Noah", country: "Belgium", currency: "EUR", flag: "🇧🇪" },
  { name: "Emma", country: "Belgium", currency: "EUR", flag: "🇧🇪" },
  { name: "Louis", country: "Belgium", currency: "EUR", flag: "🇧🇪" },
  { name: "Louise", country: "Belgium", currency: "EUR", flag: "🇧🇪" },
  
  // Portugal
  { name: "Martim", country: "Portugal", currency: "EUR", flag: "🇵🇹" },
  { name: "Maria", country: "Portugal", currency: "EUR", flag: "🇵🇹" },
  { name: "Afonso", country: "Portugal", currency: "EUR", flag: "🇵🇹" },
  { name: "Leonor", country: "Portugal", currency: "EUR", flag: "🇵🇹" },
  { name: "Santiago", country: "Portugal", currency: "EUR", flag: "🇵🇹" },
  { name: "Beatriz", country: "Portugal", currency: "EUR", flag: "🇵🇹" },
  
  // Greece
  { name: "Georgios", country: "Greece", currency: "EUR", flag: "🇬🇷" },
  { name: "Maria", country: "Greece", currency: "EUR", flag: "🇬🇷" },
  { name: "Dimitrios", country: "Greece", currency: "EUR", flag: "🇬🇷" },
  { name: "Eleni", country: "Greece", currency: "EUR", flag: "🇬🇷" },
  { name: "Konstantinos", country: "Greece", currency: "EUR", flag: "🇬🇷" },
  { name: "Aikaterini", country: "Greece", currency: "EUR", flag: "🇬🇷" },
  
  // Czech Republic
  { name: "Jakub", country: "Czech Republic", currency: "CZK", flag: "🇨🇿" },
  { name: "Eliška", country: "Czech Republic", currency: "CZK", flag: "🇨🇿" },
  { name: "Jan", country: "Czech Republic", currency: "CZK", flag: "🇨🇿" },
  { name: "Tereza", country: "Czech Republic", currency: "CZK", flag: "🇨🇿" },
  { name: "Tomáš", country: "Czech Republic", currency: "CZK", flag: "🇨🇿" },
  { name: "Anna", country: "Czech Republic", currency: "CZK", flag: "🇨🇿" },
  
  // Denmark
  { name: "William", country: "Denmark", currency: "DKK", flag: "🇩🇰" },
  { name: "Emma", country: "Denmark", currency: "DKK", flag: "🇩🇰" },
  { name: "Noah", country: "Denmark", currency: "DKK", flag: "🇩🇰" },
  { name: "Ida", country: "Denmark", currency: "DKK", flag: "🇩🇰" },
  { name: "Oscar", country: "Denmark", currency: "DKK", flag: "🇩🇰" },
  { name: "Freja", country: "Denmark", currency: "DKK", flag: "🇩🇰" },
  
  // Finland
  { name: "Eino", country: "Finland", currency: "EUR", flag: "🇫🇮" },
  { name: "Aino", country: "Finland", currency: "EUR", flag: "🇫🇮" },
  { name: "Oliver", country: "Finland", currency: "EUR", flag: "🇫🇮" },
  { name: "Olivia", country: "Finland", currency: "EUR", flag: "🇫🇮" },
  { name: "Leo", country: "Finland", currency: "EUR", flag: "🇫🇮" },
  { name: "Helmi", country: "Finland", currency: "EUR", flag: "🇫🇮" },
  
  // Argentina
  { name: "Thiago", country: "Argentina", currency: "ARS", flag: "🇦🇷" },
  { name: "Martina", country: "Argentina", currency: "ARS", flag: "🇦🇷" },
  { name: "Mateo", country: "Argentina", currency: "ARS", flag: "🇦🇷" },
  { name: "Valentina", country: "Argentina", currency: "ARS", flag: "🇦🇷" },
  { name: "Benjamín", country: "Argentina", currency: "ARS", flag: "🇦🇷" },
  { name: "Emma", country: "Argentina", currency: "ARS", flag: "🇦🇷" },
  
  // Colombia
  { name: "Samuel", country: "Colombia", currency: "COP", flag: "🇨🇴" },
  { name: "Isabella", country: "Colombia", currency: "COP", flag: "🇨🇴" },
  { name: "Sebastián", country: "Colombia", currency: "COP", flag: "🇨🇴" },
  { name: "Mariana", country: "Colombia", currency: "COP", flag: "🇨🇴" },
  { name: "Matías", country: "Colombia", currency: "COP", flag: "🇨🇴" },
  { name: "Valeria", country: "Colombia", currency: "COP", flag: "🇨🇴" },
  
  // Chile
  { name: "Agustín", country: "Chile", currency: "CLP", flag: "🇨🇱" },
  { name: "Sofía", country: "Chile", currency: "CLP", flag: "🇨🇱" },
  { name: "Tomás", country: "Chile", currency: "CLP", flag: "🇨🇱" },
  { name: "Florencia", country: "Chile", currency: "CLP", flag: "🇨🇱" },
  { name: "Matías", country: "Chile", currency: "CLP", flag: "🇨🇱" },
  { name: "Isidora", country: "Chile", currency: "CLP", flag: "🇨🇱" },
  
  // Philippines
  { name: "Juan", country: "Philippines", currency: "PHP", flag: "🇵🇭" },
  { name: "Maria", country: "Philippines", currency: "PHP", flag: "🇵🇭" },
  { name: "Jose", country: "Philippines", currency: "PHP", flag: "🇵🇭" },
  { name: "Angela", country: "Philippines", currency: "PHP", flag: "🇵🇭" },
  { name: "Daniel", country: "Philippines", currency: "PHP", flag: "🇵🇭" },
  { name: "Patricia", country: "Philippines", currency: "PHP", flag: "🇵🇭" },
  
  // Vietnam
  { name: "Minh", country: "Vietnam", currency: "VND", flag: "🇻🇳" },
  { name: "Linh", country: "Vietnam", currency: "VND", flag: "🇻🇳" },
  { name: "Hùng", country: "Vietnam", currency: "VND", flag: "🇻🇳" },
  { name: "Lan", country: "Vietnam", currency: "VND", flag: "🇻🇳" },
  { name: "Tuấn", country: "Vietnam", currency: "VND", flag: "🇻🇳" },
  { name: "Mai", country: "Vietnam", currency: "VND", flag: "🇻🇳" },
  
  // Pakistan
  { name: "Ali", country: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  { name: "Fatima", country: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  { name: "Hassan", country: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  { name: "Zainab", country: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  { name: "Usman", country: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  { name: "Ayesha", country: "Pakistan", currency: "PKR", flag: "🇵🇰" },
  
  // Bangladesh
  { name: "Rahman", country: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  { name: "Fatema", country: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  { name: "Karim", country: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  { name: "Nasrin", country: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  { name: "Hossain", country: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  { name: "Tahmina", country: "Bangladesh", currency: "BDT", flag: "🇧🇩" },
  
  // Morocco
  { name: "Youssef", country: "Morocco", currency: "MAD", flag: "🇲🇦" },
  { name: "Fatima-Zahra", country: "Morocco", currency: "MAD", flag: "🇲🇦" },
  { name: "Amine", country: "Morocco", currency: "MAD", flag: "🇲🇦" },
  { name: "Salma", country: "Morocco", currency: "MAD", flag: "🇲🇦" },
  { name: "Adam", country: "Morocco", currency: "MAD", flag: "🇲🇦" },
  { name: "Meryem", country: "Morocco", currency: "MAD", flag: "🇲🇦" },
  
  // Ghana
  { name: "Kwame", country: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { name: "Abena", country: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { name: "Kofi", country: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { name: "Akosua", country: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { name: "Yaw", country: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { name: "Ama", country: "Ghana", currency: "GHS", flag: "🇬🇭" },
  
  // Uganda
  { name: "Musa", country: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { name: "Nakato", country: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { name: "Kato", country: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { name: "Aisha", country: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { name: "Wasswa", country: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { name: "Babirye", country: "Uganda", currency: "UGX", flag: "🇺🇬" },
  
  // Tanzania
  { name: "Juma", country: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { name: "Amina", country: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { name: "Hassan", country: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { name: "Zainab", country: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { name: "Omari", country: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { name: "Rehema", country: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  
  // Ukraine
  { name: "Oleksandr", country: "Ukraine", currency: "UAH", flag: "🇺🇦" },
  { name: "Anastasiia", country: "Ukraine", currency: "UAH", flag: "🇺🇦" },
  { name: "Dmytro", country: "Ukraine", currency: "UAH", flag: "🇺🇦" },
  { name: "Viktoriia", country: "Ukraine", currency: "UAH", flag: "🇺🇦" },
  { name: "Maksym", country: "Ukraine", currency: "UAH", flag: "🇺🇦" },
  { name: "Yuliia", country: "Ukraine", currency: "UAH", flag: "🇺🇦" },
  
  // Romania
  { name: "Andrei", country: "Romania", currency: "RON", flag: "🇷🇴" },
  { name: "Maria", country: "Romania", currency: "RON", flag: "🇷🇴" },
  { name: "Alexandru", country: "Romania", currency: "RON", flag: "🇷🇴" },
  { name: "Elena", country: "Romania", currency: "RON", flag: "🇷🇴" },
  { name: "David", country: "Romania", currency: "RON", flag: "🇷🇴" },
  { name: "Ioana", country: "Romania", currency: "RON", flag: "🇷🇴" },
];

const investmentMessages = [
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} ${name} from ${country} just invested ${amount}`,
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} ${name} from ${country} made an investment of ${amount}`,
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} New investment: ${name} from ${country} invested ${amount}`,
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} ${name} from ${country} started investing with ${amount}`,
];

const withdrawalMessages = [
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} ${name} from ${country} just withdrew ${amount}`,
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} ${name} from ${country} received a payout of ${amount}`,
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} Withdrawal complete: ${name} from ${country} got ${amount}`,
  (name: string, country: string, amount: string, flag: string) => 
    `${flag} ${name} from ${country} cashed out ${amount}`,
];

// Generate realistic weighted random amounts (minimum $100, up to $10M) - always in USD
const getRandomAmount = (): string => {
  const ranges = [
    { min: 100, max: 500, weight: 8 },         // Micro investors
    { min: 500, max: 2000, weight: 12 },       // Small investors
    { min: 2000, max: 10000, weight: 18 },     // Regular investors
    { min: 10000, max: 50000, weight: 22 },    // Medium investors
    { min: 50000, max: 150000, weight: 18 },   // Large investors
    { min: 150000, max: 500000, weight: 12 },  // Premium investors
    { min: 500000, max: 2000000, weight: 7 },  // High net worth
    { min: 2000000, max: 10000000, weight: 3 }, // Ultra high net worth
  ];
  
  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
  const random = Math.random() * totalWeight;
  
  let cumulative = 0;
  for (const range of ranges) {
    cumulative += range.weight;
    if (random <= cumulative) {
      const amount = Math.floor(Math.random() * (range.max - range.min) + range.min);
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  
  return `$${Math.floor(Math.random() * 10000 + 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Random interval between 8-15 seconds for natural real-life timing
const getRandomInterval = (): number => {
  return Math.floor(Math.random() * (15000 - 8000) + 8000);
};

// Display duration 2.5-3.5 seconds - quick and non-intrusive
const getRandomDisplayDuration = (): number => {
  return Math.floor(Math.random() * (3500 - 2500) + 2500);
};

export const InvestmentNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isWithdrawal, setIsWithdrawal] = useState(false);
  const usedIndicesRef = useRef<Set<number>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sound notifications disabled per user request

  const getUniqueUser = () => {
    // Reset if we've used most users
    if (usedIndicesRef.current.size >= allUsers.length * 0.9) {
      usedIndicesRef.current.clear();
    }
    
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * allUsers.length);
    } while (usedIndicesRef.current.has(randomIndex));
    
    usedIndicesRef.current.add(randomIndex);
    return allUsers[randomIndex];
  };

  const showNotification = () => {
    const user = getUniqueUser();
    const amount = getRandomAmount();
    const isWithdraw = Math.random() > 0.65; // 35% withdrawals, 65% investments
    
    setIsWithdrawal(isWithdraw);
    
    const messages = isWithdraw ? withdrawalMessages : investmentMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage(user.name, user.country, amount, user.flag));
    
    setIsVisible(true);
    
    // Sound disabled - no audio playback
    
    // Hide after random duration
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next notification
      timeoutRef.current = setTimeout(showNotification, getRandomInterval());
    }, getRandomDisplayDuration());
  };

  useEffect(() => {
    // Initial delay before first notification (3-5 seconds)
    const initialDelay = Math.floor(Math.random() * (5000 - 3000) + 3000);
    timeoutRef.current = setTimeout(showNotification, initialDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-20 left-3 z-40 max-w-[240px]"
        >
          <div className="overflow-hidden rounded-lg border border-border/40 bg-card/90 backdrop-blur-md shadow-lg">
            <div className="p-2.5">
              <div className="flex items-center gap-2">
                <div className={`flex-shrink-0 p-1.5 rounded-md ${
                  isWithdrawal 
                    ? 'bg-emerald-500/15' 
                    : 'bg-green-500/15'
                }`}>
                  {isWithdrawal ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground leading-tight line-clamp-2">
                    {message}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[9px] text-green-400 font-medium">
                      <span className="w-1 h-1 rounded-full bg-green-400" />
                      now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
