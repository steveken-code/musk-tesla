import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

const reasons = [
  "Market leader in EV industry with 20%+ market share",
  "Vertically integrated manufacturing reducing costs",
  "Growing energy storage and solar business",
  "Expanding AI and autonomous driving capabilities",
  "Strong brand loyalty and customer satisfaction",
  "Global expansion with new Gigafactories",
];

const Investment = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Invest in Tesla?
            </h2>
            <p className="text-xl text-muted-foreground">
              Six compelling reasons to consider Tesla for your portfolio
            </p>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-card border-border/50 mb-12 animate-slide-up">
            <div className="space-y-4 mb-8">
              {reasons.map((reason, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg text-foreground">{reason}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-border/50">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="group">
                  Get Started Today
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="hero-outline" size="lg">
                  Download Prospectus
                </Button>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Investment involves risk. Past performance does not guarantee future results. 
            This is not financial advice. Please consult with a qualified financial advisor.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Investment;
