import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Investment = () => {
  const { t } = useLanguage();

  const reasons = [
    t('reason1') || "Market leader in EV industry with 20%+ market share",
    t('reason2') || "Vertically integrated manufacturing reducing costs",
    t('reason3') || "Growing energy storage and solar business",
    t('reason4') || "Expanding AI and autonomous driving capabilities",
    t('reason5') || "Strong brand loyalty and customer satisfaction",
    t('reason6') || "Global expansion with new Gigafactories",
  ];

  return (
    <section id="investments" className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {t('whyInvest') || 'Why Invest in Tesla?'}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              {t('sixReasons') || 'Six compelling reasons to consider Tesla for your portfolio'}
            </p>
          </div>

          <Card className="p-6 md:p-8 lg:p-12 bg-gradient-card border-border/50 mb-12 animate-slide-up hover:shadow-glow-combined transition-all duration-500">
            <div className="space-y-3 md:space-y-4 mb-8">
              {reasons.map((reason, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg hover:bg-muted/30 transition-all duration-300 hover:translate-x-2 group"
                >
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <p className="text-sm md:text-base lg:text-lg text-foreground">{reason}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 md:pt-8 border-t border-border/50">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="group hover:scale-105 transition-transform w-full sm:w-auto">
                    {t('getStartedToday') || 'Get Started Today'}
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="hero-outline" size="lg" className="hover:scale-105 transition-transform w-full sm:w-auto">
                  {t('downloadProspectus') || 'Download Prospectus'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Investment;
