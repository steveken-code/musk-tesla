import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import teslaLogo from '@/assets/tesla-logo.png';
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
          ? 'bg-card/95 backdrop-blur-xl border-b border-border shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group hover:scale-105 transition-transform duration-300"
          >
            <img src={teslaLogo} alt="Tesla Invest" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-tesla-red to-electric-blue bg-clip-text text-transparent">
              Tesla Invest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-muted-foreground hover:text-foreground transition-colors duration-300 group"
              >
                <span className="flex items-center gap-1">
                  <link.icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.name}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-tesla-red to-electric-blue group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                {t('signIn')}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero" size="sm" className="hover:scale-105 transition-transform">
                {t('dashboard')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            isMobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-2 pt-4 border-t border-border">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5 text-tesla-red" />
                {link.name}
              </a>
            ))}
            <div className="flex items-center gap-2 px-4 pt-4 border-t border-border mt-2">
              <LanguageSelector />
              <Link to="/auth" className="flex-1">
                <Button variant="outline" className="w-full">{t('signIn')}</Button>
              </Link>
              <Link to="/dashboard" className="flex-1">
                <Button variant="hero" className="w-full">{t('dashboard')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
