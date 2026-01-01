import { Shield, Zap, Smartphone, TrendingUp, Clock, HeadphonesIcon } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your investments are protected with 256-bit encryption and multi-factor authentication.',
    },
    {
      icon: Zap,
      title: 'Instant Transactions',
      description: 'Execute trades in milliseconds with our high-performance trading infrastructure.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Full-featured trading experience on any device, anywhere in the world.',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Track your portfolio performance with live charts and detailed insights.',
    },
    {
      icon: Clock,
      title: 'Fast Withdrawals',
      description: 'Access your funds within 24 hours via bank transfer or cryptocurrency.',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Dedicated support team available around the clock to assist you.',
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <p className="text-tesla-red font-semibold text-sm uppercase tracking-widest mb-4">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything You Need to Invest
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A complete platform designed for both beginners and experienced investors.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.1} direction="up">
              <div className="group bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-tesla-red/10 flex items-center justify-center mb-6 group-hover:bg-tesla-red/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-tesla-red" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
