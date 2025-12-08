import { useState } from 'react';
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Vision from "@/components/Vision";
import Innovations from "@/components/Innovations";
import Investment from "@/components/Investment";
import WhatsAppButton from "@/components/WhatsAppButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import StockGrowthChart from "@/components/StockGrowthChart";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Metrics />
      <StockGrowthChart />
      <Vision />
      <Innovations />
      <Testimonials />
      <Investment />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
