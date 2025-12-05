import whatsappIcon from '@/assets/whatsapp-icon.png';

const WhatsAppButton = () => {
  const phoneNumber = '+12186500840';
  const message = encodeURIComponent('Hello! I would like to learn more about Tesla investments.');
  const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`;

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