import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import elonCeo from "@/assets/elon-ceo.jpeg";
import { motion } from "framer-motion";

const Vision = () => {
  const { t } = useLanguage();

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden bg-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
              {t('visionTitle') || 'The Vision'}
            </h2>
            <p className="text-lg md:text-xl text-slate-600">
              {t('visionSubtitle') || 'Why Elon Musk is betting everything on sustainable energy'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Card className="p-6 md:p-8 lg:p-12 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg group transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-tesla-red/50 group-hover:border-tesla-red transition-colors duration-500">
                    <img 
                      src={elonCeo} 
                      alt="Elon Musk" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-tesla-red rounded-full p-2">
                    <Quote className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <blockquote className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-slate-800 mb-6 italic">
                    "{t('ceoQuote') || 'The future we\'re building is one where sustainable transport isn\'t just an option—it\'s the only way forward.'}"
                  </blockquote>
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="h-1 w-16 md:w-20 bg-gradient-to-r from-tesla-red to-electric-blue rounded-full"></div>
                    <div>
                      <p className="font-bold text-base md:text-lg text-slate-900">Elon Musk</p>
                      <p className="text-slate-500 text-sm">CEO, Tesla & SpaceX</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-12">
            {[
              { title: t('sustainableEnergy') || "Sustainable Energy", desc: t('sustainableEnergyDesc') || "Accelerating the world's transition to renewable energy" },
              { title: t('autonomousFuture') || "Autonomous Future", desc: t('autonomousFutureDesc') || "Full self-driving technology changing transportation" },
              { title: t('globalScale') || "Global Scale", desc: t('globalScaleDesc') || "Manufacturing excellence with Gigafactories worldwide" },
            ].map((item, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card className="p-5 md:p-6 bg-slate-50 border border-slate-200 h-full group hover:shadow-lg hover:border-tesla-red/30 transition-all duration-300">
                  <h3 className="text-lg md:text-xl font-bold mb-2 text-tesla-red">{item.title}</h3>
                  <p className="text-slate-600 text-sm md:text-base">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
