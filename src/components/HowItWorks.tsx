import { UserPlus, CreditCard, LineChart, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      step: 1,
      icon: UserPlus,
      titleKey: 'howStep1Title',
      descKey: 'howStep1Desc',
    },
    {
      step: 2,
      icon: CreditCard,
      titleKey: 'howStep2Title',
      descKey: 'howStep2Desc',
    },
    {
      step: 3,
      icon: LineChart,
      titleKey: 'howStep3Title',
      descKey: 'howStep3Desc',
    },
    {
      step: 4,
      icon: Wallet,
      titleKey: 'howStep4Title',
      descKey: 'howStep4Desc',
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
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-white relative scroll-mt-20">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-tesla-red font-semibold text-sm uppercase tracking-widest mb-4">
            {t('gettingStarted')}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {t('howItWorks')}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            {t('howItWorksSubtitle')}
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-tesla-red/30 transition-all duration-300"
              >
                {/* Step number */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-tesla-red to-tesla-red/70 flex items-center justify-center shadow-lg shadow-tesla-red/20">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="text-tesla-red font-bold text-sm mb-2">
                  {t('step')} {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t(item.descKey)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
