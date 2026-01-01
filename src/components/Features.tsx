import { Shield, Zap, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedSection from '@/components/AnimatedSection';

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Shield,
      title: 'Secure & Fast Transactions',
      description: 'Bank-level encryption protects your investments with instant processing and real-time confirmation.',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Withdraw your profits instantly via cryptocurrency or direct bank transfer. No delays, no hidden fees.',
      gradient: 'from-tesla-red to-orange-500',
    },
    {
      icon: Smartphone,
      title: 'Mobile-Friendly Dashboard',
      description: 'Track your Tesla stock investments anywhere, anytime. Optimized for all devices with real-time updates.',
      gradient: 'from-electric-blue to-cyan-500',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-background via-slate-900/50 to-background">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-tesla-red bg-tesla-red/10 rounded-full border border-tesla-red/20">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Built for <span className="text-gradient">Modern Investors</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Experience the future of Tesla stock trading with cutting-edge technology and unmatched security.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.15} direction="up">
              <div className="group relative bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 hover:border-tesla-red/50 transition-all duration-500 hover:-translate-y-2 h-full">
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-tesla-red transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tesla-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
