import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import teslaLogo from '@/assets/tesla-logo-new.png';
import { Menu, X, Zap, TrendingUp, Shield, Users } from 'lucide-react';

const Navbar = () => {
  const { t } = useLanguage();
  const location = useLocation();
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
    { name: t('home'), href: '/', icon: Zap },
    { name: t('about'), href: '#about', icon: Users },
    { name: t('investments'), href: '#investments', icon: TrendingUp },
    { name: t('security'), href: '#security', icon: Shield },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl' 
          : 'bg-slate-900/80 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300"
          >
            <img src={teslaLogo} alt="Tesla" className="h-8 md:h-10 w-auto" />
            <span className="hidden lg:block text-xs text-slate-500 border-l border-slate-600 pl-3">
              Trusted Tesla Stock Gateway
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-slate-400 hover:text-white transition-all duration-300 group py-2"
              >
                <span className="flex items-center gap-1">
                  <link.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-tesla-red" />
                  {link.name}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-tesla-red to-electric-blue group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Right Side - NO Admin link visible */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
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
          <button
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </div>
          </button>
        </div>

        {/* Mobile Menu - NO Admin link visible */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-2 py-4 border-t border-slate-700 bg-slate-900/95">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5 text-tesla-red" />
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-2 px-4 pt-4 border-t border-slate-700 mt-2">
              <LanguageSelector />
              <Link to="/auth" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">{t('signIn')}</Button>
              </Link>
              <Link to="/dashboard" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full">{t('dashboard')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Border Line - Grey */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />
    </nav>
  );
};

export default Navbar;
