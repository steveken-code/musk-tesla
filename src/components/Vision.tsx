import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import elonCeo from "@/assets/elon-ceo.jpeg";

const Vision = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden section-light">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              {t('visionTitle') || 'The Vision'}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              {t('visionSubtitle') || 'Why Elon Musk is betting everything on sustainable energy'}
            </p>
          </div>

          <Card className="p-6 md:p-8 lg:p-12 bg-card border-border/50 animate-slide-up hover:shadow-glow-combined transition-all duration-500 group">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-tesla-red/50 group-hover:border-tesla-red transition-colors duration-500">
                  <img 
                    src={elonCeo} 
                    alt="Elon Musk" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-tesla-red rounded-full p-2">
                  <Quote className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <blockquote className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-foreground mb-6 italic">
                  "{t('ceoQuote') || 'The future we\'re building is one where sustainable transport isn\'t just an option—it\'s the only way forward.'}"
                </blockquote>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="h-1 w-16 md:w-20 bg-gradient-accent rounded-full"></div>
                  <div>
                    <p className="font-bold text-base md:text-lg text-foreground">Elon Musk</p>
                    <p className="text-muted-foreground text-sm">CEO, Tesla & SpaceX</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-12">
            {[
              { title: t('sustainableEnergy') || "Sustainable Energy", desc: t('sustainableEnergyDesc') || "Accelerating the world's transition to renewable energy" },
              { title: t('autonomousFuture') || "Autonomous Future", desc: t('autonomousFutureDesc') || "Full self-driving technology changing transportation" },
              { title: t('globalScale') || "Global Scale", desc: t('globalScaleDesc') || "Manufacturing excellence with Gigafactories worldwide" },
            ].map((item, index) => (
              <Card 
                key={index}
                className="p-5 md:p-6 bg-card/90 backdrop-blur-sm border-border/30 hover:border-accent/50 hover:shadow-glow-blue transition-all duration-300 animate-slide-up group hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-tesla-red transition-colors text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
