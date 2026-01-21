import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine, 
  History, TrendingUp, Signal, Settings, LogOut, User, ChevronRight,
  Home, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import teslaLogo from '@/assets/tesla-logo-red.png';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onWithdrawClick?: () => void;
  userEmail?: string;
  userName?: string;
}

const DashboardSidebar = ({ isOpen, onClose, onSignOut, onWithdrawClick, userEmail, userName }: DashboardSidebarProps) => {
  const { t } = useLanguage();
  const location = useLocation();

  interface MenuItem {
    icon: typeof LayoutDashboard;
    label: string;
    href: string;
    active?: boolean;
    action?: 'scroll' | 'modal';
  }

  interface MenuSection {
    title: string | null;
    items: MenuItem[];
  }

  const menuSections: MenuSection[] = [
    {
      title: null,
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: location.pathname === '/dashboard' },
      ]
    },
    {
      title: 'FINANCE MANAGEMENT',
      items: [
        { icon: ArrowDownToLine, label: 'Deposit', href: '#deposit', action: 'scroll' },
        { icon: ArrowUpFromLine, label: 'Withdraw', href: '#withdraw', action: 'modal' },
        { icon: History, label: 'Transactions', href: '/history' },
      ]
    },
    {
      title: 'TRADING & INVESTMENTS',
      items: [
        { icon: TrendingUp, label: 'Trading Plans', href: '#plans', action: 'scroll' },
        { icon: Signal, label: 'Trade Signals', href: '/live-activity' },
      ]
    },
    {
      title: 'NAVIGATION',
      items: [
        { icon: Home, label: t('home'), href: '/' },
        { icon: Activity, label: 'Live Activity', href: '/live-activity' },
      ]
    },
  ];

  const handleNavClick = (item: MenuItem) => {
    if (item.action === 'modal' && item.href === '#withdraw') {
      // Trigger withdrawal modal
      onWithdrawClick?.();
      onClose();
    } else if (item.action === 'scroll') {
      // Scroll to section on dashboard
      const sectionId = item.href.replace('#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <img src={teslaLogo} alt="Tesla" className="h-8 w-auto" />
                <span className="font-bold text-foreground text-lg">Tesla Trading</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tesla-red to-electric-blue flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {userName || 'Investor'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {userEmail || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4">
                  {section.title && (
                    <p className="px-4 mb-2 text-xs font-bold text-muted-foreground tracking-wider">
                      {section.title}
                    </p>
                  )}
                  <div className="space-y-1 px-2">
                    {section.items.map((item, itemIndex) => (
                      item.action === 'scroll' || item.action === 'modal' ? (
                        <button
                          key={itemIndex}
                          onClick={() => handleNavClick(item)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            item.active
                              ? 'bg-tesla-red/20 text-tesla-red border-l-4 border-tesla-red'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </button>
                      ) : (
                        <Link
                          key={itemIndex}
                          to={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            item.active
                              ? 'bg-tesla-red/20 text-tesla-red border-l-4 border-tesla-red'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">{item.label}</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border space-y-2">
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
              <button
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DashboardSidebar;
