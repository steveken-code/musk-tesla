import { Card } from "@/components/ui/card";
import { Battery, Cpu, Globe, Rocket } from "lucide-react";

const innovations = [
  {
    icon: Battery,
    title: "Battery Technology",
    description: "Revolutionary 4680 cells delivering longer range, faster charging, and lower costs",
    stat: "500+ miles range",
  },
  {
    icon: Cpu,
    title: "AI & Full Self-Driving",
    description: "Neural networks processing real-world data to achieve autonomous driving",
    stat: "150M+ miles driven",
  },
  {
    icon: Globe,
    title: "Global Supercharger Network",
    description: "The world's fastest EV charging network with strategic global coverage",
    stat: "50K+ stations",
  },
  {
    icon: Rocket,
    title: "SpaceX Synergy",
    description: "Cross-innovation between Tesla and SpaceX driving breakthrough technologies",
    stat: "Multi-planetary vision",
  },
];

const Innovations = () => {
  return (
    <section className="py-32 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Leading Innovation
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tesla's technological breakthroughs are reshaping entire industries
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {innovations.map((innovation, index) => (
            <Card 
              key={index}
              className="p-8 bg-gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-glow-blue group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-6">
                <div className="inline-flex p-4 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                  <innovation.icon className="w-8 h-8 text-accent" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-3">{innovation.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {innovation.description}
              </p>
              
              <div className="pt-4 border-t border-border/50">
                <span className="text-accent font-bold">{innovation.stat}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Innovations;
