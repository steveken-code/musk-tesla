import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Country coordinates (approximate center points on a normalized map 0-100%)
const countryCoordinates: Record<string, { x: number; y: number }> = {
  "United States": { x: 20, y: 40 },
  "Canada": { x: 22, y: 30 },
  "Brazil": { x: 32, y: 65 },
  "Argentina": { x: 30, y: 78 },
  "United Kingdom": { x: 47, y: 32 },
  "France": { x: 49, y: 38 },
  "Germany": { x: 52, y: 35 },
  "Spain": { x: 46, y: 42 },
  "Italy": { x: 53, y: 42 },
  "Netherlands": { x: 50, y: 33 },
  "Norway": { x: 52, y: 25 },
  "Sweden": { x: 55, y: 26 },
  "Poland": { x: 55, y: 34 },
  "Hungary": { x: 55, y: 38 },
  "Switzerland": { x: 51, y: 38 },
  "Russia": { x: 70, y: 28 },
  "China": { x: 78, y: 40 },
  "Japan": { x: 88, y: 40 },
  "South Korea": { x: 85, y: 42 },
  "India": { x: 72, y: 48 },
  "Singapore": { x: 78, y: 58 },
  "Australia": { x: 85, y: 72 },
  "New Zealand": { x: 92, y: 78 },
  "South Africa": { x: 57, y: 72 },
  "Nigeria": { x: 52, y: 55 },
  "Kenya": { x: 60, y: 58 },
  "Egypt": { x: 57, y: 45 },
  "United Arab Emirates": { x: 65, y: 48 },
  "Saudi Arabia": { x: 62, y: 48 },
  "Kuwait": { x: 63, y: 45 },
  "Israel": { x: 58, y: 44 },
  "Turkey": { x: 58, y: 40 },
  "Mexico": { x: 18, y: 50 },
  "Colombia": { x: 28, y: 56 },
  "Chile": { x: 28, y: 75 },
  "Thailand": { x: 76, y: 52 },
  "Vietnam": { x: 78, y: 52 },
  "Malaysia": { x: 77, y: 58 },
  "Indonesia": { x: 80, y: 62 },
  "Philippines": { x: 84, y: 52 },
  "Pakistan": { x: 68, y: 45 },
  "Bangladesh": { x: 73, y: 48 },
  "Austria": { x: 53, y: 38 },
  "Belgium": { x: 49, y: 34 },
  "Denmark": { x: 52, y: 30 },
  "Finland": { x: 58, y: 24 },
  "Greece": { x: 56, y: 42 },
  "Ireland": { x: 45, y: 32 },
  "Portugal": { x: 44, y: 42 },
  "Czech Republic": { x: 53, y: 36 },
  "Qatar": { x: 64, y: 48 },
  "Morocco": { x: 45, y: 46 },
  "Ghana": { x: 48, y: 55 },
  "Uganda": { x: 58, y: 58 },
  "Tanzania": { x: 59, y: 62 },
  "Ukraine": { x: 58, y: 34 },
  "Romania": { x: 56, y: 38 },
  "Peru": { x: 26, y: 62 },
  "Venezuela": { x: 30, y: 52 },
};

