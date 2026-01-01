import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, User, Sparkles, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/tesla-hero.jpg";
import elonHero from "@/assets/elon-hero.webp";

const slides = [
  { image: heroImage, alt: "Tesla on a futuristic highway" },
  { image: elonHero, alt: "Elon Musk presenting Tesla" },
];

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
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const stats = [
    { value: "$850B+", label: "Market Cap" },
    { value: "2.5M+", label: "Active Investors" },
    { value: "18,000%", label: "Since IPO" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slider */}
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80"></div>
        </div>
      ))}

      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-[1] opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>


      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-tesla-red w-8"
                : "bg-muted-foreground/40 w-2 hover:bg-muted-foreground"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-gradient-to-r from-tesla-red/20 to-electric-blue/20 backdrop-blur-sm border border-tesla-red/30 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-tesla-red" />
            <span className="text-sm font-medium text-foreground">TSLA +$247.03 (12.4%) {t('yearToDate')}</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight font-display leading-[1.1]"
          >
            <span className="block text-foreground mb-2">Invest in the</span>
            <span className="block bg-gradient-to-r from-tesla-red via-orange-500 to-electric-blue bg-clip-text text-transparent">
              Future of Electric Mobility
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Trade and track Tesla stocks in real-time. Join thousands of investors 
            capitalizing on Tesla's revolutionary growth.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link to="/auth">
              <Button size="lg" className="group px-8 py-6 text-lg bg-gradient-to-r from-tesla-red to-red-600 hover:from-red-600 hover:to-tesla-red border-0 shadow-lg shadow-tesla-red/25">
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-tesla-red/50">
                <User className="mr-2 w-5 h-5" />
                Create Account
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-12 text-muted-foreground text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>SEC Regulated</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-electric-blue" />
              <span>Instant Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-tesla-red" />
              <span>Real-time Trading</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-tesla-red/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute top-20 right-0 w-72 h-72 md:w-[500px] md:h-[500px] bg-electric-blue/10 rounded-full blur-[120px] animate-pulse"></div>
    </section>
  );
};

export default Hero;
