import { UserPlus, ShoppingCart, LineChart, Wallet } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your free account in under 2 minutes with just your email.',
    },
    {
      number: '02',
      icon: ShoppingCart,
      title: 'Buy Tesla Shares',
      description: 'Invest in Tesla stock starting from just $100 with instant confirmation.',
    },
    {
      number: '03',
      icon: LineChart,
      title: 'Track Performance',
      description: 'Monitor your portfolio growth in real-time with detailed analytics.',
    },
    {
      number: '04',
      icon: Wallet,
      title: 'Withdraw Profits',
      description: 'Cash out your earnings anytime via crypto or bank transfer.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-background to-background" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-tesla-red/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-electric-blue bg-electric-blue/10 rounded-full border border-electric-blue/20">
            Getting Started
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Start investing in Tesla stock in just 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-border via-tesla-red/50 to-border z-0" />
              )}
              
              <div className="relative bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-8 hover:border-tesla-red/50 transition-all duration-500 group-hover:-translate-y-2">
                {/* Step number */}
                <span className="absolute -top-4 -right-4 text-6xl font-black text-tesla-red/10 group-hover:text-tesla-red/20 transition-colors">
                  {step.number}
                </span>
                
                <div className="relative z-10">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-tesla-red/20 to-electric-blue/20 border border-tesla-red/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-6 h-6 text-tesla-red" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
