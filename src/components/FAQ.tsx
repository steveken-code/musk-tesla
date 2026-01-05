import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const FAQ = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      questionKey: 'faqQuestion1',
      answerKey: 'faqAnswer1',
    },
    {
      questionKey: 'faqQuestion2',
      answerKey: 'faqAnswer2',
    },
    {
      questionKey: 'faqQuestion3',
      answerKey: 'faqAnswer3',
    },
    {
      questionKey: 'faqQuestion4',
      answerKey: 'faqAnswer4',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section id="faq" className="py-20 md:py-32 bg-navy">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-tesla-red bg-tesla-red/10 rounded-full border border-tesla-red/20">
            {t('support')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            {t('faqTitle')} <span className="text-tesla-red">{t('faqTitleHighlight')}</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            {t('faqSubtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-navy-light border border-white/10 rounded-xl px-6 transition-all duration-300 ease-in-out data-[state=open]:border-[#ff4d4d]/60 data-[state=open]:shadow-[0_0_12px_rgba(255,77,77,0.15)] hover:border-[#ff4d4d]/40 hover:bg-navy-light/80"
                >
                  <AccordionTrigger className="text-left text-white hover:text-tesla-red py-6 hover:no-underline text-lg font-medium">
                    {t(faq.questionKey)}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400 pb-6 text-base leading-relaxed">
                    {t(faq.answerKey)}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
