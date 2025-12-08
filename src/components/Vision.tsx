import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import elonCeo from "@/assets/elon-ceo.jpeg";

const Vision = () => {
  return (
    <section id="about" className="py-32 relative overflow-hidden bg-gradient-to-b from-muted/20 via-background to-muted/20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Vision
            </h2>
            <p className="text-xl text-muted-foreground">
              Why Elon Musk is betting everything on sustainable energy
            </p>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-card border-border/50 animate-slide-up hover:shadow-glow-combined transition-all duration-500 group">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-tesla-red/50 group-hover:border-tesla-red transition-colors duration-500">
                  <img 
                    src={elonCeo} 
                    alt="Elon Musk" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-tesla-red rounded-full p-2">
                  <Quote className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <blockquote className="text-xl md:text-2xl font-light leading-relaxed text-foreground mb-6 italic">
                  "The future we're building is one where sustainable transport isn't just an option—it's 
                  the only way forward. Every Tesla on the road is a step toward energy independence 
                  and a healthier planet."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-1 w-20 bg-gradient-accent rounded-full"></div>
                  <div>
                    <p className="font-bold text-lg">Elon Musk</p>
                    <p className="text-muted-foreground">CEO, Tesla & SpaceX</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { title: "Sustainable Energy", desc: "Accelerating the world's transition to renewable energy" },
              { title: "Autonomous Future", desc: "Full self-driving technology changing transportation" },
              { title: "Global Scale", desc: "Manufacturing excellence with Gigafactories worldwide" },
            ].map((item, index) => (
              <Card 
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border/30 hover:border-accent/50 hover:shadow-glow-blue transition-all duration-300 animate-slide-up group hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-tesla-red transition-colors">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
