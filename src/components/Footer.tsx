import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Shield, FileText, Scale, Building, ArrowRight, Twitter, Linkedin, Youtube } from 'lucide-react';
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

      {/* Newsletter Section */}
      <div className="border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to start investing?</h3>
              <p className="text-slate-400">Join thousands of investors growing their wealth with Tesla.</p>
            </div>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-tesla-red to-red-600 hover:from-red-600 hover:to-tesla-red border-0 group">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img src={teslaLogo} alt="Tesla Stock" className="h-14 w-auto brightness-110" />
            </Link>
            <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
              {t('footerDescription')}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mb-8">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  className="p-3 bg-slate-800/50 rounded-lg hover:bg-tesla-red/20 transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-slate-400 group-hover:text-tesla-red transition-colors" />
                </motion.a>
              ))}
            </div>

            <div className="space-y-3">
              <a href="mailto:support@teslastock.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 text-tesla-red group-hover:scale-110 transition-transform" />
                support@teslastock.com
              </a>
              <a href="tel:+12186500840" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                <Phone className="w-5 h-5 text-electric-blue group-hover:scale-110 transition-transform" />
                +1 (218) 650-0840
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-tesla-red" />
                3500 Deer Creek Road, Palo Alto, CA 94304
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
              <Building className="w-5 h-5 text-tesla-red" />
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
              <Scale className="w-5 h-5 text-tesla-red" />
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
              <Shield className="w-10 h-10 text-tesla-red" />
              <div>
                <p className="font-semibold text-sm text-white">{t('regulatedEntity')}</p>
                <p className="text-xs text-slate-500">{t('licenseNumber')}: 2024/INV/001234</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400">
                © 2024 Tesla Stock LLC. {t('allRightsReserved')}
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
