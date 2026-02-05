 // Country code to country info mapping
 export interface CountryInfo {
   name: string;
   flag: string;
   coords: { x: number; y: number };
 }
 
 export const countryCodeMap: Record<string, CountryInfo> = {
   US: { name: "United States", flag: "🇺🇸", coords: { x: 20, y: 40 } },
   CA: { name: "Canada", flag: "🇨🇦", coords: { x: 22, y: 30 } },
   GB: { name: "United Kingdom", flag: "🇬🇧", coords: { x: 47, y: 32 } },
   DE: { name: "Germany", flag: "🇩🇪", coords: { x: 52, y: 35 } },
   FR: { name: "France", flag: "🇫🇷", coords: { x: 49, y: 38 } },
   ES: { name: "Spain", flag: "🇪🇸", coords: { x: 46, y: 42 } },
   IT: { name: "Italy", flag: "🇮🇹", coords: { x: 53, y: 42 } },
   NL: { name: "Netherlands", flag: "🇳🇱", coords: { x: 50, y: 33 } },
   BE: { name: "Belgium", flag: "🇧🇪", coords: { x: 49, y: 34 } },
   CH: { name: "Switzerland", flag: "🇨🇭", coords: { x: 51, y: 38 } },
   AT: { name: "Austria", flag: "🇦🇹", coords: { x: 53, y: 38 } },
   SE: { name: "Sweden", flag: "🇸🇪", coords: { x: 55, y: 26 } },
   NO: { name: "Norway", flag: "🇳🇴", coords: { x: 52, y: 25 } },
   DK: { name: "Denmark", flag: "🇩🇰", coords: { x: 52, y: 30 } },
   FI: { name: "Finland", flag: "🇫🇮", coords: { x: 58, y: 24 } },
   PL: { name: "Poland", flag: "🇵🇱", coords: { x: 55, y: 34 } },
   HU: { name: "Hungary", flag: "🇭🇺", coords: { x: 55, y: 38 } },
   CZ: { name: "Czech Republic", flag: "🇨🇿", coords: { x: 53, y: 36 } },
   PT: { name: "Portugal", flag: "🇵🇹", coords: { x: 44, y: 42 } },
   GR: { name: "Greece", flag: "🇬🇷", coords: { x: 56, y: 42 } },
   IE: { name: "Ireland", flag: "🇮🇪", coords: { x: 45, y: 32 } },
   RU: { name: "Russia", flag: "🇷🇺", coords: { x: 70, y: 28 } },
   UA: { name: "Ukraine", flag: "🇺🇦", coords: { x: 58, y: 34 } },
   RO: { name: "Romania", flag: "🇷🇴", coords: { x: 56, y: 38 } },
   TR: { name: "Turkey", flag: "🇹🇷", coords: { x: 58, y: 40 } },
   IL: { name: "Israel", flag: "🇮🇱", coords: { x: 58, y: 44 } },
   AE: { name: "United Arab Emirates", flag: "🇦🇪", coords: { x: 65, y: 48 } },
   SA: { name: "Saudi Arabia", flag: "🇸🇦", coords: { x: 62, y: 48 } },
   KW: { name: "Kuwait", flag: "🇰🇼", coords: { x: 63, y: 45 } },
   QA: { name: "Qatar", flag: "🇶🇦", coords: { x: 64, y: 48 } },
   EG: { name: "Egypt", flag: "🇪🇬", coords: { x: 57, y: 45 } },
   ZA: { name: "South Africa", flag: "🇿🇦", coords: { x: 57, y: 72 } },
   NG: { name: "Nigeria", flag: "🇳🇬", coords: { x: 52, y: 55 } },
   KE: { name: "Kenya", flag: "🇰🇪", coords: { x: 60, y: 58 } },
   GH: { name: "Ghana", flag: "🇬🇭", coords: { x: 48, y: 55 } },
   MA: { name: "Morocco", flag: "🇲🇦", coords: { x: 45, y: 46 } },
   UG: { name: "Uganda", flag: "🇺🇬", coords: { x: 58, y: 58 } },
   CN: { name: "China", flag: "🇨🇳", coords: { x: 78, y: 40 } },
   JP: { name: "Japan", flag: "🇯🇵", coords: { x: 88, y: 40 } },
   KR: { name: "South Korea", flag: "🇰🇷", coords: { x: 85, y: 42 } },
   IN: { name: "India", flag: "🇮🇳", coords: { x: 72, y: 48 } },
   SG: { name: "Singapore", flag: "🇸🇬", coords: { x: 78, y: 58 } },
   TH: { name: "Thailand", flag: "🇹🇭", coords: { x: 76, y: 52 } },
   VN: { name: "Vietnam", flag: "🇻🇳", coords: { x: 78, y: 52 } },
   MY: { name: "Malaysia", flag: "🇲🇾", coords: { x: 77, y: 58 } },
   ID: { name: "Indonesia", flag: "🇮🇩", coords: { x: 80, y: 62 } },
   PH: { name: "Philippines", flag: "🇵🇭", coords: { x: 84, y: 52 } },
   PK: { name: "Pakistan", flag: "🇵🇰", coords: { x: 68, y: 45 } },
   BD: { name: "Bangladesh", flag: "🇧🇩", coords: { x: 73, y: 48 } },
   AU: { name: "Australia", flag: "🇦🇺", coords: { x: 85, y: 72 } },
   NZ: { name: "New Zealand", flag: "🇳🇿", coords: { x: 92, y: 78 } },
   BR: { name: "Brazil", flag: "🇧🇷", coords: { x: 32, y: 65 } },
   MX: { name: "Mexico", flag: "🇲🇽", coords: { x: 18, y: 50 } },
   AR: { name: "Argentina", flag: "🇦🇷", coords: { x: 30, y: 78 } },
   CO: { name: "Colombia", flag: "🇨🇴", coords: { x: 28, y: 56 } },
   CL: { name: "Chile", flag: "🇨🇱", coords: { x: 28, y: 75 } },
   PE: { name: "Peru", flag: "🇵🇪", coords: { x: 26, y: 62 } },
   VE: { name: "Venezuela", flag: "🇻🇪", coords: { x: 30, y: 52 } },
   TZ: { name: "Tanzania", flag: "🇹🇿", coords: { x: 59, y: 62 } },
   // NEW COUNTRIES - Expanded for 55+ total
   ET: { name: "Ethiopia", flag: "🇪🇹", coords: { x: 61, y: 55 } },
   ZW: { name: "Zimbabwe", flag: "🇿🇼", coords: { x: 58, y: 68 } },
   SN: { name: "Senegal", flag: "🇸🇳", coords: { x: 43, y: 52 } },
   BH: { name: "Bahrain", flag: "🇧🇭", coords: { x: 64, y: 46 } },
   OM: { name: "Oman", flag: "🇴🇲", coords: { x: 66, y: 50 } },
   JO: { name: "Jordan", flag: "🇯🇴", coords: { x: 59, y: 44 } },
   LB: { name: "Lebanon", flag: "🇱🇧", coords: { x: 58, y: 43 } },
   LK: { name: "Sri Lanka", flag: "🇱🇰", coords: { x: 74, y: 55 } },
   NP: { name: "Nepal", flag: "🇳🇵", coords: { x: 75, y: 45 } },
   KH: { name: "Cambodia", flag: "🇰🇭", coords: { x: 77, y: 54 } },
   MM: { name: "Myanmar", flag: "🇲🇲", coords: { x: 75, y: 50 } },
   HR: { name: "Croatia", flag: "🇭🇷", coords: { x: 54, y: 39 } },
   RS: { name: "Serbia", flag: "🇷🇸", coords: { x: 55, y: 40 } },
   BA: { name: "Bosnia", flag: "🇧🇦", coords: { x: 54, y: 40 } },
   IS: { name: "Iceland", flag: "🇮🇸", coords: { x: 42, y: 22 } },
   EC: { name: "Ecuador", flag: "🇪🇨", coords: { x: 25, y: 58 } },
   CR: { name: "Costa Rica", flag: "🇨🇷", coords: { x: 22, y: 54 } },
   DO: { name: "Dominican Republic", flag: "🇩🇴", coords: { x: 28, y: 50 } },
 };
 
 // User data with culturally appropriate names by country
 export interface UserData {
   name: string;
   country: string;
   flag: string;
 }
 
 export const allUsers: UserData[] = [
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
   
   // NEW COUNTRIES - 15 additional for 55+ total
   // Ethiopia (3)
   { name: "Yohannes", country: "Ethiopia", flag: "🇪🇹" },
   { name: "Tigist", country: "Ethiopia", flag: "🇪🇹" },
   { name: "Abebe", country: "Ethiopia", flag: "🇪🇹" },
   
   // Zimbabwe (3)
   { name: "Tendai", country: "Zimbabwe", flag: "🇿🇼" },
   { name: "Rutendo", country: "Zimbabwe", flag: "🇿🇼" },
   { name: "Farai", country: "Zimbabwe", flag: "🇿🇼" },
   
   // Senegal (3)
   { name: "Mamadou", country: "Senegal", flag: "🇸🇳" },
   { name: "Fatou", country: "Senegal", flag: "🇸🇳" },
   { name: "Ousmane", country: "Senegal", flag: "🇸🇳" },
   
   // Tanzania (3)
   { name: "Juma", country: "Tanzania", flag: "🇹🇿" },
   { name: "Rehema", country: "Tanzania", flag: "🇹🇿" },
   { name: "Baraka", country: "Tanzania", flag: "🇹🇿" },
   
   // Bahrain (3)
   { name: "Hassan", country: "Bahrain", flag: "🇧🇭" },
   { name: "Maryam", country: "Bahrain", flag: "🇧🇭" },
   { name: "Abdulla", country: "Bahrain", flag: "🇧🇭" },
   
   // Oman (3)
   { name: "Said", country: "Oman", flag: "🇴🇲" },
   { name: "Fatma", country: "Oman", flag: "🇴🇲" },
   { name: "Rashid", country: "Oman", flag: "🇴🇲" },
   
   // Jordan (3)
   { name: "Ahmad", country: "Jordan", flag: "🇯🇴" },
   { name: "Rania", country: "Jordan", flag: "🇯🇴" },
   { name: "Tariq", country: "Jordan", flag: "🇯🇴" },
   
   // Lebanon (3)
   { name: "Karim", country: "Lebanon", flag: "🇱🇧" },
   { name: "Nadine", country: "Lebanon", flag: "🇱🇧" },
   { name: "Georges", country: "Lebanon", flag: "🇱🇧" },
   
   // Sri Lanka (3)
   { name: "Ashan", country: "Sri Lanka", flag: "🇱🇰" },
   { name: "Chamari", country: "Sri Lanka", flag: "🇱🇰" },
   { name: "Dinesh", country: "Sri Lanka", flag: "🇱🇰" },
   
   // Nepal (3)
   { name: "Arjun", country: "Nepal", flag: "🇳🇵" },
   { name: "Sita", country: "Nepal", flag: "🇳🇵" },
   { name: "Bijay", country: "Nepal", flag: "🇳🇵" },
   
   // Cambodia (3)
   { name: "Sokha", country: "Cambodia", flag: "🇰🇭" },
   { name: "Sreymom", country: "Cambodia", flag: "🇰🇭" },
   { name: "Dara", country: "Cambodia", flag: "🇰🇭" },
   
   // Myanmar (3)
   { name: "Aung", country: "Myanmar", flag: "🇲🇲" },
   { name: "Thiri", country: "Myanmar", flag: "🇲🇲" },
   { name: "Kyaw", country: "Myanmar", flag: "🇲🇲" },
   
   // Croatia (3)
   { name: "Luka", country: "Croatia", flag: "🇭🇷" },
   { name: "Ana", country: "Croatia", flag: "🇭🇷" },
   { name: "Ivan", country: "Croatia", flag: "🇭🇷" },
   
   // Serbia (3)
   { name: "Nikola", country: "Serbia", flag: "🇷🇸" },
   { name: "Milica", country: "Serbia", flag: "🇷🇸" },
   { name: "Stefan", country: "Serbia", flag: "🇷🇸" },
   
   // Bosnia (3)
   { name: "Emir", country: "Bosnia", flag: "🇧🇦" },
   { name: "Amina", country: "Bosnia", flag: "🇧🇦" },
   { name: "Kenan", country: "Bosnia", flag: "🇧🇦" },
   
   // Iceland (3)
   { name: "Jón", country: "Iceland", flag: "🇮🇸" },
   { name: "Guðrún", country: "Iceland", flag: "🇮🇸" },
   { name: "Ólafur", country: "Iceland", flag: "🇮🇸" },
   
   // Ecuador (3)
   { name: "Carlos", country: "Ecuador", flag: "🇪🇨" },
   { name: "María", country: "Ecuador", flag: "🇪🇨" },
   { name: "Andrés", country: "Ecuador", flag: "🇪🇨" },
   
   // Costa Rica (3)
   { name: "José", country: "Costa Rica", flag: "🇨🇷" },
   { name: "Sofía", country: "Costa Rica", flag: "🇨🇷" },
   { name: "Daniel", country: "Costa Rica", flag: "🇨🇷" },
   
   // Dominican Republic (3)
   { name: "Juan", country: "Dominican Republic", flag: "🇩🇴" },
   { name: "Rosa", country: "Dominican Republic", flag: "🇩🇴" },
   { name: "Pedro", country: "Dominican Republic", flag: "🇩🇴" },
 ];
 
 // Get country coordinates from name
 export const getCountryCoords = (countryName: string): { x: number; y: number } => {
   // Find by name in countryCodeMap
   for (const [, info] of Object.entries(countryCodeMap)) {
     if (info.name === countryName) {
       return info.coords;
     }
   }
   return { x: 50, y: 50 }; // Default center
 };
 
 // Get country info from country code
 export const getCountryFromCode = (code: string): CountryInfo | null => {
   return countryCodeMap[code.toUpperCase()] || null;
 };
 
 // Get unique country count
 export const getUniqueCountryCount = (): number => {
   return Object.keys(countryCodeMap).length;
 };
 
 // Round amount to nearest $50 for privacy
 export const roundAmount = (amount: number): number => {
   return Math.round(amount / 50) * 50;
 };
 
 // Extract first name from full name
 export const extractFirstName = (fullName: string | null): string => {
   if (!fullName) return 'Investor';
   return fullName.split(' ')[0];
 };