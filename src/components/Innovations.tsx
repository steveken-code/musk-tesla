import { Card } from "@/components/ui/card";
import { Battery, Cpu, Globe, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Innovations = () => {
  const { t } = useLanguage();

  const innovations = [
    {
      icon: Battery,
      titleKey: "innovationBattery",
      descKey: "innovationBatteryDesc",
      statKey: "innovationBatteryStat",
    },
    {
      icon: Cpu,
      titleKey: "innovationAI",
      descKey: "innovationAIDesc",
      statKey: "innovationAIStat",
    },
    {
      icon: Globe,
      titleKey: "innovationSupercharger",
      descKey: "innovationSuperchargerDesc",
      statKey: "innovationSuperchargerStat",
    },
    {
      icon: Rocket,
      titleKey: "innovationSpaceX",
      descKey: "innovationSpaceXDesc",
      statKey: "innovationSpaceXStat",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-32 bg-navy relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {t('innovationsTitle')}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('innovationsSubtitle')}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          {innovations.map((innovation, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card 
                className="p-8 bg-navy-light border border-white/10 hover:border-tesla-red/30 transition-all duration-300 hover:shadow-xl group"
              >
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-electric-blue/10 rounded-xl group-hover:bg-electric-blue/20 transition-colors">
                    <innovation.icon className="w-8 h-8 text-electric-blue" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white">{t(innovation.titleKey)}</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {t(innovation.descKey)}
                </p>
                
                <div className="pt-4 border-t border-white/10">
                  <span className="text-electric-blue font-bold">{t(innovation.statKey)}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Innovations;
