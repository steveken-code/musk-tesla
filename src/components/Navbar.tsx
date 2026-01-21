import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import GoogleTranslate from './GoogleTranslate';
import PriceTicker from './PriceTicker';
import teslaLogo from '@/assets/tesla-logo-new.png';
import { Menu, X, Zap, TrendingUp, Shield, HelpCircle, Info, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('home'), href: '/', icon: Zap, isAnchor: false },
    { name: t('about'), href: '/about', icon: Info, isAnchor: false },
    { name: 'Live Activity', href: '/live-activity', icon: Activity, isAnchor: false },
    { name: 'Features', href: '#features', icon: TrendingUp, isAnchor: true },
    { name: 'How It Works', href: '#how-it-works', icon: Shield, isAnchor: true },
    { name: 'FAQ', href: '#faq', icon: HelpCircle, isAnchor: true },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 80; // Account for fixed navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsMobileMenuOpen(false);
    
    if (link.isAnchor) {
      // If we're not on the home page, navigate there first
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation then scroll
        setTimeout(() => {
          scrollToSection(link.href);
        }, 150);
      } else {
        // Already on home page, just scroll
        scrollToSection(link.href);
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background isolate">
      <nav className="bg-background supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 border-b border-border shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group pt-1"
          >
            <img src={teslaLogo} alt="Tesla" className="h-14 md:h-16 w-auto brightness-150 drop-shadow-lg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              link.isAnchor ? (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className="relative text-slate-400 hover:text-white transition-all duration-300 group py-2 cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <link.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-tesla-red" />
                    {link.name}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-tesla-red to-electric-blue group-hover:w-full transition-all duration-300" />
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative text-slate-400 hover:text-white transition-all duration-300 group py-2"
                >
                  <span className="flex items-center gap-1">
                    <link.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-tesla-red" />
                    {link.name}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-tesla-red to-electric-blue group-hover:w-full transition-all duration-300" />
                </Link>
              )
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <GoogleTranslate />
            <Link to="/auth">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-tesla-red hover:scale-105 transition-all duration-300"
              >
                {t('signIn')}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="hero" 
                size="sm" 
                className="hover:scale-105 transition-transform shadow-lg shadow-tesla-red/25"
              >
                {t('dashboard')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              <motion.div 
                className="flex flex-col gap-2 py-4 border-t border-slate-700 bg-slate-900/95"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {navLinks.map((link, index) => (
                  link.isAnchor ? (
                    <motion.button
                      key={link.name}
                      onClick={() => handleNavClick(link)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300 text-left active:scale-[0.98]"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <link.icon className="w-5 h-5 text-tesla-red" />
                      {link.name}
                    </motion.button>
                  ) : (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300 active:scale-[0.98]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="w-5 h-5 text-tesla-red" />
                        {link.name}
                      </Link>
                    </motion.div>
                  )
                ))}
                <motion.div 
                  className="flex items-center gap-2 px-4 pt-4 border-t border-slate-700 mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  <GoogleTranslate />
                  <Link to="/auth" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">{t('signIn')}</Button>
                  </Link>
                  <Link to="/dashboard" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full">{t('dashboard')}</Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </nav>
      <PriceTicker />
    </div>
  );
};

export default Navbar;