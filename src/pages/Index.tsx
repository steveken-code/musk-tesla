import { useState } from 'react';
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Vision from "@/components/Vision";
import Innovations from "@/components/Innovations";
import Investment from "@/components/Investment";
import SupportButtons from "@/components/SupportButtons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import StockGrowthChart from "@/components/StockGrowthChart";
import LoadingScreen from "@/components/LoadingScreen";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import { InvestmentNotification } from "@/components/InvestmentNotification";
import StockMarketWidget from "@/components/StockMarketWidget";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      {/* Tesla Stock Widget Section */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <StockMarketWidget />
          </div>
        </div>
      </section>
      <Features />
      <Metrics />
      <StockGrowthChart />
      <HowItWorks />
      <Vision />
      <Innovations />
      <Testimonials />
      <FAQ />
      <Investment />
      <Footer />
      <SupportButtons />
      <InvestmentNotification />
    </div>
  );
};

export default Index;