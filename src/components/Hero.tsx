import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, User, Sparkles, Shield, Zap, BarChart3, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/tesla-hero.jpg";
import elonHero from "@/assets/elon-hero.webp";

const slides = [
  { image: heroImage, alt: "Tesla on a futuristic highway" },
  { image: elonHero, alt: "Elon Musk presenting Tesla" },
];

// Animated counter component
const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="tabular-nums"
    >
      {prefix}{value}{suffix}
    </motion.span>
  );
};

const Hero = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  const stats = [
    { value: "$1.2T", label: "Market Cap", icon: BarChart3, color: "text-tesla-red" },
    { value: "2.8M+", label: "Active Investors", icon: Globe, color: "text-electric-blue" },
    { value: "18,500%", label: "Since IPO", icon: TrendingUp, color: "text-green-500" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slider with enhanced overlay */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover scale-105"
          />
          {/* Multi-layer gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/75 to-background"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]"></div>
        </div>
      ))}

      {/* Professional Trading Grid Background */}
      <div className="absolute inset-0 z-[1]">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} 
        />
        {/* Animated scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-tesla-red/30 to-transparent"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-tesla-red w-8 shadow-[0_0_10px_hsl(var(--tesla-red))]"
                : "bg-muted-foreground/30 w-1.5 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 pt-28 sm:pt-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Premium Investment Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 mb-6 sm:mb-8 bg-gradient-to-r from-tesla-red/10 via-orange-500/10 to-electric-blue/10 backdrop-blur-md border border-tesla-red/20 rounded-full shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-tesla-red animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-foreground tracking-wide">
              Professional Investment Platform
            </span>
          </motion.div>

          {/* Main Headline with enhanced typography */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 tracking-tight font-display leading-[1.1]"
          >
            <span className="block text-foreground mb-2">{t('heroTitle')}</span>
            <span className="block relative">
              <span className="bg-gradient-to-r from-tesla-red via-orange-500 to-electric-blue bg-clip-text text-transparent">
                {t('heroTitleHighlight')}
              </span>
              {/* Glow effect under text */}
              <span className="absolute inset-0 bg-gradient-to-r from-tesla-red via-orange-500 to-electric-blue bg-clip-text text-transparent blur-2xl opacity-30 -z-10">
                {t('heroTitleHighlight')}
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4"
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* CTA Buttons with premium styling */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4"
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="group w-full sm:w-auto px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-bold tracking-wide bg-gradient-to-r from-tesla-red via-red-500 to-tesla-red hover:from-red-600 hover:via-tesla-red hover:to-red-600 border-0 shadow-2xl shadow-tesla-red/30 hover:shadow-tesla-red/50 transition-all duration-500 hover:scale-[1.02] rounded-xl"
              >
                <span className="relative z-10">{t('getStarted')}</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="group w-full sm:w-auto px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold border-2 border-foreground/30 bg-card/60 backdrop-blur-md text-foreground hover:bg-card/80 hover:border-tesla-red/60 hover:shadow-xl transition-all duration-500 rounded-xl"
              >
                <User className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                {t('createAccount')}
              </Button>
            </Link>
          </motion.div>

          {/* Professional Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-3xl mx-auto px-2"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="group relative text-center p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-card/40 backdrop-blur-md border border-border/30 hover:border-border/60 hover:bg-card/60 transition-all duration-300"
                whileHover={{ y: -4, scale: 1.02 }}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-background to-card mb-2 sm:mb-3 ${stat.color}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {/* Value */}
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-0.5 sm:mb-1 tracking-tight">
                  {stat.value}
                </div>
                {/* Label */}
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
                
                {/* Subtle glow on hover */}
                <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${
                  index === 0 ? 'from-tesla-red/5' : index === 1 ? 'from-electric-blue/5' : 'from-green-500/5'
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10`}></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-10 sm:mt-12 text-muted-foreground text-xs sm:text-sm px-4"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/5 border border-green-500/20">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
              <span className="font-medium">SEC Regulated</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-blue/5 border border-electric-blue/20">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-electric-blue" />
              <span className="font-medium">Instant Deposits</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tesla-red/5 border border-tesla-red/20">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tesla-red" />
              <span className="font-medium">Real-time Trading</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-72 h-72 md:w-[600px] md:h-[600px] bg-tesla-red/8 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-20 right-0 w-72 h-72 md:w-[600px] md:h-[600px] bg-electric-blue/8 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[800px] md:h-[800px] bg-gradient-to-r from-tesla-red/3 via-transparent to-electric-blue/3 rounded-full blur-[200px] pointer-events-none"></div>
    </section>
  );
};

export default Hero;