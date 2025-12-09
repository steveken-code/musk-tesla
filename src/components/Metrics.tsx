import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  isVisible: boolean;
}

const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "", isVisible }: CounterProps) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const Metrics = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const metrics = [
    {
      icon: DollarSign,
      label: t('marketCap') || "Market Cap",
      value: 789.5,
      prefix: "$",
      suffix: "B",
      change: "+12.4%",
      positive: true,
    },
    {
      icon: TrendingUp,
      label: t('stockPrice') || "Stock Price",
      value: 247,
      prefix: "$",
      suffix: "",
      change: "+$27.14",
      positive: true,
    },
    {
      icon: Users,
      label: t('globalDeliveries') || "Global Deliveries",
      value: 1.8,
      prefix: "",
      suffix: "M+",
      change: "2024 Target",
      positive: true,
    },
    {
      icon: Zap,
      label: t('superchargers') || "Superchargers",
      value: 50,
      prefix: "",
      suffix: "K+",
      change: "Worldwide",
      positive: true,
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 relative bg-section-light">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className={`p-4 md:p-6 bg-gradient-card border-border/50 hover:border-accent/50 transition-all duration-500 hover:shadow-glow-blue group hover:-translate-y-2 ${
                isVisible ? "animate-fade-in" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors group-hover:scale-110 duration-300">
                  <metric.icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                  {metric.label}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    <AnimatedCounter
                      end={metric.value < 10 ? metric.value * 10 : metric.value}
                      prefix={metric.prefix}
                      suffix={metric.value < 10 ? `.${Math.round((metric.value % 1) * 10)}${metric.suffix}` : metric.suffix}
                      isVisible={isVisible}
                    />
                  </p>
                  <p
                    className={`text-xs md:text-sm font-medium ${
                      metric.positive ? "text-accent" : "text-destructive"
                    }`}
                  >
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
