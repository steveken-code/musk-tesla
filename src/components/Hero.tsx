import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
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
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        </div>
      ))}

      {/* Slider Controls - Positioned at the "future" level */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-[45%] -translate-y-1/2 z-20 p-2 sm:p-3 bg-card/50 backdrop-blur-sm border border-border rounded-full hover:bg-card/80 transition-all hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-[45%] -translate-y-1/2 z-20 p-2 sm:p-3 bg-card/50 backdrop-blur-sm border border-border rounded-full hover:bg-card/80 transition-all hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-tesla-red w-8"
                : "bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-card/50 backdrop-blur-sm border border-border rounded-full">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">TSLA +$247.03 (12.4%) {t('yearToDate')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight font-display">
            <span className="block text-foreground">{t('heroTitle').split(' ').slice(0, 2).join(' ')}</span>
            <span className="block mt-2 bg-gradient-to-r from-tesla-red via-orange-500 to-electric-blue bg-clip-text text-transparent animate-glow-pulse font-extrabold">
              {t('heroTitle').split(' ').slice(2).join(' ') || 'Future'}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="group">
                {t('getStarted')}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero-outline" size="lg">
                {t('dashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-72 h-72 md:w-96 md:h-96 bg-accent/20 rounded-full blur-3xl animate-glow-pulse"></div>
      <div className="absolute top-20 right-0 w-72 h-72 md:w-96 md:h-96 bg-primary/20 rounded-full blur-3xl animate-glow-pulse"></div>
    </section>
  );
};

export default Hero;
