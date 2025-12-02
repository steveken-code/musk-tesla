import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Zap } from "lucide-react";

const metrics = [
  {
    icon: DollarSign,
    label: "Market Cap",
    value: "$789.5B",
    change: "+12.4%",
    positive: true,
  },
  {
    icon: TrendingUp,
    label: "Stock Price",
    value: "$247.03",
    change: "+$27.14",
    positive: true,
  },
  {
    icon: Users,
    label: "Global Deliveries",
    value: "1.8M+",
    change: "2024 Target",
    positive: true,
  },
  {
    icon: Zap,
    label: "Superchargers",
    value: "50K+",
    change: "Worldwide",
    positive: true,
  },
];

const Metrics = () => {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {metrics.map((metric, index) => (
            <Card 
              key={index}
              className="p-6 bg-gradient-card border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-glow-blue group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                  <metric.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  {metric.label}
                </span>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {metric.value}
                  </p>
                  <p className={`text-sm font-medium ${
                    metric.positive ? 'text-accent' : 'text-destructive'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;
