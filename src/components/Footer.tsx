import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Shield, FileText, Scale, Building, ArrowRight, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import teslaLogo from '@/assets/tesla-logo-new.png';

const Footer = () => {
  const { t } = useLanguage();

  const footerLinks = {
    company: [
      { name: t('aboutUs'), href: '/about' },
      { name: t('ourTeam'), href: '#team' },
      { name: t('careers'), href: '#careers' },
      { name: t('contact'), href: '#contact' },
    ],
    legal: [
      { name: t('termsOfService'), href: '#terms' },
      { name: t('privacyPolicy'), href: '#privacy' },
      { name: t('riskDisclosure'), href: '#risk' },
      { name: t('cookiePolicy'), href: '#cookies' },
    ],
    regulatory: [
      { name: t('license'), href: '#license' },
      { name: t('compliance'), href: '#compliance' },
      { name: t('amlPolicy'), href: '#aml' },
      { name: t('investorProtection'), href: '#protection' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-tesla-red/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-blue/5 rounded-full blur-[150px]" />


      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img src={teslaLogo} alt="Tesla Stock" className="h-20 md:h-24 w-auto brightness-150 drop-shadow-lg" />
            </Link>
            <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
              Tesla Stock is a premier investment platform specializing in electric vehicle and sustainable energy stocks. We provide secure, transparent, and profitable investment opportunities.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mb-8">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="p-5 bg-slate-800/50 rounded-lg hover:bg-electric-blue/20 transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-9 h-9 text-slate-400 group-hover:text-electric-blue transition-colors" />
                </motion.a>
              ))}
            </div>

            <div className="space-y-3">
              <a href="mailto:support@msktesla.net" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 text-electric-blue group-hover:scale-110 transition-transform" />
                support@msktesla.net
              </a>
              <a href="tel:+12186500840" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <Phone className="w-5 h-5 text-electric-blue group-hover:scale-110 transition-transform" />
                +1 (218) 650-0840
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-electric-blue" />
                3500 Deer Creek Road, Palo Alto, CA 94304
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <Building className="w-5 h-5 text-electric-blue" />
              {t('company')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-slate-400 hover:text-white hover:pl-2 transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-electric-blue" />
              {t('legal')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-400 hover:text-white hover:pl-2 transition-all duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Regulatory Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <Scale className="w-5 h-5 text-electric-blue" />
              {t('regulatory')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.regulatory.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-slate-400 hover:text-white hover:pl-2 transition-all duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Shield className="w-14 h-14 text-electric-blue" />
              <div>
                <p className="font-semibold text-sm text-white">{t('regulatedEntity')}</p>
                <p className="text-xs text-slate-500">{t('licenseNumber')}: 2024/INV/001234</p>
              </div>
            </div>
            
            {/* Language Reset Link */}
            <button
              onClick={() => {
                // Remove Google Translate cookies and reload
                document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.lovable.app;';
                window.location.reload();
              }}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-electric-blue transition-colors"
            >
              <Globe className="w-4 h-4" />
              Reset to English
            </button>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400">
                © 2024 Tesla Stock. {t('allRightsReserved')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('registrationInfo')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