// Expanded user data - all amounts will be in USD
const allUsers = [
  // United States (10)
  { name: "Liam", country: "United States", flag: "🇺🇸" },
  { name: "Olivia", country: "United States", flag: "🇺🇸" },
  { name: "Noah", country: "United States", flag: "🇺🇸" },
  { name: "Emma", country: "United States", flag: "🇺🇸" },
  { name: "James", country: "United States", flag: "🇺🇸" },
  { name: "Charlotte", country: "United States", flag: "🇺🇸" },
  { name: "Benjamin", country: "United States", flag: "🇺🇸" },
  { name: "Sophia", country: "United States", flag: "🇺🇸" },
  { name: "William", country: "United States", flag: "🇺🇸" },
  { name: "Isabella", country: "United States", flag: "🇺🇸" },
  
  // Russia (8)
  { name: "Dmitri", country: "Russia", flag: "🇷🇺" },
  { name: "Anastasia", country: "Russia", flag: "🇷🇺" },
  { name: "Mikhail", country: "Russia", flag: "🇷🇺" },
  { name: "Olga", country: "Russia", flag: "🇷🇺" },
  { name: "Sergei", country: "Russia", flag: "🇷🇺" },
  { name: "Natalia", country: "Russia", flag: "🇷🇺" },
  { name: "Alexei", country: "Russia", flag: "🇷🇺" },
  { name: "Ekaterina", country: "Russia", flag: "🇷🇺" },
  
  // Germany (8)
  { name: "Lukas", country: "Germany", flag: "🇩🇪" },
  { name: "Anna", country: "Germany", flag: "🇩🇪" },
  { name: "Maximilian", country: "Germany", flag: "🇩🇪" },
  { name: "Sophie", country: "Germany", flag: "🇩🇪" },
  { name: "Felix", country: "Germany", flag: "🇩🇪" },
  { name: "Marie", country: "Germany", flag: "🇩🇪" },
  { name: "Paul", country: "Germany", flag: "🇩🇪" },
  { name: "Hannah", country: "Germany", flag: "🇩🇪" },
  
  // United Kingdom (8)
  { name: "Oliver", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Amelia", country: "United Kingdom", flag: "🇬🇧" },
  { name: "George", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Grace", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Harry", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Freya", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Thomas", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Lily", country: "United Kingdom", flag: "🇬🇧" },
  
  // France (6)
  { name: "Gabriel", country: "France", flag: "🇫🇷" },
  { name: "Léa", country: "France", flag: "🇫🇷" },
  { name: "Louis", country: "France", flag: "🇫🇷" },
  { name: "Chloé", country: "France", flag: "🇫🇷" },
  { name: "Raphaël", country: "France", flag: "🇫🇷" },
  { name: "Manon", country: "France", flag: "🇫🇷" },
  
  // Hungary (4)
  { name: "Bence", country: "Hungary", flag: "🇭🇺" },
  { name: "Eszter", country: "Hungary", flag: "🇭🇺" },
  { name: "Levente", country: "Hungary", flag: "🇭🇺" },
  { name: "Zsófia", country: "Hungary", flag: "🇭🇺" },
  
  // Netherlands (4)
  { name: "Daan", country: "Netherlands", flag: "🇳🇱" },
  { name: "Lotte", country: "Netherlands", flag: "🇳🇱" },
  { name: "Sem", country: "Netherlands", flag: "🇳🇱" },
  { name: "Julia", country: "Netherlands", flag: "🇳🇱" },
  
  // Norway (4)
  { name: "Lars", country: "Norway", flag: "🇳🇴" },
  { name: "Ingrid", country: "Norway", flag: "🇳🇴" },
  { name: "Magnus", country: "Norway", flag: "🇳🇴" },
  { name: "Astrid", country: "Norway", flag: "🇳🇴" },
  
  // Poland (4)
  { name: "Jakub", country: "Poland", flag: "🇵🇱" },
  { name: "Zuzanna", country: "Poland", flag: "🇵🇱" },
  { name: "Kacper", country: "Poland", flag: "🇵🇱" },
  { name: "Maja", country: "Poland", flag: "🇵🇱" },
  
  // Kenya (4)
  { name: "Njeri", country: "Kenya", flag: "🇰🇪" },
  { name: "Kamau", country: "Kenya", flag: "🇰🇪" },
  { name: "Wambui", country: "Kenya", flag: "🇰🇪" },
  { name: "Otieno", country: "Kenya", flag: "🇰🇪" },
  
  // Nigeria (4)
  { name: "Chukwuemeka", country: "Nigeria", flag: "🇳🇬" },
  { name: "Adaeze", country: "Nigeria", flag: "🇳🇬" },
  { name: "Oluwaseun", country: "Nigeria", flag: "🇳🇬" },
  { name: "Chidinma", country: "Nigeria", flag: "🇳🇬" },
  
  // UAE (4)
  { name: "Ahmed", country: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Fatima", country: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Khalid", country: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Hessa", country: "United Arab Emirates", flag: "🇦🇪" },
  
  // Kuwait (4)
  { name: "Mohammad", country: "Kuwait", flag: "🇰🇼" },
  { name: "Sara", country: "Kuwait", flag: "🇰🇼" },
  { name: "Yousef", country: "Kuwait", flag: "🇰🇼" },
  { name: "Noura", country: "Kuwait", flag: "🇰🇼" },
  
  // Japan (6)
  { name: "Haruto", country: "Japan", flag: "🇯🇵" },
  { name: "Yui", country: "Japan", flag: "🇯🇵" },
  { name: "Sota", country: "Japan", flag: "🇯🇵" },
  { name: "Himari", country: "Japan", flag: "🇯🇵" },
  { name: "Minato", country: "Japan", flag: "🇯🇵" },
  { name: "Sakura", country: "Japan", flag: "🇯🇵" },
  
  // China (6)
  { name: "Wei", country: "China", flag: "🇨🇳" },
  { name: "Xiaoming", country: "China", flag: "🇨🇳" },
  { name: "Jing", country: "China", flag: "🇨🇳" },
  { name: "Ming", country: "China", flag: "🇨🇳" },
  { name: "Mei", country: "China", flag: "🇨🇳" },
  { name: "Chen", country: "China", flag: "🇨🇳" },
  
  // Brazil (6)
  { name: "Miguel", country: "Brazil", flag: "🇧🇷" },
  { name: "Helena", country: "Brazil", flag: "🇧🇷" },
  { name: "Arthur", country: "Brazil", flag: "🇧🇷" },
  { name: "Alice", country: "Brazil", flag: "🇧🇷" },
  { name: "Bernardo", country: "Brazil", flag: "🇧🇷" },
  { name: "Valentina", country: "Brazil", flag: "🇧🇷" },
  
  // Canada (4)
  { name: "Ethan", country: "Canada", flag: "🇨🇦" },
  { name: "Sophia", country: "Canada", flag: "🇨🇦" },
  { name: "Mason", country: "Canada", flag: "🇨🇦" },
  { name: "Emma", country: "Canada", flag: "🇨🇦" },
  
  // Australia (4)
  { name: "Jack", country: "Australia", flag: "🇦🇺" },
  { name: "Chloe", country: "Australia", flag: "🇦🇺" },
  { name: "William", country: "Australia", flag: "🇦🇺" },
  { name: "Isla", country: "Australia", flag: "🇦🇺" },
  
  // India (6)
  { name: "Aarav", country: "India", flag: "🇮🇳" },
  { name: "Ananya", country: "India", flag: "🇮🇳" },
  { name: "Vihaan", country: "India", flag: "🇮🇳" },
  { name: "Priya", country: "India", flag: "🇮🇳" },
  { name: "Aditya", country: "India", flag: "🇮🇳" },
  { name: "Ishita", country: "India", flag: "🇮🇳" },
  
  // South Africa (4)
  { name: "Thabo", country: "South Africa", flag: "🇿🇦" },
  { name: "Naledi", country: "South Africa", flag: "🇿🇦" },
  { name: "Sipho", country: "South Africa", flag: "🇿🇦" },
  { name: "Lindiwe", country: "South Africa", flag: "🇿🇦" },
  
  // Saudi Arabia (4)
  { name: "Abdullah", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Fatimah", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Omar", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Nora", country: "Saudi Arabia", flag: "🇸🇦" },
  
  // Singapore (4)
  { name: "Jia Wei", country: "Singapore", flag: "🇸🇬" },
  { name: "Hui Ling", country: "Singapore", flag: "🇸🇬" },
  { name: "Wei Ming", country: "Singapore", flag: "🇸🇬" },
  { name: "Xin Yi", country: "Singapore", flag: "🇸🇬" },
  
  // Switzerland (4)
  { name: "Luca", country: "Switzerland", flag: "🇨🇭" },
  { name: "Elena", country: "Switzerland", flag: "🇨🇭" },
  { name: "Noah", country: "Switzerland", flag: "🇨🇭" },
  { name: "Mia", country: "Switzerland", flag: "🇨🇭" },
  
  // Sweden (4)
  { name: "Oscar", country: "Sweden", flag: "🇸🇪" },
  { name: "Maja", country: "Sweden", flag: "🇸🇪" },
  { name: "Elias", country: "Sweden", flag: "🇸🇪" },
  { name: "Ella", country: "Sweden", flag: "🇸🇪" },
  
  // Spain (4)
  { name: "Hugo", country: "Spain", flag: "🇪🇸" },
  { name: "Lucía", country: "Spain", flag: "🇪🇸" },
  { name: "Martín", country: "Spain", flag: "🇪🇸" },
  { name: "María", country: "Spain", flag: "🇪🇸" },
  
  // Italy (4)
  { name: "Francesco", country: "Italy", flag: "🇮🇹" },
  { name: "Giulia", country: "Italy", flag: "🇮🇹" },
  { name: "Alessandro", country: "Italy", flag: "🇮🇹" },
  { name: "Sofia", country: "Italy", flag: "🇮🇹" },
  
  // South Korea (4)
  { name: "Minjun", country: "South Korea", flag: "🇰🇷" },
  { name: "Seoyeon", country: "South Korea", flag: "🇰🇷" },
  { name: "Jiho", country: "South Korea", flag: "🇰🇷" },
  { name: "Soyeon", country: "South Korea", flag: "🇰🇷" },
  
  // Turkey (4)
  { name: "Yusuf", country: "Turkey", flag: "🇹🇷" },
  { name: "Zeynep", country: "Turkey", flag: "🇹🇷" },
  { name: "Eymen", country: "Turkey", flag: "🇹🇷" },
  { name: "Elif", country: "Turkey", flag: "🇹🇷" },
  
  // Qatar (4)
  { name: "Hamad", country: "Qatar", flag: "🇶🇦" },
  { name: "Shaikha", country: "Qatar", flag: "🇶🇦" },
  { name: "Khalifa", country: "Qatar", flag: "🇶🇦" },
  { name: "Mozah", country: "Qatar", flag: "🇶🇦" },
  
  // Egypt (4)
  { name: "Omar", country: "Egypt", flag: "🇪🇬" },
  { name: "Mariam", country: "Egypt", flag: "🇪🇬" },
  { name: "Youssef", country: "Egypt", flag: "🇪🇬" },
  { name: "Nour", country: "Egypt", flag: "🇪🇬" },
  
  // Thailand (4)
  { name: "Tanawat", country: "Thailand", flag: "🇹🇭" },
  { name: "Pimchanok", country: "Thailand", flag: "🇹🇭" },
  { name: "Kittisak", country: "Thailand", flag: "🇹🇭" },
  { name: "Siriporn", country: "Thailand", flag: "🇹🇭" },
  
  // Vietnam (4)
  { name: "Minh", country: "Vietnam", flag: "🇻🇳" },
  { name: "Linh", country: "Vietnam", flag: "🇻🇳" },
  { name: "Hùng", country: "Vietnam", flag: "🇻🇳" },
  { name: "Lan", country: "Vietnam", flag: "🇻🇳" },
  
  // Mexico (4)
  { name: "Santiago", country: "Mexico", flag: "🇲🇽" },
  { name: "Sofía", country: "Mexico", flag: "🇲🇽" },
  { name: "Mateo", country: "Mexico", flag: "🇲🇽" },
  { name: "Valentina", country: "Mexico", flag: "🇲🇽" },
  
  // Argentina (4)
  { name: "Thiago", country: "Argentina", flag: "🇦🇷" },
  { name: "Martina", country: "Argentina", flag: "🇦🇷" },
  { name: "Benjamín", country: "Argentina", flag: "🇦🇷" },
  { name: "Emma", country: "Argentina", flag: "🇦🇷" },
  
  // Colombia (4)
  { name: "Samuel", country: "Colombia", flag: "🇨🇴" },
  { name: "Isabella", country: "Colombia", flag: "🇨🇴" },
  { name: "Sebastián", country: "Colombia", flag: "🇨🇴" },
  { name: "Mariana", country: "Colombia", flag: "🇨🇴" },
  
  // Chile (4)
  { name: "Agustín", country: "Chile", flag: "🇨🇱" },
  { name: "Sofía", country: "Chile", flag: "🇨🇱" },
  { name: "Tomás", country: "Chile", flag: "🇨🇱" },
  { name: "Florencia", country: "Chile", flag: "🇨🇱" },
  
  // Philippines (4)
  { name: "Juan", country: "Philippines", flag: "🇵🇭" },
  { name: "Maria", country: "Philippines", flag: "🇵🇭" },
  { name: "Jose", country: "Philippines", flag: "🇵🇭" },
  { name: "Angela", country: "Philippines", flag: "🇵🇭" },
  
  // Malaysia (4)
  { name: "Ahmad", country: "Malaysia", flag: "🇲🇾" },
  { name: "Nurul", country: "Malaysia", flag: "🇲🇾" },
  { name: "Hafiz", country: "Malaysia", flag: "🇲🇾" },
  { name: "Aisyah", country: "Malaysia", flag: "🇲🇾" },
  
  // Indonesia (4)
  { name: "Budi", country: "Indonesia", flag: "🇮🇩" },
  { name: "Siti", country: "Indonesia", flag: "🇮🇩" },
  { name: "Agus", country: "Indonesia", flag: "🇮🇩" },
  { name: "Dewi", country: "Indonesia", flag: "🇮🇩" },
  
  // Pakistan (4)
  { name: "Ali", country: "Pakistan", flag: "🇵🇰" },
  { name: "Fatima", country: "Pakistan", flag: "🇵🇰" },
  { name: "Hassan", country: "Pakistan", flag: "🇵🇰" },
  { name: "Zainab", country: "Pakistan", flag: "🇵🇰" },
  
  // Bangladesh (4)
  { name: "Rahman", country: "Bangladesh", flag: "🇧🇩" },
  { name: "Fatema", country: "Bangladesh", flag: "🇧🇩" },
  { name: "Karim", country: "Bangladesh", flag: "🇧🇩" },
  { name: "Nasrin", country: "Bangladesh", flag: "🇧🇩" },
  
  // Morocco (4)
  { name: "Youssef", country: "Morocco", flag: "🇲🇦" },
  { name: "Fatima-Zahra", country: "Morocco", flag: "🇲🇦" },
  { name: "Amine", country: "Morocco", flag: "🇲🇦" },
  { name: "Salma", country: "Morocco", flag: "🇲🇦" },
  
  // Ghana (4)
  { name: "Kwame", country: "Ghana", flag: "🇬🇭" },
  { name: "Abena", country: "Ghana", flag: "🇬🇭" },
  { name: "Kofi", country: "Ghana", flag: "🇬🇭" },
  { name: "Akosua", country: "Ghana", flag: "🇬🇭" },
  
  // Ukraine (4)
  { name: "Oleksandr", country: "Ukraine", flag: "🇺🇦" },
  { name: "Anastasiia", country: "Ukraine", flag: "🇺🇦" },
  { name: "Dmytro", country: "Ukraine", flag: "🇺🇦" },
  { name: "Viktoriia", country: "Ukraine", flag: "🇺🇦" },
  
  // Romania (4)
  { name: "Andrei", country: "Romania", flag: "🇷🇴" },
  { name: "Maria", country: "Romania", flag: "🇷🇴" },
  { name: "Alexandru", country: "Romania", flag: "🇷🇴" },
  { name: "Elena", country: "Romania", flag: "🇷🇴" },
  
  // New Zealand (4)
  { name: "Oliver", country: "New Zealand", flag: "🇳🇿" },
  { name: "Charlotte", country: "New Zealand", flag: "🇳🇿" },
  { name: "Jack", country: "New Zealand", flag: "🇳🇿" },
  { name: "Amelia", country: "New Zealand", flag: "🇳🇿" },
  
  // Ireland (4)
  { name: "Conor", country: "Ireland", flag: "🇮🇪" },
  { name: "Aoife", country: "Ireland", flag: "🇮🇪" },
  { name: "Sean", country: "Ireland", flag: "🇮🇪" },
  { name: "Siobhan", country: "Ireland", flag: "🇮🇪" },
  
  // Portugal (4)
  { name: "Martim", country: "Portugal", flag: "🇵🇹" },
  { name: "Maria", country: "Portugal", flag: "🇵🇹" },
  { name: "Afonso", country: "Portugal", flag: "🇵🇹" },
  { name: "Leonor", country: "Portugal", flag: "🇵🇹" },
  
  // Denmark (4)
  { name: "William", country: "Denmark", flag: "🇩🇰" },
  { name: "Emma", country: "Denmark", flag: "🇩🇰" },
  { name: "Noah", country: "Denmark", flag: "🇩🇰" },
  { name: "Ida", country: "Denmark", flag: "🇩🇰" },
  
  // Finland (4)
  { name: "Eino", country: "Finland", flag: "🇫🇮" },
  { name: "Aino", country: "Finland", flag: "🇫🇮" },
  { name: "Oliver", country: "Finland", flag: "🇫🇮" },
  { name: "Olivia", country: "Finland", flag: "🇫🇮" },
  
  // Austria (4)
  { name: "Maximilian", country: "Austria", flag: "🇦🇹" },
  { name: "Anna", country: "Austria", flag: "🇦🇹" },
  { name: "Felix", country: "Austria", flag: "🇦🇹" },
  { name: "Marie", country: "Austria", flag: "🇦🇹" },
  
  // Belgium (4)
  { name: "Louis", country: "Belgium", flag: "🇧🇪" },
  { name: "Emma", country: "Belgium", flag: "🇧🇪" },
  { name: "Lucas", country: "Belgium", flag: "🇧🇪" },
  { name: "Olivia", country: "Belgium", flag: "🇧🇪" },
  
  // Greece (4)
  { name: "Georgios", country: "Greece", flag: "🇬🇷" },
  { name: "Maria", country: "Greece", flag: "🇬🇷" },
  { name: "Dimitrios", country: "Greece", flag: "🇬🇷" },
  { name: "Eleni", country: "Greece", flag: "🇬🇷" },
  
  // Czech Republic (4)
  { name: "Jakub", country: "Czech Republic", flag: "🇨🇿" },
  { name: "Eliška", country: "Czech Republic", flag: "🇨🇿" },
  { name: "Jan", country: "Czech Republic", flag: "🇨🇿" },
  { name: "Tereza", country: "Czech Republic", flag: "🇨🇿" },
  
  // Israel (4)
  { name: "David", country: "Israel", flag: "🇮🇱" },
  { name: "Noa", country: "Israel", flag: "🇮🇱" },
  { name: "Yosef", country: "Israel", flag: "🇮🇱" },
  { name: "Maya", country: "Israel", flag: "🇮🇱" },
];

interface MapActivity {
  id: string;
  name: string;
  country: string;
  flag: string;
  amount: string;
  type: 'investment' | 'withdrawal';
  x: number;
  y: number;
}

interface ConnectionLine {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'investment' | 'withdrawal';
}

// Central hub location (representing the trading platform)
const HUB_LOCATION = { x: 50, y: 45 };

const getRandomAmount = (): string => {
  const ranges = [
    { min: 100, max: 1000, weight: 15 },
    { min: 1000, max: 5000, weight: 20 },
    { min: 5000, max: 25000, weight: 25 },
    { min: 25000, max: 100000, weight: 20 },
    { min: 100000, max: 500000, weight: 12 },
    { min: 500000, max: 2000000, weight: 6 },
    { min: 2000000, max: 10000000, weight: 2 },
  ];
  
  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const range of ranges) {
    random -= range.weight;
    if (random <= 0) {
      const amount = Math.floor(Math.random() * (range.max - range.min) + range.min);
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  
  return `$${ranges[0].min.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const WorldMapVisualization = () => {
  const [activities, setActivities] = useState<MapActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<MapActivity[]>([]);
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);
  const usedIndicesRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getUniqueUser = () => {
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

  const generateActivity = (): MapActivity => {
    const user = getUniqueUser();
    const coords = countryCoordinates[user.country] || { x: 50, y: 50 };
    // Add some randomness to exact position
    const x = coords.x + (Math.random() - 0.5) * 6;
    const y = coords.y + (Math.random() - 0.5) * 6;
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: user.name,
      country: user.country,
      flag: user.flag,
      amount: getRandomAmount(),
      type: Math.random() > 0.65 ? 'withdrawal' : 'investment',
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  const addConnectionLine = (activity: MapActivity) => {
    const newLine: ConnectionLine = {
      id: `line-${activity.id}`,
      fromX: activity.type === 'investment' ? activity.x : HUB_LOCATION.x,
      fromY: activity.type === 'investment' ? activity.y : HUB_LOCATION.y,
      toX: activity.type === 'investment' ? HUB_LOCATION.x : activity.x,
      toY: activity.type === 'investment' ? HUB_LOCATION.y : activity.y,
      type: activity.type,
    };

    setConnectionLines(prev => [...prev, newLine]);

    // Remove the line after animation completes
    setTimeout(() => {
      setConnectionLines(prev => prev.filter(line => line.id !== newLine.id));
    }, 2000);
  };

  useEffect(() => {
    // Generate initial activities
    const initial: MapActivity[] = [];
    for (let i = 0; i < 5; i++) {
      initial.push(generateActivity());
    }
    setActivities(initial);
    setRecentActivities(initial.slice(0, 3));

    // Add new activity every 5-10 seconds (natural timing)
    const addActivity = () => {
      const newActivity = generateActivity();
      
      setActivities(prev => {
        const updated = [...prev, newActivity];
        // Remove old activities after 8 seconds
        return updated.slice(-12);
      });
      
      setRecentActivities(prev => [newActivity, ...prev].slice(0, 5));
      
      // Add connection line animation
      addConnectionLine(newActivity);
      
      // Random interval between 5-10 seconds
      const nextInterval = Math.floor(Math.random() * 5000) + 5000;
      intervalRef.current = setTimeout(addActivity, nextInterval);
    };

    // Start after initial delay
    intervalRef.current = setTimeout(addActivity, 3000);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  // Remove old activities
  useEffect(() => {
    const cleanup = setInterval(() => {
      setActivities(prev => prev.slice(-8));
    }, 10000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="relative w-full aspect-[2/1] sm:aspect-[2.5/1] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-white/10">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Real World Map SVG */}
        <svg 
          viewBox="0 0 2000 1001" 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: 0.4 }}
        >
          <defs>
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* North America */}
          <path 
            d="M165,135 L145,140 L130,160 L125,180 L140,200 L130,220 L120,250 L110,280 L95,300 L80,320 L100,340 L130,360 L160,380 L200,390 L240,400 L280,395 L320,380 L350,360 L380,340 L410,310 L430,280 L450,250 L460,220 L470,190 L480,160 L490,130 L500,110 L510,90 L490,80 L460,75 L430,80 L400,90 L370,100 L340,110 L310,120 L280,130 L250,140 L220,145 L190,140 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Canada */}
          <path 
            d="M200,50 L180,60 L160,80 L150,100 L165,120 L180,130 L200,125 L230,120 L260,110 L290,100 L320,90 L360,80 L400,70 L440,60 L480,55 L520,50 L560,48 L600,50 L640,55 L680,60 L700,70 L680,85 L640,95 L600,100 L560,105 L520,100 L480,95 L440,100 L400,110 L360,120 L320,130 L280,140 L240,145 L200,145 L180,140 L170,130 L175,110 L185,90 L195,70 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Mexico & Central America */}
          <path 
            d="M200,395 L180,410 L160,430 L150,450 L160,470 L180,490 L200,500 L230,510 L260,505 L290,495 L320,480 L350,460 L370,440 L380,420 L370,400 L350,385 L320,380 L290,385 L260,390 L230,395 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* South America */}
          <path 
            d="M320,520 L290,540 L270,570 L260,600 L270,640 L290,680 L310,720 L330,760 L350,800 L370,840 L380,880 L370,920 L350,950 L320,970 L290,960 L270,930 L260,890 L270,850 L290,810 L300,770 L290,730 L270,690 L260,650 L270,610 L290,580 L320,560 L350,550 L380,545 L410,550 L440,560 L460,580 L470,610 L460,650 L440,690 L420,720 L400,750 L380,780 L360,810 L350,840 L360,870 L380,900 L400,920 L410,950 L400,970 L370,980 L340,970 L310,950 L300,920 L310,880 L330,840 L340,800 L330,760 L310,720 L290,680 L280,640 L290,600 L310,560 L340,530 L370,520 L400,530 L430,550 L450,580 L460,620 L450,660 L430,690 L400,710 L370,700 L350,680 L340,650 L350,620 L370,600 L390,590 L410,600 L420,630 L410,660 L390,680 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Europe */}
          <path 
            d="M880,120 L860,140 L850,160 L860,180 L880,200 L910,210 L940,200 L970,190 L1000,180 L1030,170 L1060,165 L1090,170 L1120,180 L1140,200 L1150,220 L1140,240 L1120,250 L1090,255 L1060,250 L1030,240 L1000,230 L970,225 L940,230 L910,240 L885,250 L860,260 L840,280 L830,300 L840,320 L860,330 L890,325 L920,310 L950,300 L980,295 L1010,300 L1040,310 L1070,320 L1100,325 L1130,320 L1150,300 L1160,280 L1150,260 L1130,245 L1100,240 L1070,245 L1040,255 L1010,260 L980,255 L950,245 L920,235 L890,230 L870,220 L860,200 L870,180 L890,165 L920,155 L950,150 L980,155 L1010,165 L1040,175 L1070,180 L1100,175 L1120,160 L1130,140 L1120,125 L1090,115 L1060,110 L1030,115 L1000,125 L970,135 L940,140 L910,135 L880,125 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Africa */}
          <path 
            d="M950,340 L920,360 L900,390 L890,430 L900,470 L920,510 L950,550 L980,590 L1010,630 L1040,670 L1070,700 L1100,720 L1130,730 L1160,720 L1180,700 L1190,670 L1180,640 L1160,610 L1140,580 L1130,550 L1140,520 L1160,490 L1180,460 L1190,430 L1180,400 L1160,370 L1130,350 L1100,340 L1070,335 L1040,340 L1010,350 L980,355 L950,345 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Middle East */}
          <path 
            d="M1180,280 L1160,300 L1150,330 L1160,360 L1180,380 L1210,390 L1240,380 L1270,360 L1290,340 L1300,310 L1290,280 L1270,260 L1240,250 L1210,260 L1185,275 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Russia/Asia */}
          <path 
            d="M1150,80 L1120,100 L1100,120 L1120,140 L1150,150 L1190,145 L1230,135 L1280,125 L1330,120 L1380,115 L1430,110 L1480,105 L1530,100 L1580,98 L1630,100 L1680,105 L1720,115 L1750,130 L1770,150 L1780,175 L1770,200 L1750,220 L1720,235 L1680,245 L1640,250 L1600,248 L1560,240 L1520,230 L1480,220 L1440,215 L1400,220 L1360,230 L1320,240 L1280,245 L1240,240 L1200,230 L1170,215 L1150,195 L1145,170 L1155,145 L1175,125 L1200,110 L1230,100 L1260,95 L1290,100 L1320,110 L1350,120 L1380,125 L1410,120 L1440,110 L1470,105 L1500,110 L1530,120 L1560,130 L1590,135 L1620,130 L1650,120 L1680,115 L1710,120 L1730,135 L1740,155 L1730,175 L1710,190 L1680,200 L1650,205 L1620,200 L1590,190 L1560,180 L1530,175 L1500,180 L1470,190 L1440,200 L1410,205 L1380,200 L1350,190 L1320,180 L1290,175 L1260,180 L1230,190 L1200,195 L1175,185 L1160,165 L1155,140 L1165,115 L1185,95 L1210,85 L1240,80 L1270,85 L1300,95 L1330,100 L1360,95 L1390,85 L1420,80 L1450,85 L1480,95 L1510,100 L1540,95 L1570,85 L1600,80 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* India */}
          <path 
            d="M1350,320 L1320,350 L1300,390 L1290,430 L1300,470 L1330,500 L1370,520 L1410,530 L1450,520 L1480,500 L1500,470 L1510,430 L1500,390 L1480,360 L1450,340 L1420,330 L1390,325 L1360,325 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* China */}
          <path 
            d="M1450,230 L1420,250 L1400,280 L1390,310 L1400,340 L1430,360 L1470,370 L1510,365 L1550,350 L1590,330 L1620,310 L1640,285 L1650,260 L1640,235 L1620,215 L1590,200 L1550,195 L1510,200 L1480,215 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Japan */}
          <path 
            d="M1720,280 L1700,300 L1695,330 L1710,360 L1735,380 L1760,370 L1780,345 L1785,315 L1770,290 L1745,275 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Southeast Asia */}
          <path 
            d="M1500,430 L1470,450 L1450,480 L1440,520 L1450,560 L1480,590 L1520,600 L1560,590 L1590,560 L1610,520 L1600,480 L1570,450 L1530,435 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* Australia */}
          <path 
            d="M1580,680 L1540,710 L1510,750 L1500,800 L1520,850 L1560,890 L1620,910 L1680,900 L1740,870 L1790,830 L1820,780 L1830,730 L1810,690 L1770,660 L1720,650 L1670,660 L1620,670 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
          {/* New Zealand */}
          <path 
            d="M1880,820 L1865,850 L1870,890 L1895,920 L1920,910 L1930,880 L1920,850 L1900,830 Z" 
            fill="url(#landGradient)" 
            stroke="rgba(16, 185, 129, 0.3)" 
            strokeWidth="1"
          />
        </svg>

        {/* Glow effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30 pointer-events-none" />

        {/* Connection Lines Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <defs>
            <linearGradient id="investmentLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="withdrawalLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#6ee7b7" stopOpacity="1" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <AnimatePresence>
            {connectionLines.map((line) => {
              // Calculate control point for curved line
              const midX = (line.fromX + line.toX) / 2;
              const midY = Math.min(line.fromY, line.toY) - 15; // Arc upward
              
              const pathD = `M ${line.fromX}% ${line.fromY}% Q ${midX}% ${midY}% ${line.toX}% ${line.toY}%`;
              
              return (
                <motion.g key={line.id}>
                  {/* Background glow */}
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={line.type === 'investment' ? '#22c55e' : '#34d399'}
                    strokeWidth="4"
                    strokeOpacity="0.3"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  {/* Main line */}
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={`url(#${line.type}LineGradient)`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  {/* Moving dot along path */}
                  <motion.circle
                    r="3"
                    fill={line.type === 'investment' ? '#4ade80' : '#6ee7b7'}
                    filter="url(#glow)"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                      offsetPath: `path("${pathD.replace(/%/g, '')}")`,
                    }}
                  >
                    <animate
                      attributeName="opacity"
                      values="1;1;0"
                      dur="1.5s"
                      fill="freeze"
                    />
                  </motion.circle>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Central Hub Indicator */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${HUB_LOCATION.x}%`, top: `${HUB_LOCATION.y}%` }}
        >
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50">
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-50" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Activity Pins */}
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ 
                left: `${activity.x}%`, 
                top: `${activity.y}%`,
                zIndex: 15
              }}
            >
              {/* Ripple Effect */}
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  activity.type === 'investment' ? 'bg-green-500' : 'bg-emerald-400'
                }`}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              
              {/* Pin */}
              <div className={`relative z-10 w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg cursor-pointer ${
                activity.type === 'investment' 
                  ? 'bg-green-500 shadow-green-500/50' 
                  : 'bg-emerald-400 shadow-emerald-400/50'
              }`}>
                <div className="absolute inset-0 rounded-full animate-ping opacity-75" 
                  style={{ 
                    backgroundColor: activity.type === 'investment' ? '#22c55e' : '#34d399',
                    animationDuration: '2s'
                  }}
                />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="px-3 py-1.5 bg-black/95 rounded-lg text-xs whitespace-nowrap text-white border border-white/10 shadow-xl">
                  {activity.flag} {activity.name} • {activity.amount}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-4 text-xs text-white/70">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>Investment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Withdrawal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Trading Hub</span>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-white/90">LIVE</span>
        </div>
      </div>

      {/* Recent Activity Feed Below Map */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h3>
        <AnimatePresence mode="popLayout">
          {recentActivities.slice(0, 4).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
            >
              <span className="text-xl">{activity.flag}</span>
              <div className={`p-1.5 rounded-lg ${
                activity.type === 'investment' 
                  ? 'bg-green-500/10' 
                  : 'bg-emerald-500/10'
              }`}>
                {activity.type === 'investment' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.name} from {activity.country}
                </p>
              </div>
              <span className={`text-sm font-semibold ${
                activity.type === 'investment' ? 'text-green-500' : 'text-emerald-500'
              }`}>
                {activity.amount}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorldMapVisualization;
