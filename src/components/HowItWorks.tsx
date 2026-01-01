import { UserPlus, CreditCard, LineChart, Wallet } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up in under 2 minutes with your email. Verification is quick and secure.',
    },
    {
      step: 2,
      icon: CreditCard,
      title: 'Fund Your Wallet',
      description: 'Deposit funds via bank transfer, credit card, or cryptocurrency.',
    },
    {
      step: 3,
      icon: LineChart,
      title: 'Invest in Tesla',
      description: 'Purchase Tesla shares starting from just $100 with instant confirmation.',
    },
    {
      step: 4,
      icon: Wallet,
      title: 'Grow & Withdraw',
      description: 'Watch your investment grow and withdraw profits anytime you want.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-gradient-to-b from-slate-950 to-slate-900 relative">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="text-electric-blue font-semibold text-sm uppercase tracking-widest mb-4">
            Getting Started
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Start your investment journey in four simple steps.
          </p>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.15} direction="up">
                <div className="relative text-center glass-card rounded-2xl p-6">
                  {/* Step number */}
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-tesla-red to-tesla-red/70 flex items-center justify-center shadow-lg shadow-tesla-red/20">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="text-tesla-red font-bold text-sm mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
