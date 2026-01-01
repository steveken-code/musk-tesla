import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  isVisible: boolean;
}

const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "", decimals = 0, isVisible }: CounterProps) => {
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
      setCount(easeOut * end);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return <span>{prefix}{displayValue}{suffix}</span>;
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
      decimals: 1,
      change: "+12.4%",
      positive: true,
    },
    {
      icon: TrendingUp,
      label: t('stockPrice') || "Stock Price",
      value: 247,
      prefix: "$",
      suffix: "",
      decimals: 0,
      change: "+$27.14",
      positive: true,
    },
    {
      icon: Users,
      label: t('globalDeliveries') || "Global Deliveries",
      value: 1.8,
      prefix: "",
      suffix: "M+",
      decimals: 1,
      change: "2024 Target",
      positive: true,
    },
    {
      icon: Zap,
      label: t('superchargers') || "Superchargers",
      value: 50,
      prefix: "",
      suffix: "K+",
      decimals: 0,
      change: "Worldwide",
      positive: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section ref={sectionRef} className="py-20 relative bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {metrics.map((metric, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="p-4 md:p-6 glass-card group hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
                  <motion.div 
                    className="p-2 md:p-3 bg-electric-blue/10 rounded-lg group-hover:bg-electric-blue/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <metric.icon className="w-5 h-5 md:w-6 md:h-6 text-electric-blue" />
                  </motion.div>
                  <span className="text-xs md:text-sm text-slate-400 uppercase tracking-wider">
                    {metric.label}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                      <AnimatedCounter
                        end={metric.value}
                        prefix={metric.prefix}
                        suffix={metric.suffix}
                        decimals={metric.decimals}
                        isVisible={isVisible}
                      />
                    </p>
                    <p className={`text-xs md:text-sm font-medium ${
                      metric.positive ? "text-green-400" : "text-red-400"
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Metrics;
