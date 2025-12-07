import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Vision from "@/components/Vision";
import Innovations from "@/components/Innovations";
import Investment from "@/components/Investment";
import WhatsAppButton from "@/components/WhatsAppButton";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      <Hero />
      <Metrics />
      <Vision />
      <Innovations />
      <Investment />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
