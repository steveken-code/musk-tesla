import { useLocation } from 'react-router-dom';
import whatsappIcon from '@/assets/whatsapp-icon.png';

const WhatsAppButton = () => {
  const location = useLocation();
  const phoneNumber = '+12186500840';
  
  // Pages where user is in investment/dashboard area - no pre-filled message
  const investmentPages = ['/dashboard', '/admin', '/transaction-history'];
  const isInvestmentArea = investmentPages.some(page => location.pathname.startsWith(page));
  
  // Only include the message when user is on main website pages (not in investment dashboard)
  const message = isInvestmentArea 
    ? '' 
    : encodeURIComponent('Hello! I would like to learn more about Tesla stocks.');
  
  const whatsappUrl = message 
    ? `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`
    : `https://wa.me/${phoneNumber.replace('+', '')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 hover:scale-105 transition-transform"
      aria-label="Contact us on WhatsApp"
    >
      <img src={whatsappIcon} alt="WhatsApp" className="w-14 h-14 rounded-full shadow-lg" />
    </a>
  );
};

export default WhatsAppButton;