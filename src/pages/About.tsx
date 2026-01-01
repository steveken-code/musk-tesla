import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, TrendingUp, Users, Globe, Award, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import teslaLogo from '@/assets/tesla-logo-new.png';
import elonImage from '@/assets/elon-ceo.jpeg';

const About = () => {
  const { t } = useLanguage();

  const stats = [
    { value: '$2.5B+', label: 'Assets Under Management' },
    { value: '150K+', label: 'Active Investors' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '24/7', label: 'Customer Support' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Bank-level encryption and multi-factor authentication protect every transaction.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Focused',
      description: 'Maximize your returns with our advanced trading algorithms and market insights.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of investors building wealth together through Tesla stock.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Invest from anywhere in the world with support for multiple currencies.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            <img src={teslaLogo} alt="Tesla Stock" className="h-8 w-auto brightness-125" />
          </Link>
          <Link to="/auth">
            <Button variant="hero" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tesla-red/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-tesla-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-tesla-red bg-tesla-red/10 rounded-full border border-tesla-red/20">
              About Tesla Stock
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Democratizing Access to <span className="text-gradient">Tesla Investments</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to make Tesla stock accessible to everyone, empowering individuals worldwide to participate in the electric vehicle revolution.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</p>
                <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-electric-blue bg-electric-blue/10 rounded-full border border-electric-blue/20">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Empowering the Next Generation of Investors
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Tesla Stock was founded with a simple yet powerful vision: to break down the barriers that prevent ordinary people from investing in one of the world's most innovative companies.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We believe that everyone should have the opportunity to benefit from Tesla's revolutionary growth, regardless of their location, experience, or initial capital.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-5 h-5 text-tesla-red" />
                  Licensed & Regulated
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-5 h-5 text-electric-blue" />
                  Instant Transactions
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-tesla-red/20 to-electric-blue/20 rounded-3xl blur-3xl" />
              <img 
                src={elonImage} 
                alt="Tesla Innovation" 
                className="relative rounded-3xl border border-border shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-background via-slate-900/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-tesla-red bg-tesla-red/10 rounded-full border border-tesla-red/20">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 hover:border-tesla-red/50 transition-all duration-300 group">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-tesla-red/20 to-electric-blue/20 mb-4 group-hover:scale-110 transition-transform">
                  <value.icon className="w-6 h-6 text-tesla-red" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-tesla-red/20 via-card to-electric-blue/20 rounded-3xl p-12 text-center border border-border">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Start Investing?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of investors who are already capitalizing on Tesla's growth.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Tesla Stock. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
