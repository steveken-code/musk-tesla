import { Shield, Zap, Smartphone, TrendingUp, Clock, HeadphonesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      titleKey: 'featureSecurity',
      descKey: 'featureSecurityDesc',
    },
    {
      icon: Zap,
      titleKey: 'featureInstant',
      descKey: 'featureInstantDesc',
    },
    {
      icon: Smartphone,
      titleKey: 'featureMobile',
      descKey: 'featureMobileDesc',
    },
    {
      icon: TrendingUp,
      titleKey: 'featureAnalytics',
      descKey: 'featureAnalyticsDesc',
    },
    {
      icon: Clock,
      titleKey: 'featureWithdrawals',
      descKey: 'featureWithdrawalsDesc',
    },
    {
      icon: HeadphonesIcon,
      titleKey: 'featureSupport',
      descKey: 'featureSupportDesc',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="features" className="py-24 md:py-32 bg-navy relative overflow-hidden scroll-mt-20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-tesla-red font-semibold text-sm uppercase tracking-widest mb-4">
            {t('whyChooseUs')}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('featuresTitle')}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            {t('featuresSubtitle')}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={cardVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group bg-navy-light border border-white/10 rounded-2xl p-8 h-full cursor-pointer hover:shadow-xl hover:border-tesla-red/30 transition-all duration-300"
            >
              <motion.div 
                className="w-14 h-14 rounded-xl bg-tesla-red/10 flex items-center justify-center mb-6 group-hover:bg-tesla-red/20 transition-colors"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <feature.icon className="w-7 h-7 text-tesla-red" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {t(feature.descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
