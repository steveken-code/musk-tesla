import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Vision from "@/components/Vision";
import Innovations from "@/components/Innovations";
import Investment from "@/components/Investment";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Metrics />
      <Vision />
      <Innovations />
      <Investment />
    </div>
  );
};

export default Index;
